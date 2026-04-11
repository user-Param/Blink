#include "../include/algoManager.h"
#include <iostream>

AlgoManager::AlgoManager(std::shared_ptr<RiskManager> riskMgr)
    : riskManager_(std::move(riskMgr)) {}

void AlgoManager::addAlgo(std::unique_ptr<Algo> algo) {
    algo->setManager(this);
    std::string strategy_id = "strategy_" + std::to_string(algos_.size());
    algos_.push_back({std::move(algo), strategy_id, true});
    std::cout << "[AlgoManager] Added strategy: " << strategy_id << std::endl;
}

void AlgoManager::activateAlgo(size_t index, bool active) {
    if (index < algos_.size()) {
        algos_[index].active = active;
        std::cout << "[AlgoManager] Strategy " << algos_[index].strategy_id 
                  << " is now " << (active ? "ACTIVE" : "INACTIVE") << std::endl;
    }
}

void AlgoManager::onTick(const MarketData& data) {
    for (auto& instance : algos_) {
        if (instance.active) {
            instance.algo->onTick(data);
        }
    }
}

bool AlgoManager::sendOrder(const std::string& symbol, double price, int quantity, 
                           const std::string& side, const std::string& strategy_id) {
    if (order_callback_) {
        order_callback_(symbol, price, quantity, side, strategy_id);
    }
    
    if (riskManager_) {
        return riskManager_->validateAndSend(symbol, price, quantity, side, strategy_id);
    }
    return false;
}
