#include "exchange/binance_exchange.h"
#include "config/config.h"
#include <nlohmann/json.hpp>
#include <openssl/hmac.h>
#include <openssl/sha.h>
#include <sstream>
#include <iomanip>
#include <ctime>

using json = nlohmann::json;

size_t BinanceExchange::writeCallback(void* contents, size_t size, size_t nmemb, std::string* userp) {
    userp->append((char*)contents, size * nmemb);
    return size * nmemb;
}

BinanceExchange::BinanceExchange(const std::string& api_key, const std::string& api_secret, bool testnet)
    : api_key_(api_key), api_secret_(api_secret), testnet_(testnet), connected_(false) {
    
    if (testnet) {
        base_url_ = "https://testnet.binance.vision/api/v3";
    } else {
        base_url_ = "https://api.binance.com/api/v3";
    }
    std::cout << "[Binance] Initialized with " << (testnet ? "TESTNET" : "MAINNET") << " URL: " << base_url_ << std::endl;
}

BinanceExchange::~BinanceExchange() {
    disconnect();
}

void BinanceExchange::connect() {
    std::cout << "[Binance] Connecting to exchange..." << std::endl;
    
    // Test connection by getting server time
    CURL* curl = curl_easy_init();
    if (!curl) {
        std::cerr << "[Binance] Failed to initialize CURL" << std::endl;
        return;
    }

    std::string url = base_url_ + "/time";
    std::string response;
    
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5L);
    
    CURLcode res = curl_easy_perform(curl);
    
    if (res != CURLE_OK) {
        std::cerr << "[Binance] Connection failed: " << curl_easy_strerror(res) << std::endl;
        curl_easy_cleanup(curl);
        connected_ = false;
        return;
    }

    try {
        json resp = json::parse(response);
        if (resp.contains("serverTime")) {
            connected_ = true;
            std::cout << "[Binance] ✓ Connected successfully" << std::endl;
        }
    } catch (const std::exception& e) {
        std::cerr << "[Binance] Failed to parse response: " << e.what() << std::endl;
        connected_ = false;
    }
    
    curl_easy_cleanup(curl);
}

void BinanceExchange::disconnect() {
    std::cout << "[Binance] Disconnecting..." << std::endl;
    connected_ = false;
}

bool BinanceExchange::isConnected() const {
    return connected_;
}

std::string BinanceExchange::generateSignature(const std::string& query_string) {
    unsigned char hash[EVP_MAX_MD_SIZE];
    unsigned int hash_len = 0;
    
    HMAC(EVP_sha256(), 
         (unsigned char*)api_secret_.c_str(), api_secret_.length(),
         (unsigned char*)query_string.c_str(), query_string.length(),
         hash, &hash_len);
    
    std::stringstream ss;
    for (unsigned int i = 0; i < hash_len; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
    }
    return ss.str();
}

void BinanceExchange::sendOrder(const OrderRequest& order) {
    if (!connected_) {
        std::cerr << "[Binance] Not connected to exchange" << std::endl;
        notifyResponse(order.order_id, "FAILED", "Not connected to exchange");
        return;
    }

    CURL* curl = curl_easy_init();
    if (!curl) {
        std::cerr << "[Binance] Failed to initialize CURL for order" << std::endl;
        notifyResponse(order.order_id, "ERROR", "CURL initialization failed");
        return;
    }

    // Build query string with timestamp and signature
    auto now = std::chrono::system_clock::now();
    auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
    
    std::stringstream query;
    query << "symbol=" << order.symbol
          << "&side=" << order.side
          << "&type=LIMIT"
          << "&timeInForce=GTC"
          << "&quantity=" << order.quantity
          << "&price=" << std::fixed << std::setprecision(2) << order.price
          << "&timestamp=" << timestamp;

    std::string signature = generateSignature(query.str());
    query << "&signature=" << signature;

    std::string url = base_url_ + "/order?" + query.str();
    std::string response;
    
    // Set up headers
    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/x-www-form-urlencoded");
    std::string auth_header = "X-MBX-APIKEY: " + api_key_;
    headers = curl_slist_append(headers, auth_header.c_str());
    
    std::cout << "[Binance] Sending order: " << order.symbol << " " << order.side 
              << " " << order.quantity << " @ " << order.price << std::endl;
    
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POST, 1L);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5L);
    
    CURLcode res = curl_easy_perform(curl);
    
    if (res != CURLE_OK) {
        std::cerr << "[Binance] Request failed: " << curl_easy_strerror(res) << std::endl;
        notifyResponse(order.order_id, "ERROR", std::string("Request failed: ") + curl_easy_strerror(res));
    } else {
        processOrderResponse(response, order);
    }
    
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
}

void BinanceExchange::processOrderResponse(const nlohmann::json& response, const OrderRequest& original_order) {
    try {
        if (response.contains("code")) {
            // Error response
            std::string error_msg = response.value("msg", "Unknown error");
            std::cout << "[Binance] Order error: " << error_msg << std::endl;
            notifyResponse(original_order.order_id, "REJECTED", error_msg);
        } else if (response.contains("orderId")) {
            // Success response
            std::string binance_order_id = std::to_string(response["orderId"].get<long>());
            std::string status = response.value("status", "");
            std::cout << "[Binance] ✓ Order placed successfully" << std::endl;
            std::cout << "  Binance Order ID: " << binance_order_id << std::endl;
            std::cout << "  Status: " << status << std::endl;
            notifyResponse(original_order.order_id, "ACCEPTED", "Order ID: " + binance_order_id);
        } else {
            std::cerr << "[Binance] Unexpected response format" << std::endl;
            notifyResponse(original_order.order_id, "ERROR", "Unexpected response format");
        }
    } catch (const std::exception& e) {
        std::cerr << "[Binance] Error parsing response: " << e.what() << std::endl;
        notifyResponse(original_order.order_id, "ERROR", std::string("Parse error: ") + e.what());
    }
}

json BinanceExchange::parseResponse(const std::string& response) {
    try {
        return json::parse(response);
    } catch (...) {
        return json::object();
    }
}
