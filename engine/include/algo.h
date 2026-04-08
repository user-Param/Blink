#ifndef ALGO_H
#define ALGO_H

#include "marketData.h"
#include <string>

class AlgoManager; // Forward declaration

class Algo {
public:
    virtual ~Algo() = default;
    virtual void onTick(const MarketData& data) = 0;
    
    void setManager(AlgoManager* mgr) { manager_ = mgr; }

protected:
    bool buy(const std::string& symbol, double price, int quantity);
    bool sell(const std::string& symbol, double price, int quantity);

    AlgoManager* manager_ = nullptr;
};

#endif
