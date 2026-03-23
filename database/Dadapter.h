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

namespace net = boost::asio;
namespace beast = boost::beast;
namespace websocket = beast::websocket;
using tcp = net::ip::tcp;




class Dadapter {
private:

    net::io_context ioc_;
    websocket::stream<tcp::socket> ws_;
    std::ifstream csv_file_;
    std::string current_line_;
    std::atomic<bool> running_{true};
    std::string server_host_ = "localhost";
    std::string server_port_ = "9000";
    std::string csv_filename_ = "bitcoin_final.csv";

    void start_streaming();
    void stop_streaming();

public:
    Dadapter();
    void connect_to_server();
    bool open_csv_file();
    bool has_more_data();
    std::string get_next_line();
    void send_mode_command();
    void stream_csv_data();
    void run();
    void stop();
    std::atomic<bool> streaming_{false};
std::thread stream_thread_;
};

#endif