#include "../../include/algo/sma.h"
#include <numeric>
#include <iostream>

SimpleMovingAverage::SimpleMovingAverage(size_t short_period, size_t long_period)
    : short_period_(short_period), long_period_(long_period) {}

void SimpleMovingAverage::onTick(const MarketData& data) {
    prices_.push_back(data.price);
    if (prices_.size() > long_period_) {
        prices_.pop_front();
    }

    if (prices_.size() < long_period_) {
        return;
    }

    double short_sma = calculate_sma(short_period_);
    double long_sma = calculate_sma(long_period_);

    if (short_sma > long_sma && !position_open_) {
        if (buy(data.symbol, data.price, 1)) {
            position_open_ = true;
        }
    } else if (short_sma < long_sma && position_open_) {
        if (sell(data.symbol, data.price, 1)) {
            position_open_ = false;
        }
    }
}

double SimpleMovingAverage::calculate_sma(size_t period) {
    if (prices_.size() < period) return 0.0;
    double sum = std::accumulate(prices_.end() - period, prices_.end(), 0.0);
    return sum / period;
}
