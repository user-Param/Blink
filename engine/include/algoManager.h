#ifndef ALGOMANAGER_H
#define ALGOMANAGER_H

#include <vector>
#include <memory>
#include "algo.h"
#include "riskManager.h"

class AlgoManager {
public:
    explicit AlgoManager(std::shared_ptr<RiskManager> riskMgr);

    void addAlgo(std::unique_ptr<Algo> algo);
    void activateAlgo(size_t index, bool active);
    void onTick(const MarketData& data);

private:
    struct AlgoInstance {
        std::unique_ptr<Algo> algo;
        bool active;
    };
    std::vector<AlgoInstance> algos_;
    std::shared_ptr<RiskManager> riskManager_;
};

#endif