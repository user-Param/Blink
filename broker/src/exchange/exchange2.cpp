#include "exchange/exchange2.h"
#include <iostream>
#include <chrono>
#include <thread>
#include <string_view>

// ── Static mint map ────────────────────────────────────────────────────────
const std::unordered_map<std::string, std::string> Exchange2::SYMBOL_TO_MINT = {
    {"SOL",      "So11111111111111111111111111111111111111112"},
    {"SOL-PERP", "So11111111111111111111111111111111111111112"},
    {"BTC",      "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"},
    {"BTC-PERP", "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"},
    {"ETH",      "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"},
    {"ETH-PERP", "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"},
};

// ── Constructor / Destructor ───────────────────────────────────────────────
Exchange2::Exchange2() {
    ctx_.set_verify_mode(ssl::verify_none);
}

Exchange2::~Exchange2() {
    running_   = false;
    connected_ = false;
    if (stream_thread_.joinable()) stream_thread_.join();
}

// ── connect() ─────────────────────────────────────────────────────────────
//  Mirrors Exchange1::connect() — establishes and holds a persistent
//  SSL/TCP stream to api.jup.ag (same pattern as Exchange1's WS connect).
void Exchange2::connect() {
    if (connected_) return;

    try {
        tcp::resolver resolver(ioc_);
        auto const results = resolver.resolve(host_, port_);

        stream_ = std::make_unique<beast::ssl_stream<beast::tcp_stream>>(ioc_, ctx_);

        // SNI — required by Jupiter's CDN
        if (!SSL_set_tlsext_host_name(stream_->native_handle(), host_.c_str())) {
            throw beast::system_error(
                beast::error_code(static_cast<int>(::ERR_get_error()),
                                  net::error::get_ssl_category()));
        }

        beast::get_lowest_layer(*stream_).connect(results);
        stream_->handshake(ssl::stream_base::client);

        connected_ = true;
        running_   = true;

        std::cout << "[JUPITER] HFT Persistent Stream Connected" << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "[JUPITER] Connection failed: " << e.what() << std::endl;
    }
}

// ── subscribe() ───────────────────────────────────────────────────────────
//  Same signature as Exchange1::subscribe().
//  Stores symbol list and spins up stream_loop (analogous to Exchange1's
//  reader_thread_ spawned after the WebSocket handshake).
void Exchange2::subscribe(const std::vector<std::string>& symbols) {
    if (!connected_) {
        std::cerr << "[JUPITER] Not connected. Call connect() first." << std::endl;
        return;
    }

    {
        std::lock_guard<std::mutex> lock(symbols_mutex_);
        subscribed_symbols_ = symbols;
    }

    if (!stream_thread_.joinable()) {
        stream_thread_ = std::thread(&Exchange2::stream_loop, this);
    }
}

// ── set_callback() ────────────────────────────────────────────────────────
void Exchange2::set_callback(PriceCallback callback) {
    callback_ = std::move(callback);
}

// ── stream_loop() ─────────────────────────────────────────────────────────
//  Runs on stream_thread_.  Iterates over subscribed symbols, fires one
//  HTTP GET per symbol, parses JSON, and invokes the price callback.
//  Mirrors the while-loop pattern inside Exchange1's read_loop().
void Exchange2::stream_loop() {
    while (running_ && connected_) {
        // Snapshot symbol list under lock (same mutex pattern as Exchange1)
        std::vector<std::string> symbols;
        {
            std::lock_guard<std::mutex> lock(symbols_mutex_);
            symbols = subscribed_symbols_;
        }

        for (const auto& symbol : symbols) {
            auto it = SYMBOL_TO_MINT.find(symbol);
            if (it == SYMBOL_TO_MINT.end()) {
                std::cerr << "[JUPITER] Unknown symbol: " << symbol << std::endl;
                continue;
            }
            const std::string& mint = it->second;

            try {
                // Build HTTP request  (analogous to Exchange1's ws_.read())
                http::request<http::empty_body> req{
                    http::verb::get,
                    "/v1/market-stats?mint=" + mint,
                    11
                };
                req.set(http::field::host,       host_);
                req.set(http::field::user_agent,  "ArbBot/1.0");
                req.set(http::field::connection,  "keep-alive");

                http::write(*stream_, req);

                beast::flat_buffer              buffer;
                http::response<http::string_body> res;
                http::read(*stream_, buffer, res);

                if (res.result() == http::status::ok) {
                    fast_parse_and_callback(res.body(), symbol);
                } else {
                    std::cerr << "[JUPITER] API Error: " << res.result_int()
                              << " for " << symbol << std::endl;
                }
            } catch (const std::exception& e) {
                std::cerr << "[JUPITER] Stream loop error: " << e.what() << std::endl;
                connected_ = false;   // same break-on-error as Exchange1
                break;
            }
        }

        // 100 ms throttle — matches Exchange1's inter-message cadence
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    std::cout << "[JUPITER] Stream loop ended" << std::endl;
}

// ── fast_parse_and_callback() ─────────────────────────────────────────────
//  Zero-allocation JSON extraction then fires the same PriceCallback that
//  Exchange1's read_loop() fires after parsing the Binance ticker frame.
void Exchange2::fast_parse_and_callback(const std::string& body,
                                        const std::string& symbol) {
    std::string_view msg(body);

    // Extract "price":"<value>"
    size_t pos = msg.find("\"price\":\"");
    if (pos == std::string_view::npos) return;

    size_t start = pos + 9;
    size_t end   = msg.find('"', start);
    if (end == std::string_view::npos) return;

    std::string_view price_str = msg.substr(start, end - start);

    // Simulated bid/ask spread using a 0.06 % fee factor
    // (Jupiter does not stream a live order book on the stats endpoint;
    //  real spread should come from /v4/quote or a dedicated OB feed.)
    constexpr double FEE_FACTOR = 0.0006;
    constexpr double BID_QTY    = 1500.0;
    constexpr double ASK_QTY    = 1000.0;

    try {
        double price = std::stod(std::string(price_str));

        // Invoke the same callback signature as Exchange1:
        //   void(symbol, price, bid, ask, timestamp)
        if (callback_) {
            long ts = std::chrono::duration_cast<std::chrono::milliseconds>(
                          std::chrono::system_clock::now().time_since_epoch())
                          .count();

            callback_(
                symbol,
                price,
                price * (1.0 - FEE_FACTOR),   // bid
                price * (1.0 + FEE_FACTOR),   // ask
                ts
            );
        }

        (void)BID_QTY; (void)ASK_QTY; // suppress unused-variable warnings
    } catch (const std::exception& e) {
        std::cerr << "[JUPITER] Parse error: " << e.what() << std::endl;
    }
}