#include "adapter/eadapter.h"
#include <iostream>
#include <thread>
#include <csignal>

std::unique_ptr<EAdapter> adapter;

void signal_handler(int signal) {
    std::cout << "\nStopping EAdapter..." << std::endl;
    if (adapter) {
        adapter->stop();
    }
    exit(0);
}

int main() {
    // Setup signal handler for clean shutdown
    signal(SIGINT, signal_handler);
    
    std::cout << "Starting EAdapter (Live Mode)..." << std::endl;
    
    // Create and configure adapter
    adapter = std::make_unique<EAdapter>();
    adapter->set_symbols({"BTCUSDT", "ETHUSDT", "SOLUSDT"});
    
    // Run adapter (this will start streaming)
    adapter->run();
    
    return 0;
}