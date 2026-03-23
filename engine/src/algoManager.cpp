#include "../include/algoManager.h"

AlgoManager::AlgoManager(std::shared_ptr<RiskManager> riskMgr)
    : riskManager_(std::move(riskMgr)) {}

void AlgoManager::addAlgo(std::unique_ptr<Algo> algo) {
    algos_.push_back({std::move(algo), true});
}

void AlgoManager::activateAlgo(size_t index, bool active) {
    if (index < algos_.size()) {
        algos_[index].active = active;
    }
}

void AlgoManager::onTick(const MarketData& data) {
    for (auto& instance : algos_) {
        if (instance.active) {
            instance.algo->onTick(data);
        }
    }
}