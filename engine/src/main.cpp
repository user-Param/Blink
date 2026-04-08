#include <iostream>
#include <string>
#include <memory>
#include <boost/asio/signal_set.hpp>
#include "../include/algoManager.h"
#include "../include/riskManager.h"
#include "../include/algo.h"
#include "../include/engine.h"

// A simple algorithm that places orders based on price movement
class SimpleScalper : public Algo {
public:
    void onTick(const MarketData& data) override {
        // std::cout << "[Algo] Tick: " << data.price << std::endl;
        
        if (last_price_ > 0) {
            // If price drops by more than 0.5, Buy
            if (data.price < last_price_ - 0.5) {
                std::cout << "[Algo] Price Drop! Attempting to BUY." << std::endl;
                buy(data.symbol, data.price, 1);
            }
            // If price rises by more than 0.5, Sell
            else if (data.price > last_price_ + 0.5) {
                std::cout << "[Algo] Price Spike! Attempting to SELL." << std::endl;
                sell(data.symbol, data.price, 1);
            }
        }
        last_price_ = data.price;
    }
private:
    double last_price_ = 0;
};

int main(int argc, char** argv)
{
    try
    {
        std::cout << "--- Starting BLINK Engine ---" << std::endl;

        // 1. Initialize RiskManager (Connects to Executor on 9001)
        auto riskMgr = std::make_shared<RiskManager>();
        
        // 2. Initialize AlgoManager
        auto algoMgr = std::make_shared<AlgoManager>(riskMgr);
        
        // 3. Add Algorithm
        algoMgr->addAlgo(std::make_unique<SimpleScalper>());

        // 4. Initialize Engine (Connects to Datafeed on 9000)
        Engine engine(algoMgr);
        engine.setTopics({"ticker_"});
        engine.start();

        std::this_thread::sleep_for(std::chrono::seconds(1));
        engine.sendMode("_Live");

        std::cout << "\nEngine is running. Trading logic active." << std::endl;

        boost::asio::io_context ioc;
        boost::asio::signal_set signals(ioc, SIGINT, SIGTERM);
        signals.async_wait([&](const boost::system::error_code&, int) {
            std::cout << "\nEngine shutdown signal received." << std::endl;
            ioc.stop();
        });

        ioc.run();

        engine.stop();
        std::cout << "Engine stopped safely." << std::endl;
    }
    catch(std::exception const& e)
    {
        std::cerr << "Engine Fatal Error: " << e.what() << std::endl;
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}
