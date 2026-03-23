#ifndef ALGO_H
#define ALGO_H

#include "marketData.h"

class Algo {
public:
    virtual ~Algo() = default;
    virtual void onTick(const MarketData& data) = 0;
};

#endif