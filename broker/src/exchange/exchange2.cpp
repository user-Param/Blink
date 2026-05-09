#include "exchange/exchange2.h"
#include <iostream>
#include <chrono>
#include <thread>
#include <string_view>

const std::unordered_map<std::string, std::string> Exchange2::SYMBOL_TO_MINT = {
    {"SOL",      "So11111111111111111111111111111111111111112"},
    {"SOL-PERP", "So11111111111111111111111111111111111111112"},
    {"BTC",      "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"},
    {"BTC-PERP", "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"},
    {"ETH",      "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"},
    {"ETH-PERP", "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"},
};

Exchange2::Exchange2() {
    ctx_.set_verify_mode(ssl::verify_none);
}

Exchange2::~Exchange2() {
    running_   = false;
    connected_ = false;
    if (stream_thread_.joinable()) stream_thread_.join();
}

// connect() can be kept for symmetry – no‑op is fine
void Exchange2::connect() {
    // Jupiter doesn't need a persistent connection; connect is a no‑op
    connected_ = true;
    running_   = true;
    std::cout << "[JUPITER] HFT adapter ready (REST polling)" << std::endl;
}

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

void Exchange2::set_callback(PriceCallback callback) {
    callback_ = std::move(callback);
}

// ── core polling loop – fresh connection every request ──────────────────
void Exchange2::stream_loop() {
    while (running_ && connected_) {
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
                // 1️⃣ Fresh I/O context + SSL stream per request
                net::io_context ioc;
                ssl::context ctx{ssl::context::tlsv12_client};
                ctx.set_verify_mode(ssl::verify_none);

                beast::ssl_stream<beast::tcp_stream> stream(ioc, ctx);

                if (!SSL_set_tlsext_host_name(stream.native_handle(), host_.c_str())) {
                    continue; // SNI failed, skip this symbol
                }

                tcp::resolver resolver(ioc);
                auto const results = resolver.resolve(host_, port_);
                beast::get_lowest_layer(stream).connect(results);
                stream.handshake(ssl::stream_base::client);

                // 2️⃣ Build and send GET
                http::request<http::empty_body> req{
                    http::verb::get,
                    "/v1/market-stats?mint=" + mint,
                    11
                };
                req.set(http::field::host,       host_);
                req.set(http::field::user_agent,  "ArbBot/1.0");
                req.set(http::field::connection,  "close");

                http::write(stream, req);

                // 3️⃣ Read response
                beast::flat_buffer              buffer;
                http::response<http::string_body> res;
                http::read(stream, buffer, res);

                // Graceful shutdown
                beast::error_code ec;
                stream.shutdown(ec);
                // ignore eof (normal)

                if (res.result() == http::status::ok) {
                    fast_parse_and_callback(res.body(), symbol);
                } else {
                    std::cerr << "[JUPITER] HTTP " << res.result_int()
                              << " for " << symbol << std::endl;
                }
            } catch (const std::exception& e) {
                std::cerr << "[JUPITER] Request failed for " << symbol
                          << ": " << e.what() << std::endl;
                // ✅ Do NOT set connected_=false – retry next cycle
            }
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    std::cout << "[JUPITER] Stream loop ended" << std::endl;
}

// ── unchanged fast_parse ───────────────────────────────────────────────
void Exchange2::fast_parse_and_callback(const std::string& body,
                                        const std::string& symbol) {
    std::string_view msg(body);

    size_t pos = msg.find("\"price\":\"");
    if (pos == std::string_view::npos) return;

    size_t start = pos + 9;
    size_t end   = msg.find('"', start);
    if (end == std::string_view::npos) return;

    std::string_view price_str = msg.substr(start, end - start);

    constexpr double FEE_FACTOR = 0.0006;

    try {
        double price = std::stod(std::string(price_str));

        if (callback_) {
            long ts = std::chrono::duration_cast<std::chrono::milliseconds>(
                          std::chrono::system_clock::now().time_since_epoch())
                          .count();
            callback_(symbol, price, price * (1.0 - FEE_FACTOR), price * (1.0 + FEE_FACTOR), ts);
        }
    } catch (const std::exception& e) {
        std::cerr << "[JUPITER] Parse error: " << e.what() << std::endl;
    }
}