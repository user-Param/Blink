#include "adapter/eadapter.h"
#include "exchange/exchange1.h"
#include "exchange/exchange2.h"
#include <iostream>
#include <chrono>
#include <thread>

EAdapter::EAdapter(ExchangeType type) : exchange_type_(type) {
    if (exchange_type_ == ExchangeType::BINANCE) {
        exchange1_ = std::make_unique<Exchange1>();
    } else {
        exchange2_ = std::make_unique<Exchange2>();
    }
}

EAdapter::~EAdapter() {
    stop();
}

void EAdapter::set_symbols(const std::vector<std::string>& symbols) {
    symbols_ = symbols;
}

void EAdapter::connect_to_exchange() {
    if (exchange_type_ == ExchangeType::BINANCE) {
        exchange1_->connect();
    } else {
        exchange2_->connect();
    }
    std::cout << "Connected to exchange" << std::endl;
}

void EAdapter::subscribe_symbols() {
    if (exchange_type_ == ExchangeType::BINANCE) {
        exchange1_->subscribe(symbols_);
    } else {
        exchange2_->subscribe(symbols_);
    }
    std::cout << "Subscribed to " << symbols_.size() << " symbols" << std::endl;
}

void EAdapter::on_update() {
    auto callback = [this](const std::string& symbol, double price, double bid, double ask, long ts) {
        if (external_cb_) {
            external_cb_(symbol, price, bid, ask, ts);
        }
    };

    if (exchange_type_ == ExchangeType::BINANCE) {
        exchange1_->set_callback(callback);
    } else {
        exchange2_->set_callback(callback);
    }
}

void EAdapter::run() {
    std::cout << "EAdapter starting..." << std::endl;
    
    // Setup callback for price updates
    on_update();
    
    // Connect to exchange
    connect_to_exchange();
    
    // Subscribe to symbols
    subscribe_symbols();
    
    running_ = true;
    
    // Main loop - just keep running, price updates come via callback
    while (running_) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
}

void EAdapter::stop() {
    running_ = false;
    if (worker_thread_.joinable()) {
        worker_thread_.join();
    }
    std::cout << "EAdapter stopped" << std::endl;
}


void EAdapter::set_exchange(ExchangeType type) {
    if (exchange_type_ == type) return;
    
    exchange_type_ = type;
    if (exchange_type_ == ExchangeType::BINANCE) {
        exchange2_.reset();
        exchange1_ = std::make_unique<Exchange1>();
    } else {
        exchange1_.reset();
        exchange2_ = std::make_unique<Exchange2>();
    }
    
    if (running_) {
        on_update();
        connect_to_exchange();
        subscribe_symbols();
    }
}


void EAdapter::set_callback(ExternalCallback cb) {
    external_cb_ = std::move(cb);
}