import { useEffect } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import TradeNavbar from "../components/trade/trade-navbar";
import TradeOrderBook from "../components/trade/trade-orderbook";
import TradeChart from "../components/trade/trade-chart";
import TradeControlPanel from "../components/trade/trade-controlpannel";
import TradePositions from "../components/trade/trade-positions";
import TradeRealtimeMonitor from "../components/trade/trade-realtime";
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

                {/* Center: Chart & Positions */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 min-h-0 mb-3">
                        <TradeChart />
                    </div>

                    <div className="h-48 shrink-0">
                        <TradePositions />
                    </div>
                </div>

                {/* Right: Control Panel (Top) & Real-time Monitor (Bottom) */}
                <div className="w-96 shrink-0 flex flex-col gap-3">
                    <div className="h-64 shrink-0">
                        <TradeControlPanel marketData={marketData} sendMessage={sendMessage} />
                    </div>

                    <div className="flex-1 min-h-0">
                        <TradeRealtimeMonitor />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Trade;
