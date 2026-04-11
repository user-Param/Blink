#ifndef MEAN_REVERSION_H
#define MEAN_REVERSION_H

#include "../algo.h"
#include <deque>

class MeanReversion : public Algo {
public:
    MeanReversion(size_t period = 20);
    void onTick(const MarketData& data) override;

private:
    size_t period_;
    std::deque<double> prices_;
    bool position_open_ = false;
};

#endif
