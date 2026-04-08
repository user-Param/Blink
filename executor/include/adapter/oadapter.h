#ifndef OADAPTER_H
#define OADAPTER_H

#include <memory>
#include <string>
#include <atomic>
#include <vector>
#include <thread>
#include <map>
#include <mutex>
#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <nlohmann/json.hpp>

namespace net = boost::asio;
namespace beast = boost::beast;
namespace websocket = beast::websocket;
using tcp = net::ip::tcp;
using json = nlohmann::json;

struct OrderRequest {
    std::string order_id;
    std::string symbol;
    double price;
    int quantity;
    std::string side;   
    std::string type;   
    uint64_t timestamp;
    std::string strategy_id;
};

struct OrderResult {
    std::string order_id;
    std::string strategy_id;
    std::string symbol;
    std::string side;
    int quantity;
    double price;
    std::string status;
    std::string exchange_order_id;
    std::string message;
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
    
    void registerStrategy(const std::string& strategy_id);
    void unregisterStrategy(const std::string& strategy_id);
    const std::vector<std::string>& getActiveStrategies() const { return active_strategies_; }

private:
    void sendOrder(const OrderRequest& order);
    void startServer();
    void acceptConnections();
    void handleSession(tcp::socket socket);
    void broadcastOrderResult(const OrderResult& result);

    std::unique_ptr<BaseExchange> exchange_;
    std::string exchange_id_;
    std::atomic<bool> running_{false};
    
    net::io_context ioc_;
    std::unique_ptr<tcp::acceptor> acceptor_;
    std::vector<std::thread> serverThreads_;
    std::string host_ = "0.0.0.0";
    std::string port_ = "9001";
    
    std::vector<std::string> active_strategies_;
    std::map<std::string, OrderResult> pending_orders_;
    
    // Store UI client WebSocket pointers for broadcasting
    std::vector<std::shared_ptr<websocket::stream<tcp::socket>>> ui_clients_;
    std::mutex ui_clients_mutex_;
};

#endif
