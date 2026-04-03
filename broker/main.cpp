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
    
    signal(SIGINT, signal_handler);
    std::cout << "Starting EAdapter (Live Mode)..." << std::endl;
    adapter = std::make_unique<EAdapter>();
    adapter->set_symbols({"BTCUSDT", "ETHUSDT", "SOLUSDT"});
    adapter->run();
    
    return 0;
}