#ifndef RISKMANAGER_H
#define RISKMANAGER_H

#include <memory>
#include "marketData.h"

// Forward declare any order types if needed
class RiskManager {
public:
    RiskManager() = default;
    ~RiskManager() = default;

    // Example: validate an order before sending
    bool validateOrder(const std::string& symbol, double price, int quantity);
};

#endif