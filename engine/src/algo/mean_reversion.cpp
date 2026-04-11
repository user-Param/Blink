#include "../../include/algo/mean_reversion.h"
#include <numeric>
#include <cmath>
#include <iostream>

MeanReversion::MeanReversion(size_t period) : period_(period) {}

void MeanReversion::onTick(const MarketData& data) {
    prices_.push_back(data.price);
    if (prices_.size() > period_) {
        prices_.pop_front();
    }

    if (prices_.size() < period_) {
        return;
    }

    double sum = std::accumulate(prices_.begin(), prices_.end(), 0.0);
    double mean = sum / period_;

    double sq_sum = std::inner_product(prices_.begin(), prices_.end(), prices_.begin(), 0.0);
    double stdev = std::sqrt(sq_sum / period_ - mean * mean);

    if (stdev == 0) return;

    double z_score = (data.price - mean) / stdev;

    if (z_score < -1.5 && !position_open_) {
        if (buy(data.symbol, data.price, 1)) {
            position_open_ = true;
        }
    } else if (z_score > 1.5 && position_open_) {
        if (sell(data.symbol, data.price, 1)) {
            position_open_ = false;
        }
    }
}
