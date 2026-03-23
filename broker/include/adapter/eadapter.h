#ifndef EADAPTER_H
#define EADAPTER_H

#include <memory>
#include <string>
#include <vector>
#include <atomic>
#include <thread>

class Exchange1;

class EAdapter {
public:
    EAdapter();
    ~EAdapter();

    void connect_to_exchange();     // Connect to exchange
    void subscribe_symbols();       // Subscribe to symbols
    void on_update();         // Handle price updates (event-driven)
    void run();                     // Main loop
    void stop();                    // Stop adapter
    
    void set_symbols(const std::vector<std::string>& symbols);
    
private:
    std::unique_ptr<Exchange1> exchange_;
    std::vector<std::string> symbols_;
    std::atomic<bool> running_{false};
    std::thread worker_thread_;
};

#endif