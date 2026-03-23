#ifndef BASE_EXCHANGE_H
#define BASE_EXCHANGE_H

#include <string>
#include <functional>
#include "../adapter/oadapter.h"   

using OrderCallback = std::function<void(const std::string& order_id,
                                         const std::string& status,
                                         const std::string& message)>;

class BaseExchange {
public:
    virtual ~BaseExchange() = default;

    virtual void connect() = 0;
    virtual void disconnect() = 0;
    virtual bool isConnected() const = 0;
    virtual void sendOrder(const OrderRequest& order) = 0;
    virtual std::string getId() const = 0;

    void setCallback(OrderCallback cb) { callback_ = std::move(cb); }

protected:
    void notifyResponse(const std::string& order_id,
                        const std::string& status,
                        const std::string& message) {
        if (callback_) callback_(order_id, status, message);
    }

    OrderCallback callback_;
    bool connected_{false};
};

#endif