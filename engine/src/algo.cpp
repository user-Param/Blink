#include "../include/algo.h"
#include "../include/algoManager.h"

bool Algo::buy(const std::string& symbol, double price, int quantity) {
    if (manager_) {
        return manager_->sendOrder(symbol, price, quantity, "BUY");
    }
    return false;
}

bool Algo::sell(const std::string& symbol, double price, int quantity) {
    if (manager_) {
        return manager_->sendOrder(symbol, price, quantity, "SELL");
    }
    return false;
}
