#include "adapter/oadapter.h"
#include "config/config.h"
#include <iostream>
#include <thread>
#include <boost/asio/signal_set.hpp>

int main() {
    try {
        std::cout << "--- Starting BLINK Executor ---\n" << std::endl;
        
        // Load environment configuration
        auto& config = Config::getInstance();
        config.load(".env");
        
        // Verify API keys are configured
        std::string api_key = config.get("BINANCE_API_KEY", "");
        if (api_key == "test_api_key_12345" || api_key.empty()) {
            std::cout << "ℹ️  Note: Using test mode. Update .env with real BINANCE credentials for live trading.\n" << std::endl;
        }
        
        // Create OAdapter
        OAdapter oadapter;
        
        // Set exchange to use (from config or default to binance)
        std::string exchange = config.get("DEFAULT_EXCHANGE", "binance");
        oadapter.setExchange(exchange);
        
        // Start OAdapter (listens for orders on configured port)
        oadapter.run();
        
        // Setup signal handling
        boost::asio::io_context ioc;
        boost::asio::signal_set signals(ioc, SIGINT, SIGTERM);
        signals.async_wait([&](const boost::system::error_code&, int) {
            std::cout << "\n✓ Executor shutdown signal received." << std::endl;
            ioc.stop();
        });

        std::cout << "✓ Executor is active and ready to receive orders...\n" << std::endl;
        ioc.run();
        
        oadapter.stop();
        std::cout << "✓ Executor stopped safely." << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "❌ Executor Fatal Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
