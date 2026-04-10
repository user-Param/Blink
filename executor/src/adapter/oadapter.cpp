#include "adapter/oadapter.h"
#include "exchange/base_exchange.h"
#include <iostream>
#include <memory>
#include <ctime>
#include <iomanip>
#include <algorithm>
#include <chrono>

std::unique_ptr<BaseExchange> createBinanceExchange();

OAdapter::OAdapter() {}

OAdapter::~OAdapter() {
    stop();
}

void OAdapter::setExchange(const std::string& exchange_id) {
    exchange_id_ = exchange_id;

    if (exchange_id == "binance") {
        exchange_ = createBinanceExchange();
    } else {
        std::cerr << "[OAdapter] Unknown exchange: " << exchange_id << std::endl;
        return;
    }

    // Set callback to receive order responses from exchange
    exchange_->setCallback([this](const std::string& order_id,
                                   const std::string& status,
                                   const std::string& message) {
        auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()).count();
        
        //std::cout << "[OAdapter] Order Response: " << order_id << " | Status: " << status << " | " << message << std::endl;
        
        // Look up the original order to get all details
        if (pending_orders_.count(order_id)) {
            auto& pending = pending_orders_[order_id];
            OrderResult result{
                pending.order_id,
                pending.strategy_id,
                pending.symbol,
                pending.side,
                pending.quantity,
                pending.price,
                status,
                order_id,
                message,
                (uint64_t)timestamp
            };
            broadcastOrderResult(result);
            pending_orders_.erase(order_id);
        }
    });
}

void OAdapter::registerStrategy(const std::string& strategy_id) {
    auto it = std::find(active_strategies_.begin(), active_strategies_.end(), strategy_id);
    if (it == active_strategies_.end()) {
        active_strategies_.push_back(strategy_id);
        std::cout << "[OAdapter] Strategy registered: " << strategy_id << std::endl;
    }
}

void OAdapter::unregisterStrategy(const std::string& strategy_id) {
    auto it = std::find(active_strategies_.begin(), active_strategies_.end(), strategy_id);
    if (it != active_strategies_.end()) {
        active_strategies_.erase(it);
        std::cout << "[OAdapter] Strategy unregistered: " << strategy_id << std::endl;
    }
}

void OAdapter::onOrderSignal(const OrderRequest& order) {
    // std::cout << "\n[OAdapter] 📤 Order from Strategy[" << order.strategy_id << "]: "
    //           << order.symbol << " " << order.side << " " << order.quantity
    //           << " @ $" << order.price << std::endl;

    // Store pending order
    OrderResult pending{
        order.order_id,
        order.strategy_id,
        order.symbol,
        order.side,
        order.quantity,
        order.price,
        "PENDING",
        "",
        "Waiting for exchange response",
        order.timestamp
    };
    pending_orders_[order.order_id] = pending;
    
    sendOrder(order);
}

void OAdapter::run() {
    if (!exchange_) {
        std::cerr << "[OAdapter] ❌ No exchange set. Call setExchange() first." << std::endl;
        return;
    }

    exchange_->connect();
    if (!exchange_->isConnected()) {
        std::cerr << "[OAdapter] ❌ Failed to connect to exchange: " << exchange_id_ << std::endl;
        return;
    }

    running_ = true;
    startServer();
    std::cout << "[OAdapter] ✓ Listening for orders from Engine on port " << port_ << std::endl;
}

void OAdapter::stop() {
    running_ = false;
    if (acceptor_) {
        acceptor_->close();
    }
    ioc_.stop();
    for(auto& t : serverThreads_) {
        if(t.joinable()) t.join();
    }
    if (exchange_) {
        exchange_->disconnect();
    }
    std::cout << "[OAdapter] ✓ Stopped" << std::endl;
}

void OAdapter::sendOrder(const OrderRequest& order) {
    if (exchange_ && exchange_->isConnected()) {
        exchange_->sendOrder(order);
    } else {
        std::cerr << "[OAdapter] Cannot send order - exchange not connected" << std::endl;
        OrderResult error_result{
            order.order_id,
            order.strategy_id,
            order.symbol,
            order.side,
            order.quantity,
            order.price,
            "ERROR",
            "",
            "Exchange not connected",
            order.timestamp
        };
        broadcastOrderResult(error_result);
    }
}

void OAdapter::broadcastOrderResult(const OrderResult& result) {
    // Format response for UI and Engine
    json result_msg = {
        {"type", "order_result"},
        {"order_id", result.order_id},
        {"strategy_id", result.strategy_id},
        {"symbol", result.symbol},
        {"side", result.side},
        {"quantity", result.quantity},
        {"price", result.price},
        {"status", result.status},
        {"exchange_order_id", result.exchange_order_id},
        {"message", result.message},
        {"timestamp", result.timestamp}
    };
    
    std::string response = result_msg.dump();
    //std::cout << "[OAdapter] Broadcasting result to " << ui_clients_.size() << " clients" << std::endl;
    
    // Broadcast to all connected UI clients
    {
        std::lock_guard<std::mutex> lock(ui_clients_mutex_);
        for (auto& client : ui_clients_) {
            try {
                if (client) {
                    client->write(net::buffer(response));
                }
            } catch (const std::exception& e) {
                std::cerr << "[OAdapter] Broadcast error: " << e.what() << std::endl;
            }
        }
    }
}

void OAdapter::startServer() {
    auto const address = net::ip::make_address(host_);
    auto const port = static_cast<unsigned short>(std::atoi(port_.c_str()));
    
    acceptor_ = std::make_unique<tcp::acceptor>(ioc_, tcp::endpoint{address, port});
    
    serverThreads_.emplace_back([this]() {
        acceptConnections();
    });
}

void OAdapter::acceptConnections() {
    while (running_) {
        try {
            tcp::socket socket(ioc_);
            acceptor_->accept(socket);
            
            std::thread([this, s = std::move(socket)]() mutable {
                handleSession(std::move(s));
            }).detach();
        } catch (const std::exception& e) {
            if (running_) std::cerr << "[OAdapter] Accept error: " << e.what() << std::endl;
        }
    }
}

void OAdapter::handleSession(tcp::socket socket) {
    auto ws_ptr = std::make_shared<websocket::stream<tcp::socket>>(std::move(socket));
    
    try {
        ws_ptr->accept();
        
        std::cout << "[OAdapter] ✓ Client connected" << std::endl;
        
        // Register this client for broadcasts
        {
            std::lock_guard<std::mutex> lock(ui_clients_mutex_);
            ui_clients_.push_back(ws_ptr);
        }

        while (running_) {
            try {
                beast::flat_buffer buffer;
                ws_ptr->read(buffer);

                std::string msg = beast::buffers_to_string(buffer.data());
                
                try {
                    auto j = json::parse(msg);

                    if (j.contains("type")) {
                        if (j["type"] == "order") {
                            OrderRequest order;
                            order.order_id = j.value("order_id", std::to_string(std::time(nullptr)));
                            order.symbol = j["symbol"];
                            order.price = j["price"];
                            order.quantity = j["quantity"];
                            order.side = j["side"];
                            order.type = j.value("order_type", "LIMIT");
                            order.timestamp = j.value("timestamp", (uint64_t)std::time(nullptr) * 1000);
                            order.strategy_id = j.value("strategy_id", "default");

                            this->onOrderSignal(order);
                            
                            // Send acknowledgement
                            json ack = {
                                {"status", "RECEIVED"},
                                {"order_id", order.order_id},
                                {"message", "Order received by executor"}
                            };
                            ws_ptr->write(net::buffer(ack.dump()));
                            
                        } else if (j["type"] == "get_account_info") {
                            // Get account info from exchange
                            if (exchange_) {
                                auto account_info = exchange_->getAccountInfo();
                                json response = {
                                    {"type", "account_info"},
                                    {"data", account_info}
                                };
                                ws_ptr->write(net::buffer(response.dump()));
                            } else {
                                json error = {
                                    {"type", "account_info"},
                                    {"error", "Exchange not initialized"}
                                };
                                ws_ptr->write(net::buffer(error.dump()));
                            }
                            
                        } else if (j["type"] == "register_strategy") {
                            std::string strategy_id = j.value("strategy_id", "");
                            this->registerStrategy(strategy_id);
                            
                            json ack = {
                                {"type", "strategy_registered"},
                                {"strategy_id", strategy_id}
                            };
                            ws_ptr->write(net::buffer(ack.dump()));
                            
                        } else if (j["type"] == "ping") {
                            json pong = {{"type", "pong"}};
                            ws_ptr->write(net::buffer(pong.dump()));
                        }
                    }
                } catch (const json::exception& e) {
                    std::cerr << "[OAdapter] JSON parse error: " << e.what() << std::endl;
                }
            } catch (const beast::system_error& se) {
                if (se.code() == websocket::error::closed) {
                    break; // Client disconnected
                }
                throw;
            }
        }
    } catch (const beast::system_error& se) {
        if (se.code() != websocket::error::closed) {
            std::cerr << "[OAdapter] Session error: " << se.code().message() << std::endl;
        }
    } catch (const std::exception& e) {
        std::cerr << "[OAdapter] Session exception: " << e.what() << std::endl;
    }
    
    // Unregister this client
    {
        std::lock_guard<std::mutex> lock(ui_clients_mutex_);
        ui_clients_.erase(
            std::remove(ui_clients_.begin(), ui_clients_.end(), ws_ptr),
            ui_clients_.end()
        );
    }
    
    std::cout << "[OAdapter] Client disconnected" << std::endl;
}
