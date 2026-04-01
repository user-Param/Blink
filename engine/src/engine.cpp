#include "../include/engine.h"
#include "../include/algoManager.h"
#include <iostream>

Engine::Engine(std::shared_ptr<AlgoManager> algoMgr)
    : algoManager_(std::move(algoMgr)), ws_{ioc_} {}

Engine::~Engine() {
    stop();
}

void Engine::start() {
    std::cout << "Engine started" << std::endl;
    connectDatafeed();
    
    running_ = true;
    readerThread_ = std::thread(&Engine::readLoop, this);
}

void Engine::stop() {
    running_ = false;
    if (readerThread_.joinable()) {
        readerThread_.join();
    }
    disconnectDatafeed();
}

void Engine::setTopics(const std::vector<std::string>& topics) {

    topics_ = topics;

    if(ws_.is_open()){
        for (const auto& topic : topics) {
        subscribe(topic);
        }
    }
}

void Engine::connectDatafeed() {

    try
    {
        tcp::resolver resolver(ioc_);
        auto const results = resolver.resolve(host_, port_);
        net::connect(ws_.next_layer(), results.begin(), results.end());

        ws_.handshake(host_ + ":" + port_, "/");
        std::cout << "Engine connected to datafeed server at " << host_ << ":" << port_ << std::endl;


        for (const auto& topic : topics_) {
            subscribe(topic);

        }
        } catch(const std::exception& e)
        {
            std::cerr << e.what() << '\n';
            throw;
        }
}

void Engine::disconnectDatafeed() {
    if (ws_.is_open()) {
        ws_.close(websocket::close_code::normal);
        std::cout << "Engine disconnected from datafeed." << std::endl;
    }
}

void Engine::readLoop() {
    beast::flat_buffer buffer;
    while (running_) {
        try {
            // Read a message (blocks until data arrives)
            ws_.read(buffer);
            std::string msg = beast::buffers_to_string(buffer.data());
            buffer.consume(buffer.size());

            // Pass raw message to onData (which will parse and forward)
            onData(msg);
        } catch (const std::exception& e) {
            if (running_) { // only log if not shutting down
                std::cerr << "Engine read error: " << e.what() << std::endl;
            }
            break;
        }
    }
}

void Engine::onData(const std::string& raw) {
    try {
        auto j = nlohmann::json::parse(raw);
        MarketData md;
        md.symbol = j.value("symbol", "unknown");
        md.price  = j.value("price", 0.0);
        md.bid    = j.value("bid", 0.0);
        md.ask    = j.value("ask", 0.0);
        md.quantity = j.value("volume", 0); 
        md.timestamp = j.value("timestamp", 0ULL);

        std::cout << "[ENGINE] Received: " << md.symbol
                      << " price=" << md.price
                      << " bid=" << md.bid
                      << " ask=" << md.ask << std::endl;
        
        if (algoManager_) {
            algoManager_->onTick(md);
        }
    } catch (const std::exception& e) {
        std::cout << "Data Error :" << e.what() << std::endl;
    }
}

void Engine::subscribe(const std::string& topic) {
    nlohmann::json sub;
    sub["subscribe"] = {topic};
    std::string msg = sub.dump();
    ws_.write(net::buffer(msg));
    std::cout << "Subscribed to " << topic << std::endl;
}


void Engine::sendMode(const std::string& mode) {
    nlohmann::json msg;
    msg["mode"] = mode;   
    ws_.write(net::buffer(msg.dump()));
    std::cout << "Engine sent mode: " << mode << std::endl;
}