import { useEffect } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import TradeNavbar from "../components/trade/trade-navbar";
import TradeOrderBook from "../components/trade/trade-orderbook";
import TradeChart from "../components/trade/trade-chart";
import TradeControlPanel from "../components/trade/trade-controlpannel";
import TradePositions from "../components/trade/trade-positions";
import Symbol from "../components/trade/trade-symbols";
import { Group, Panel } from "react-resizable-panels";


export const Trade = () => {
    // Market data connection
    const { isConnected: isMarketConnected, marketData, subscribe } = useWebSocket("ws://localhost:9000");
    // Order/Executor connection
    const { isConnected: isOrderConnected, sendMessage: sendOrderMessage } = useWebSocket("ws://localhost:9001");

    useEffect(() => {
        // Subscribe to consolidated market data
        if (isMarketConnected) {
            subscribe("ticker_");
        }
    }, [isMarketConnected, subscribe]);

    return (
        <div className="h-screen flex flex-1 overflow-hidden">

        <div className="flex-1 text-white overflow-hidden">     
            <TradeNavbar isConnected={isOrderConnected && isMarketConnected} marketData={marketData} />
            <div className="flex h-[50%] justify-evenly ">
                <div className="min-w-[30%] border border-white/30">
                    <TradeOrderBook marketData={marketData} />
                </div>
                
                    <div className="min-w-[40%] flex-1 border border-white/30">
                        <TradeChart />
                    </div>
                
            </div> 
            <div className="flex">
                
                <div className="h-full flex-1">
                    <TradePositions marketData={marketData} />
                </div>
            </div>

                    
        </div>
            
            <div className="h-[100%] max-w-[30%] flex-1 flex flex-col">
                <div className="flex-1">
                    <Symbol />
                </div>
                <div className="flex-1 mt-2">
                    <TradeControlPanel marketData={marketData} sendMessage={sendOrderMessage} />
                </div>
                
                
            </div>
        </div>
        
    );
};

export default Trade;
