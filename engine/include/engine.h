#ifndef ENGINE_H
#define ENGINE_H

#include <string>
#include <vector>
#include <memory>
#include <thread>
#include <atomic>
#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <nlohmann/json.hpp>
#include "marketData.h"

class AlgoManager;

namespace net = boost::asio;
namespace beast = boost::beast;
namespace websocket = beast::websocket;
using tcp = net::ip::tcp;


class Engine {
public:
    explicit Engine(std::shared_ptr<AlgoManager> algoMgr);
    ~Engine();

    void start();
    void stop();
    void setTopics(const std::vector<std::string>& topics);
    void sendMode(const std::string& mode);


private:
    void connectDatafeed();
    void disconnectDatafeed();
    void readLoop();
    void onData(const std::string& raw);
    void subscribe(const std::string& topic);
    

    std::shared_ptr<AlgoManager> algoManager_;
    std::vector<std::string> topics_;

    net::io_context ioc_;
    websocket::stream<tcp::socket> ws_;
    std::thread readerThread_;
    std::atomic<bool> running_{false};

    std::string host_ = "localhost";
    std::string port_ = "9000";
};

#endif