#include "adapter/oadapter.h"
#include <iostream>
#include <thread>

int main() {
    std::cout << "Starting OAdapter..." << std::endl;
    
    // Create OAdapter
    OAdapter oadapter;
    
    // Set exchange to use
    oadapter.setExchange("binance");  // or "bybit"
    
    // Start OAdapter
    oadapter.run();
    
    // Simulate orders from RiskManager
    OrderRequest order1;
    order1.order_id = "ORD001";
    order1.symbol = "BTCUSDT";
    order1.price = 50000.0;
    order1.quantity = 1;
    order1.side = "BUY";
    order1.type = "LIMIT";
    
    OrderRequest order2;
    order2.order_id = "ORD002";
    order2.symbol = "ETHUSDT";
    order2.price = 3000.0;
    order2.quantity = 10;
    order2.side = "SELL";
    order2.type = "LIMIT";
    
    // Send orders (simulating RiskManager signals)
    std::this_thread::sleep_for(std::chrono::seconds(2));
    oadapter.onOrderSignal(order1);
    
    std::this_thread::sleep_for(std::chrono::seconds(2));
    oadapter.onOrderSignal(order2);
    
    // Keep running
    std::cout << "Press Enter to stop..." << std::endl;
    std::cin.get();
    
    oadapter.stop();
    
    return 0;
}