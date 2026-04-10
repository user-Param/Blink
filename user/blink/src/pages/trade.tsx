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
        // Subscribe to consolidated market data
        subscribe("ticker_");
    }, [subscribe]);

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] text-white overflow-hidden">

            <TradeNavbar isConnected={isConnected} marketData={marketData} />


            <div className="flex-1 flex overflow-hidden min-h-0 gap-3 p-3">

                {/* Left: Order Book */}
                <div className="w-64 shrink-0">
                    <TradeOrderBook marketData={marketData} />
                </div>

                {/* Center: Chart & Positions (now expanded) */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 min-h-0 mb-3">
                        <TradeChart />
                    </div>

                    {/* Positions Panel takes full remaining space */}
                    <div className="flex-1 min-h-0">
                        <TradePositions />
                    </div>
                </div>

                {/* Right: Control Panel Only */}
                <div className=" shrink-0">
                    <TradeControlPanel marketData={marketData} sendMessage={sendMessage} />
                </div>

            </div>
        </div>
    );
};

export default Trade;
