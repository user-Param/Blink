#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <cstdlib>
#include <iostream>
#include <string>
#include <memory>
#include "../include/algoManager.h"
#include "../include/riskManager.h"
#include "../include/algo.h"
#include "../include/engine.h"

namespace beast = boost::beast;         
namespace http = beast::http;           
namespace websocket = beast::websocket; 
namespace net = boost::asio;            
using tcp = boost::asio::ip::tcp;   




class PrintAlgo : public Algo {
public:
    void onTick(const MarketData& data) override {
        std::cout << "Algo received: " << data.symbol << " @ " << data.price << std::endl;
    }
};












int main(int argc, char** argv)
{
    if(argc != 4)
        {
            std::cerr <<
                "Usage: websocket-client-sync <host> <port> <text>\n" <<
                "Example:\n" <<
                "    websocket-client-sync echo.websocket.org 80 \"Hello, world!\"\n";
            return EXIT_FAILURE;
        }
        std::string host = argv[1];
        auto const  port = argv[2];
        auto const  text = argv[3];

        net::io_context ioc;

        tcp::resolver resolver{ioc};
        websocket::stream<tcp::socket> ws{ioc};

        auto const results = resolver.resolve(host, port);

        auto ep = net::connect(ws.next_layer(), results);

        host += ':' + std::to_string(ep.port());

        ws.set_option(websocket::stream_base::decorator(
            [](websocket::request_type& req)
            {
                req.set(http::field::user_agent,
                    std::string(BOOST_BEAST_VERSION_STRING) +
                        " websocket-client-coro");
            }));

        ws.handshake(host, "/");
        ws.write(net::buffer(std::string(text)));
        beast::flat_buffer buffer;
        ws.read(buffer);
    try
    {
        
        auto riskMgr = std::make_shared<RiskManager>();
        auto algoMgr = std::make_shared<AlgoManager>(riskMgr);
        algoMgr->addAlgo(std::make_unique<PrintAlgo>());

        Engine engine(algoMgr);
        engine.setTopics({"price_", "bid_", "ask_"});
        engine.start();

        std::this_thread::sleep_for(std::chrono::seconds(2));
        engine.sendMode("_Backtest");



        std::cout << "Engine started. Press Enter to stop." << std::endl;
        std::cin.get();

        engine.stop();

        ws.close(websocket::close_code::normal);
        std::cout << beast::make_printable(buffer.data()) << std::endl;
    }
    catch(std::exception const& e)
    {
        std::cerr << "Error: " << e.what() << std::endl;
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}