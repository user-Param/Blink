#include "exchange/exchange1.h"
#include <iostream>
#include <thread>
#include <chrono>
#include <random>

Exchange1::Exchange1() : connected_(false) {}

Exchange1::~Exchange1() {}

void Exchange1::connect() {
    connected_ = true;
    std::cout << "Exchange connected" << std::endl;
}

void Exchange1::subscribe(const std::vector<std::string>& symbols) {
    if (!connected_) {
        std::cerr << "Not connected to exchange" << std::endl;
        return;
    }
    
    std::cout << "Subscribing to symbols:" << std::endl;
    for (const auto& symbol : symbols) {
        std::cout << "  - " << symbol << std::endl;
    }
    
    
    if (callback_) {
    for (const auto& symbol : symbols) {

        std::thread([this, symbol]() {
            std::random_device rd;
            std::mt19937 gen(rd());
            std::uniform_real_distribution<> price_dist(50000, 60000);
            std::uniform_real_distribution<> spread_dist(0.1, 1.0);

            while (true) {
                double price = price_dist(gen);
                double spread = spread_dist(gen);
                double bid = price - spread;
                double ask = price + spread;

                long timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
                    std::chrono::system_clock::now().time_since_epoch()
                ).count();

                callback_(symbol, price, bid, ask, timestamp);

                std::this_thread::sleep_for(std::chrono::seconds(1));
            }
        }).detach();
    }
}
}

void Exchange1::set_callback(PriceCallback callback) {
    callback_ = callback;
}