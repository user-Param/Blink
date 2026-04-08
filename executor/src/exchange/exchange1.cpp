#include "exchange/binance_exchange.h"
#include "config/config.h"
#include <memory>

std::unique_ptr<BaseExchange> createBinanceExchange() {
    auto& config = Config::getInstance();
    
    std::string api_key = config.get("BINANCE_API_KEY", "");
    std::string api_secret = config.get("BINANCE_API_SECRET", "");
    bool testnet = config.getBool("BINANCE_TESTNET", true);
    
    if (api_key.empty() || api_secret.empty()) {
        std::cerr << "[Exchange] Warning: BINANCE_API_KEY or BINANCE_API_SECRET not set in .env" << std::endl;
    }
    
    return std::make_unique<BinanceExchange>(api_key, api_secret, testnet);
}
