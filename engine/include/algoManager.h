#ifndef ALGOMANAGER_H
#define ALGOMANAGER_H

#include <vector>
#include <memory>
#include <string>
#include "algo.h"
#include "riskManager.h"

class AlgoManager {
public:
    explicit AlgoManager(std::shared_ptr<RiskManager> riskMgr);

    void addAlgo(std::unique_ptr<Algo> algo);
    void activateAlgo(size_t index, bool active);
    void onTick(const MarketData& data);
    
    // Algos can call this to place orders (returns strategy_id for tracking)
    bool sendOrder(const std::string& symbol, double price, int quantity, 
                   const std::string& side, const std::string& strategy_id = "default");

    size_t getAlgoCount() const { return algos_.size(); }

private:
    struct AlgoInstance {
        std::unique_ptr<Algo> algo;
        std::string strategy_id;
        bool active;
    };
    std::vector<AlgoInstance> algos_;
    std::shared_ptr<RiskManager> riskManager_;
};

#endif
