// exchange1.cpp – Binance Exchange Implementation
#include "exchange/base_exchange.h"
#include "config/config.h"
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/ssl.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <openssl/hmac.h>
#include <openssl/sha.h>
#include <nlohmann/json.hpp>
#include <sstream>
#include <iomanip>
#include <chrono>
#include <iostream>

namespace beast = boost::beast;
namespace http = beast::http;
namespace net = boost::asio;
namespace ssl = net::ssl;
using tcp = net::ip::tcp;
using json = nlohmann::json;

// ----------------------------------------------------------------------
// Concrete BinanceExchange class (defined entirely in this .cpp)
class BinanceExchange : public BaseExchange {
public:
    BinanceExchange(const std::string& api_key, const std::string& api_secret, bool testnet);
    ~BinanceExchange() override = default;

    void connect() override;
    void disconnect() override;
    bool isConnected() const override;
    void sendOrder(const OrderRequest& order) override;
    std::string getId() const override { return "binance"; }
    json getAccountInfo() override;
    json getTradeHistory(const std::string& symbol = "") override;

private:
    std::string api_key_;
    std::string api_secret_;
    bool testnet_;
    std::string host_;
    std::string base_url_;

    net::io_context ioc_;
    ssl::context ssl_ctx_{ssl::context::tlsv12_client};

    std::string generateSignature(const std::string& query_string);
    json httpRequest(http::verb method, const std::string& path,
                     const std::string& query = "", bool needs_auth = true);
    void processOrderResponse(const json& response, const OrderRequest& original_order);
};

// ----------------------------------------------------------------------
// Helper: URL encode
static std::string urlEncode(const std::string& value) {
    std::ostringstream escaped;
    escaped.fill('0');
    escaped << std::hex;
    for (char c : value) {
        if (isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~') {
            escaped << c;
        } else {
            escaped << std::uppercase;
            escaped << '%' << std::setw(2) << int(static_cast<unsigned char>(c));
            escaped << std::nouppercase;
        }
    }
    return escaped.str();
}

// ----------------------------------------------------------------------
// BinanceExchange Implementation
BinanceExchange::BinanceExchange(const std::string& api_key, const std::string& api_secret, bool testnet)
    : api_key_(api_key), api_secret_(api_secret), testnet_(testnet) {
    if (testnet) {
        host_ = "testnet.binance.vision";
        base_url_ = "/api/v3";
    } else {
        host_ = "api.binance.com";
        base_url_ = "/api/v3";
    }
    std::cout << "[Binance] Initialized " << (testnet ? "TESTNET" : "MAINNET") << std::endl;
}

void BinanceExchange::connect() {
    json resp = httpRequest(http::verb::get, "/time", "", false);
    if (!resp.is_null() && resp.contains("serverTime")) {
        connected_ = true;
        std::cout << "[Binance] Connected" << std::endl;
    } else {
        std::cerr << "[Binance] Connection failed" << std::endl;
        connected_ = false;
    }
}

void BinanceExchange::disconnect() {
    connected_ = false;
}

bool BinanceExchange::isConnected() const {
    return connected_;
}

std::string BinanceExchange::generateSignature(const std::string& query_string) {
    unsigned char hash[EVP_MAX_MD_SIZE];
    unsigned int hash_len = 0;
    HMAC(EVP_sha256(),
         reinterpret_cast<const unsigned char*>(api_secret_.c_str()), api_secret_.length(),
         reinterpret_cast<const unsigned char*>(query_string.c_str()), query_string.length(),
         hash, &hash_len);
    std::stringstream ss;
    for (unsigned int i = 0; i < hash_len; ++i)
        ss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(hash[i]);
    return ss.str();
}

json BinanceExchange::httpRequest(http::verb method, const std::string& path,
                                  const std::string& query, bool needs_auth) {
    try {
        tcp::resolver resolver(ioc_);
        auto const results = resolver.resolve(host_, "443");
        ssl::stream<tcp::socket> stream(ioc_, ssl_ctx_);
        beast::error_code ec;

        net::connect(stream.next_layer(), results.begin(), results.end(), ec);
        if (ec) return {};
        stream.handshake(ssl::stream_base::client, ec);
        if (ec) return {};

        std::string target = base_url_ + path;
        if (!query.empty()) target += "?" + query;

        http::request<http::string_body> req{method, target, 11};
        req.set(http::field::host, host_);
        req.set(http::field::user_agent, "BLINK/1.0");
        if (needs_auth) req.set("X-MBX-APIKEY", api_key_);
        if (method == http::verb::post) {
            req.set(http::field::content_type, "application/x-www-form-urlencoded");
            req.body() = query;
            req.prepare_payload();
        }

        http::write(stream, req, ec);
        if (ec) return {};
        beast::flat_buffer buffer;
        http::response<http::string_body> res;
        http::read(stream, buffer, res, ec);
        if (ec) return {};
        stream.shutdown(ec);
        return json::parse(res.body());
    } catch (...) {
        return {};
    }
}

void BinanceExchange::sendOrder(const OrderRequest& order) {
    if (!connected_) {
        notifyResponse(order.order_id, "FAILED", "Not connected");
        return;
    }

    auto now = std::chrono::system_clock::now();
    auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();

    std::ostringstream query;
    query << "symbol=" << order.symbol
          << "&side=" << order.side
          << "&type=" << order.type
          << "&quantity=" << order.quantity
          << "&timestamp=" << timestamp;
    
    if (order.type == "LIMIT") {
        query << "&timeInForce=GTC"
              << "&price=" << std::fixed << std::setprecision(2) << order.price;
    }

    std::string signature = generateSignature(query.str());
    query << "&signature=" << signature;

    json response = httpRequest(http::verb::post, "/order", query.str(), true);
    if (response.is_null()) {
        notifyResponse(order.order_id, "ERROR", "HTTP request failed");
        return;
    }
    processOrderResponse(response, order);
}

void BinanceExchange::processOrderResponse(const json& response, const OrderRequest& original_order) {
    try {
        if (response.contains("code")) {
            std::string err = response.value("msg", "Unknown error");
            notifyResponse(original_order.order_id, "REJECTED", err);
        } else if (response.contains("orderId")) {
            std::string binance_id = std::to_string(response["orderId"].get<long long>());
            notifyResponse(original_order.order_id, "ACCEPTED", "Order ID: " + binance_id);
        } else {
            notifyResponse(original_order.order_id, "ERROR", "Unexpected response");
        }
    } catch (const std::exception& e) {
        notifyResponse(original_order.order_id, "ERROR", std::string("Parse error: ") + e.what());
    }
}

json BinanceExchange::getAccountInfo() {
    if (!connected_) return {};
    auto now = std::chrono::system_clock::now();
    auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
    std::string query = "timestamp=" + std::to_string(timestamp);
    std::string signature = generateSignature(query);
    query += "&signature=" + signature;
    return httpRequest(http::verb::get, "/account", query, true);
}

json BinanceExchange::getTradeHistory(const std::string& symbol) {
    if (!connected_) return {};
    auto now = std::chrono::system_clock::now();
    auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
    
    std::string query_symbol = symbol.empty() ? "BTCUSDT" : symbol;
    std::ostringstream query;
    query << "symbol=" << query_symbol
          << "&timestamp=" << timestamp;
    
    std::string signature = generateSignature(query.str());
    query << "&signature=" << signature;
    
    return httpRequest(http::verb::get, "/myTrades", query.str(), true);
}

// ----------------------------------------------------------------------
// Factory function (only declaration needed in header, definition here)
std::unique_ptr<BaseExchange> createExchange(const std::string& exchange_id) {
    auto& config = Config::getInstance();
    if (exchange_id == "binance") {
        std::string key = config.get("BINANCE_API_KEY", "");
        std::string secret = config.get("BINANCE_API_SECRET", "");
        bool testnet = config.getBool("BINANCE_TESTNET", true);
        return std::make_unique<BinanceExchange>(key, secret, testnet);
    }
    // Future: else if (exchange_id == "coinbase") ...
    return nullptr;
}