#ifndef DADAPTER_H
#define DADAPTER_H

#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <thread>
#include <atomic>
#include <nlohmann/json.hpp>   
#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <pqxx/pqxx> // PostgreSQL C++ client library

namespace net = boost::asio;
namespace beast = boost::beast;
namespace websocket = beast::websocket;
using tcp = net::ip::tcp;

class Dadapter {
private:
    // WebSocket members
    net::io_context ioc_;
    websocket::stream<tcp::socket> ws_;
    std::string server_host_ = "localhost";
    std::string server_port_ = "9000";

    // PostgreSQL members
    std::unique_ptr<pqxx::connection> db_conn_;
    std::string db_config_ = "host=localhost port=5432 dbname=blink user=blink password=";
    
    // Control members
    std::atomic<bool> running_{true};
    std::atomic<bool> streaming_{false};
    std::thread stream_thread_;

    // Streaming methods
    void start_streaming();
    void stop_streaming();
    void stream_db_data();

public:
    Dadapter();
    ~Dadapter();

    // Connection methods
    void connect_to_server();
    bool connect_to_db();

    // Database Queries
    nlohmann::json get_profile(const std::string& username);
    void save_strategy(const nlohmann::json& strategy_data);
    std::vector<nlohmann::json> get_all_strategies();
    
    // Core logic
    void run();
    void stop();
    void send_mode_command();
};

#endif
