import { useEffect } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import TradeNavbar from "../components/trade/trade-navbar";
import TradeOrderBook from "../components/trade/trade-orderbook";
import TradeChart from "../components/trade/trade-chart";
import TradeControlPanel from "../components/trade/trade-controlpannel";
import TradePositions from "../components/trade/trade-positions";
import { Group, Panel } from "react-resizable-panels";


export const Trade = () => {
    const { isConnected, marketData, sendMessage, subscribe } = useWebSocket();

    useEffect(() => {
        // Subscribe to all market data topics
        subscribe("price_");
        subscribe("bid_");
        subscribe("ask_");
    }, [subscribe]);

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] text-white overflow-hidden">
            
            <TradeNavbar isConnected={isConnected} marketData={marketData} />

            
            <div className="flex-1 flex overflow-hidden min-h-0">
                
            
                <TradeOrderBook marketData={marketData} />

            
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="min-h-[70%]">
                        <TradeChart />
                    </div>
                    
                    <TradePositions />
                </div>

            
                <TradeControlPanel marketData={marketData} sendMessage={sendMessage} />
            </div>
        </div>
    );
};

export default Trade;