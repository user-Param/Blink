#include "adapter/oadapter.h"
#include "exchange/base_exchange.h"
#include <iostream>
#include <memory>

// Include the exchange implementations
#include "../exchange/exchange1.cpp"   // provides createBinanceExchange()
// #include "../exchange/exchange2.cpp" // for Bybit, if available

OAdapter::OAdapter() {}

OAdapter::~OAdapter() {
    stop();
}

void OAdapter::setExchange(const std::string& exchange_id) {
    exchange_id_ = exchange_id;

    if (exchange_id == "binance") {
        exchange_ = createBinanceExchange();
    }
    // else if (exchange_id == "bybit") {
    //     exchange_ = createBybitExchange();
    // }
    else {
        std::cerr << "Unknown exchange: " << exchange_id << std::endl;
        return;
    }

    // Set callback to receive order responses
    exchange_->setCallback([](const std::string& order_id,
                              const std::string& status,
                              const std::string& message) {
        std::cout << "[OAdapter] Order " << order_id
                  << " status: " << status
                  << " - " << message << std::endl;
    });
}

void OAdapter::onOrderSignal(const OrderRequest& order) {
    std::cout << "[OAdapter] Received order: " << order.symbol
              << " " << order.side << " " << order.quantity
              << " @ " << order.price << std::endl;

    sendOrder(order);   // immediate send
}

void OAdapter::run() {
    if (!exchange_) {
        std::cerr << "No exchange set. Call setExchange() first." << std::endl;
        return;
    }

    exchange_->connect();
    if (!exchange_->isConnected()) {
        std::cerr << "Failed to connect to exchange: " << exchange_id_ << std::endl;
        return;
    }

    running_ = true;
    std::cout << "OAdapter running, ready to send orders..." << std::endl;
}

void OAdapter::stop() {
    running_ = false;
    if (exchange_) {
        exchange_->disconnect();
    }
    std::cout << "OAdapter stopped" << std::endl;
}

void OAdapter::sendOrder(const OrderRequest& order) {
    if (exchange_ && exchange_->isConnected()) {
        exchange_->sendOrder(order);
    } else {
        std::cerr << "Cannot send order - exchange not connected" << std::endl;
    }
}