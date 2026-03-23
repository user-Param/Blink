#include "../include/exchange/base_exchange.h"
#include <iostream>
#include <memory>

class BinanceExchange : public BaseExchange {
public:
    void connect() override {
        std::cout << "[Binance] Connecting..." << std::endl;
        connected_ = true;
    }

    void disconnect() override {
        std::cout << "[Binance] Disconnecting..." << std::endl;
        connected_ = false;
    }

    bool isConnected() const override { return connected_; }

    void sendOrder(const OrderRequest& order) override {
        std::cout << "[Binance] Sending order: " << order.symbol
                  << " " << order.side << " " << order.quantity
                  << " @ " << order.price << std::endl;

        // Simulate exchange response
        notifyResponse(order.order_id, "ACCEPTED", "Order accepted by Binance");
    }

    std::string getId() const override { return "binance"; }
};

// Factory function
std::unique_ptr<BaseExchange> createBinanceExchange() {
    return std::make_unique<BinanceExchange>();
}