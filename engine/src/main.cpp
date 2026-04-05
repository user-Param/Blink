#include <iostream>
#include <string>
#include <memory>
#include <boost/asio/signal_set.hpp>
#include "../include/algoManager.h"
#include "../include/riskManager.h"
#include "../include/algo.h"
#include "../include/engine.h"

class PrintAlgo : public Algo {
public:
    void onTick(const MarketData& data) override {
        std::cout << "[Algo] Received Update: " << data.symbol 
                  << " | Price: " << data.price 
                  << " | Bid: " << data.bid 
                  << " | Ask: " << data.ask << std::endl;
    }
};

int main(int argc, char** argv)
{
    try
    {
        std::cout << "--- Starting Trading Engine ---" << std::endl;

        auto riskMgr = std::make_shared<RiskManager>();
        auto algoMgr = std::make_shared<AlgoManager>(riskMgr);
        
        algoMgr->addAlgo(std::make_unique<PrintAlgo>());

        Engine engine(algoMgr);
        engine.setTopics({"ticker_", "price_", "bid_", "ask_"});
        engine.start();

        // Give it a moment to connect and then set mode
        std::this_thread::sleep_for(std::chrono::seconds(1));
        engine.sendMode("_Live");

        std::cout << "\nEngine is running and listening for market data..." << std::endl;

        // Use asio signal_set to wait for termination signals (Ctrl+C, etc.)
        // This keeps the engine alive even when running in the background.
        boost::asio::io_context ioc;
        boost::asio::signal_set signals(ioc, SIGINT, SIGTERM);
        signals.async_wait([&](const boost::system::error_code&, int) {
            std::cout << "\nShutdown signal received." << std::endl;
            ioc.stop();
        });

        ioc.run();

        std::cout << "Shutting down engine..." << std::endl;
        engine.stop();
        std::cout << "Engine stopped safely." << std::endl;
    }
    catch(std::exception const& e)
    {
        std::cerr << "Fatal Error: " << e.what() << std::endl;
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}
