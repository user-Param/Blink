#include "../include/engine.h"
#include "../include/algoManager.h"

#include <iostream>

Engine::Engine(std::shared_ptr<AlgoManager> algoMgr)
    : algoManager_(std::move(algoMgr)), ws_{ioc_} {}

Engine::~Engine()
{
    stop();
}

void Engine::start()
{
    std::cout << "Engine started" << std::endl;
    connectDatafeed();

    running_ = true;
    readerThread_ = std::thread(&Engine::readLoop, this);
}

void Engine::stop()
{
    running_ = false;
    if (readerThread_.joinable())
    {
        readerThread_.join();
    }
    disconnectDatafeed();
}

void Engine::setTopics(const std::vector<std::string> &topics)
{
    topics_ = topics;
    if (ws_.is_open()) {
        nlohmann::json subMsg;
        subMsg["subscribe"] = topics_;
        ws_.write(net::buffer(subMsg.dump()));
        std::cout << "[Engine] Updated subscriptions: " << subMsg.dump() << std::endl;
    }
}

void Engine::connectDatafeed()
{
    try
    {
        tcp::resolver resolver(ioc_);
        auto const results = resolver.resolve(host_, port_);
        net::connect(ws_.next_layer(), results.begin(), results.end());

        ws_.handshake(host_ + ":" + port_, "/");
        std::cout << "Engine connected to datafeed server at " << host_ << ":" << port_ << std::endl;

        if (!topics_.empty()) {
            nlohmann::json subMsg;
            subMsg["subscribe"] = topics_;
            ws_.write(net::buffer(subMsg.dump()));
            std::cout << "[Engine] Subscribed to: " << subMsg.dump() << std::endl;
        }
    }
    catch (const std::exception &e)
    {
        std::cerr << "Engine connection error: " << e.what() << std::endl;
        throw;
    }
}

void Engine::disconnectDatafeed()
{
    if (ws_.is_open())
    {
        ws_.close(websocket::close_code::normal);
        std::cout << "Engine disconnected from datafeed." << std::endl;
    }
}

void Engine::readLoop()
{
    beast::flat_buffer buffer;
    while (running_)
    {
        try
        {
            // Read a message (blocks until data arrives)
            ws_.read(buffer);
            std::string msg = beast::buffers_to_string(buffer.data());
            buffer.consume(buffer.size());

            std::cout << "[Engine][RAW] " << msg << std::endl;

            onData(msg);
        }
        catch (const std::exception &e)
        {
            if (running_)
            { // only log if not shutting down
                std::cerr << "Engine read error: " << e.what() << std::endl;
            }
            break;
        }
    }
}

void Engine::onData(const std::string &raw)
{
    try
    {

        auto j = nlohmann::json::parse(raw);

        MarketData data;
        data.symbol = j["symbol"];
        data.price = j["price"];
        data.bid = j["bid"];
        data.ask = j["ask"];
        data.timestamp = j["timestamp"];

        std::cout << "[Engine][PARSED] " << data.symbol 
                  << " | P:" << data.price 
                  << " B:" << data.bid 
                  << " A:" << data.ask 
                  << " @ " << data.timestamp << std::endl;

        algoManager_->onTick(data);
    }
    catch (const std::exception &e)
    {
        std::cout << "Data Error :" << e.what() << std::endl;
    }
}

void Engine::subscribe(const std::string &topic)
{
    // nlohmann::json sub;
    // sub["subscribe"] = {topic};
    // std::string msg = sub.dump();
    // ws_.write(net::buffer(msg));
    // std::cout << "Subscribed to " << topic << std::endl;
}

void Engine::sendMode(const std::string &mode)
{
    nlohmann::json msg;
    msg["mode"] = mode;
    ws_.write(net::buffer(msg.dump()));
    std::cout << "Engine sent mode: " << mode << std::endl;
}