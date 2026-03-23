#ifndef OADAPTER_H
#define OADAPTER_H

#include <memory>
#include <string>
#include <atomic>

struct OrderRequest {
    std::string order_id;
    std::string symbol;
    double price;
    int quantity;
    std::string side;   
    std::string type;   
    uint64_t timestamp;
};

class BaseExchange; 

class OAdapter {
public:
    OAdapter();
    ~OAdapter();

    void onOrderSignal(const OrderRequest& order);   
    void run();
    void stop();
    void setExchange(const std::string& exchange_id);

private:
    void sendOrder(const OrderRequest& order);
    std::unique_ptr<BaseExchange> exchange_;
    std::string exchange_id_;
    std::atomic<bool> running_{false};
};

#endif