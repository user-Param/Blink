#ifndef EXCHANGE1_H
#define EXCHANGE1_H

#include <string>
#include <vector>
#include <functional>

using PriceCallback = std::function<void(double price, double bid, double ask)>;

class Exchange1 {
public:
    Exchange1();
    ~Exchange1();
    
    void connect();                              // Connect to exchange
    void subscribe(const std::vector<std::string>& symbols);  // Subscribe to symbols
    void set_callback(PriceCallback callback);   // Set callback for price updates
    
private:
    PriceCallback callback_;
    bool connected_;
};

#endif