#include "adapter/eadapter.h"
#include "exchange/exchange1.h"
#include <iostream>
#include <chrono>
#include <thread>

EAdapter::EAdapter() : exchange_(std::make_unique<Exchange1>()) {}

EAdapter::~EAdapter() {
    stop();
}

void EAdapter::set_symbols(const std::vector<std::string>& symbols) {
    symbols_ = symbols;
}

void EAdapter::connect_to_exchange() {
    exchange_->connect();
    std::cout << "Connected to exchange" << std::endl;
}

void EAdapter::subscribe_symbols() {
    exchange_->subscribe(symbols_);
    std::cout << "Subscribed to " << symbols_.size() << " symbols" << std::endl;
}

void EAdapter::on_update() {
    exchange_->set_callback([this](double price, double bid, double ask) {
        std::cout << "Price update - Price: " << price 
                  << " Bid: " << bid << " Ask: " << ask << std::endl;
        // Here you would send to datafeed server (like Dadapter does)
    });
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