#include <iostream>
#include <string>
#include <vector>

// Market Data Structure
struct MarketData {
    double price;
    double bid;
    double ask;
    std::string symbol;
    long timestamp;
};

// Algo Base Class
class Algo {
public:
    virtual ~Algo() = default;
    virtual void onTick(const MarketData& data) = 0;
    
    void buy(std::string symbol, double price, int qty) {
        std::cout << "[ORDER] BUY " << qty << " " << symbol << " @ " << price << std::endl;
    }
    
    void sell(std::string symbol, double price, int qty) {
        std::cout << "[ORDER] SELL " << qty << " " << symbol << " @ " << price << std::endl;
    }
};

// SimpleScalper Strategy Implementation
class SimpleScalper : public Algo {
public:
    void onTick(const MarketData& data) override {
        if (last_price_ > 0) {
            // If price drops by more than 0.5, Buy
            if (data.price < last_price_ - 0.5) {
                buy(data.symbol, data.price, 1);
            }
            // If price rises by more than 0.5, Sell
            else if (data.price > last_price_ + 0.5) {
                sell(data.symbol, data.price, 1);
            }
        }
        last_price_ = data.price;
    }
private:
    double last_price_ = 0;
};

// Test entry point
int main() {
    SimpleScalper strategy;
    
    std::cout << "Testing SimpleScalper Strategy..." << std::endl;
    
    // Simulate some ticks
    MarketData md1 = {60000.0, 59995.0, 60005.0, "BTCUSDT", 1000};
    MarketData md2 = {59999.0, 59994.0, 60004.0, "BTCUSDT", 2000}; // Drop 1.0
    
    strategy.onTick(md1);
    strategy.onTick(md2);
    
    return 0;
}