#ifndef SMA_H
#define SMA_H

#include "../algo.h"
#include <deque>

class SimpleMovingAverage : public Algo {
public:
    SimpleMovingAverage(size_t short_period = 10, size_t long_period = 30);
    void onTick(const MarketData& data) override;

private:
    size_t short_period_;
    size_t long_period_;
    std::deque<double> prices_;
    
    double calculate_sma(size_t period);
    bool position_open_ = false;
};

#endif
