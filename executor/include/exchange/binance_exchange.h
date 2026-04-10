#ifndef BINANCE_EXCHANGE_H
#define BINANCE_EXCHANGE_H

#include "base_exchange.h"
#include <nlohmann/json.hpp>
#include <curl/curl.h>
#include <queue>
#include <mutex>

using json = nlohmann::json;

class BinanceExchange : public BaseExchange {
public:
    BinanceExchange(const std::string& api_key, const std::string& api_secret, bool testnet = false);
    ~BinanceExchange();

    void connect() override;
    void disconnect() override;
    bool isConnected() const override;
    void sendOrder(const OrderRequest& order) override;
    std::string getId() const override { return "binance"; }
    json getAccountInfo() override;

private:
    std::string api_key_;
    std::string api_secret_;
    bool testnet_;
    std::string base_url_;
    bool connected_;

    std::string generateSignature(const std::string& query_string);
    std::string createOrderRequest(const OrderRequest& order);
    json parseResponse(const std::string& response);
    void processOrderResponse(const json& response, const OrderRequest& original_order);

    static size_t writeCallback(void* contents, size_t size, size_t nmemb, std::string* userp);
};

#endif
