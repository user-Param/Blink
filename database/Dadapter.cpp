#include "Dadapter.h"

namespace beast = boost::beast;
namespace websocket = beast::websocket;
namespace net = boost::asio;
using tcp = net::ip::tcp;

 


    Dadapter::Dadapter() : ws_(ioc_) {}

    void Dadapter::connect_to_server() {
        try {
            tcp::resolver resolver(ioc_);
            auto const results = resolver.resolve(server_host_, server_port_);
            
            net::connect(ws_.next_layer(), results.begin(), results.end());
            ws_.handshake(server_host_ + ":" + server_port_, "/");
            
            std::cout << "Connected to server at " << server_host_ << ":" << server_port_ << std::endl;
        } catch (std::exception& e) {
            std::cerr << "Connection failed: " << e.what() << std::endl;
            throw;
        }
    }

    bool Dadapter::open_csv_file() {
        csv_file_.open(csv_filename_);
        if (!csv_file_.is_open()) {
            std::cerr << "Could not open CSV file: " << csv_filename_ << std::endl;
            return false;
        }
        
        std::string header;
        std::getline(csv_file_, header);
        std::cout << "Opened CSV: " << csv_filename_ << " (Header: " << header << ")" << std::endl;
        return true;
    }

    bool Dadapter::has_more_data() {
        if (!csv_file_.is_open()) return false;
        return !csv_file_.eof() && streaming_;
    }

    std::string Dadapter::get_next_line() {
        if (std::getline(csv_file_, current_line_)) {
            return current_line_;
        }
        return "";
    }

    void Dadapter::send_mode_command() {
        std::string mode_cmd = "{\"mode\": \"_Backtest\", \"subscribe\": [\"price_\", \"bid_\", \"ask_\"]}";
        ws_.write(net::buffer(mode_cmd));
        std::cout << "Sent: " << mode_cmd << std::endl;
        
        beast::flat_buffer buffer;
        ws_.read(buffer);
        std::cout << "Response: " << beast::buffers_to_string(buffer.data()) << std::endl;
    }

    void Dadapter::stream_csv_data() {
        int row_count = 0;
        int switch_after = 10000;
        
        while (has_more_data()) {
            std::string line = get_next_line();
            if (line.empty()) break;
            
            ws_.write(net::buffer(line));
            std::cout << "[Dadapter] data : " << line << std::endl;
            row_count++;
            
            if (row_count == switch_after) {
            
            //std::cout << "Switching to Live mode mid-stream..." << std::endl;
            ws_.write(net::buffer("{\"mode\": \"_Live\"}"));
            
            beast::flat_buffer buffer;
            ws_.read(buffer);
            //std::cout << "Server response: " << beast::buffers_to_string(buffer.data()) << std::endl;
        }
        }
        
        std::cout << "Done! Streamed " << row_count << " rows total" << std::endl;
    }


    void Dadapter::start_streaming() {
    if (streaming_) return;
    if (!open_csv_file()) return;
    streaming_ = true;
    // Optionally send mode command if needed
    // send_mode_command();
    stream_thread_ = std::thread(&Dadapter::stream_csv_data, this);
    }

    void Dadapter::stop_streaming() {
    streaming_ = false;
    if (stream_thread_.joinable()) stream_thread_.join();
    }






    void Dadapter::run() {
    try {
        connect_to_server();

        // Identify as adapter
        nlohmann::json id = {{"type", "adapter"}};
        ws_.write(net::buffer(id.dump()));
        //std::cout << "Sent adapter identification." << std::endl;

        beast::flat_buffer buffer;
        while (running_) {
            try {
                ws_.read(buffer);
                std::string msg = beast::buffers_to_string(buffer.data());
                buffer.consume(buffer.size());

                auto j = nlohmann::json::parse(msg);
                if (!j.contains("command")) continue;

                if (j["command"] == "start") {
                    if (!streaming_) {
                        start_streaming();
                    }
                } else if (j["command"] == "stop") {
                    if (streaming_) {
                        stop_streaming();
                    }
                }
            } catch (const nlohmann::json::parse_error& e) {
                // Ignore non‑JSON messages (e.g., text confirmations from server)
                //std::cout << "Ignoring non‑JSON message: " << msg << std::endl;
            } catch (const std::exception& e) {
                std::cerr << "Error in command loop: " << e.what() << std::endl;
                running_ = false;  // Stop loop on serious errors
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Fatal error in run(): " << e.what() << std::endl;
    }
    std::cout << "Dadapter run() ended." << std::endl;
}

    void Dadapter::stop() {
        running_ = false;
        std::cout << "Dadapter is stopped" << std::endl;
    }


int main() {
    Dadapter adapter;
    adapter.run();
    return 0;
}