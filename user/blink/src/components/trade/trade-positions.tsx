import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, TrendingUp, TrendingDown, XCircle, AlertCircle, Clock, Activity } from "lucide-react";
import { useOrderTracking } from "../../hooks/useOrderTracking";

interface LiveOrder {
  id: string;
  order_id: string;
  strategy_id: string;
  side: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ERROR';
  exchange_order_id?: string;
  message?: string;
  timestamp: number;
}

const TradePositions = () => {
  const [activeTab, setActiveTab] = useState("Open Orders");
  const { positions, summary, orders, isConnected } = useOrderTracking();
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const liveOrdersRef = useRef<LiveOrder[]>([]);

  const tabs = ["Open Orders", "Positions", "Trade History", "Live Activity", "Funds"];

  // Get open/pending orders
  const openOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "ACCEPTED"
  );

  // Get filled orders (closed positions for history)
  const tradeHistory = orders.filter(
    (o) => o.status === "ACCEPTED"
  ).slice(0, 10);

  // Connect to executor for live activity stream
  useEffect(() => {
    const connectToExecutor = () => {
      try {
        const websocket = new WebSocket('ws://localhost:9001');

        websocket.onopen = () => {
          console.log('[TradePositions] Connected to executor for live activity');
        };

        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'order_result') {
              const newOrder: LiveOrder = {
                id: `${data.timestamp}-${Math.random()}`,
                order_id: data.order_id,
                strategy_id: data.strategy_id || 'default',
                side: data.side || 'BUY',
                symbol: data.symbol || 'UNKNOWN',
                quantity: data.quantity || 1,
                price: data.price || 0,
                status: data.status,
                exchange_order_id: data.exchange_order_id,
                message: data.message,
                timestamp: data.timestamp
              };
              
              
              liveOrdersRef.current = [newOrder, ...liveOrdersRef.current].slice(0, 100);
              setLiveOrders([...liveOrdersRef.current]);
            }
          } catch (e) {
            console.log('[TradePositions] Message received:', event.data);
          }
        };

        websocket.onerror = () => {
          console.error('[TradePositions] WebSocket error');
        };

        websocket.onclose = () => {
          console.log('[TradePositions] Disconnected from executor');
          setTimeout(connectToExecutor, 3000);
        };

        return () => {
          websocket.close();
        };
      } catch (error) {
        console.error('[TradePositions] Connection error:', error);
      }
    };

    connectToExecutor();
  }, []);

  return (
    <div className="flex h-full
    flex-col overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-white/5 bg-[#111] shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab
                ? "text-[#FF6D1F]"
                : "text-white/20 hover:text-white/40"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6D1F] shadow-[0_0_8px_rgba(255,109,31,0.5)]"></div>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center px-4 gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          ></div>
          <span className="text-[8px] text-white/40 font-black uppercase">
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {/* OPEN ORDERS TAB */}
        {activeTab === "Open Orders" ? (
          <div className="min-w-[900px]">
            {openOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/10 gap-3">
                <Clock size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  No open orders
                </span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] font-black text-white/20 uppercase tracking-tighter border-b border-white/5 bg-[#0a0a0a]/50">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Strategy</th>
                    <th className="px-4 py-3">Symbol</th>
                    <th className="px-4 py-3">Side</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Message</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium">
                  {openOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-white/60 text-[9px]">
                        {order.order_id.substring(0, 20)}...
                      </td>
                      <td className="px-4 py-3 text-white/60">
                        {order.strategy_id}
                      </td>
                      <td className="px-4 py-3 font-bold text-white/90">
                        {order.symbol}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            order.side === "BUY"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {order.side}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-white/60">
                        {order.quantity}
                      </td>
                      <td className="px-4 py-3 font-mono text-white/60">
                        ${order.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            order.status === "ACCEPTED"
                              ? "bg-green-500/10 text-green-500"
                              : order.status === "PENDING"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-[9px]">
                        {order.message || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}

        {/* POSITIONS TAB */}
        {activeTab === "Positions" ? (
          <div className="min-w-[900px]">
            {positions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/10 gap-3">
                <LayoutDashboard size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  No active positions
                </span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] font-black text-white/20 uppercase tracking-tighter border-b border-white/5 bg-[#0a0a0a]/50">
                    <th className="px-4 py-3">Symbol</th>
                    <th className="px-4 py-3">Side</th>
                    <th className="px-4 py-3">Filled</th>
                    <th className="px-4 py-3">Unfilled</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Entry Price</th>
                    <th className="px-4 py-3">Mark Price</th>
                    <th className="px-4 py-3">Unrealized P&L</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium">
                  {positions.map((pos) => (
                    <tr
                      key={pos.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-4 py-4 font-bold text-white/90">
                        {pos.symbol}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black flex items-center gap-1 w-fit ${
                            pos.side === "Long"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {pos.side === "Long" ? (
                            <TrendingUp size={12} />
                          ) : (
                            <TrendingDown size={12} />
                          )}
                          {pos.side}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-green-400">
                        {pos.filled_quantity}
                        <span className="text-[9px] text-green-400/60 ml-1">
                          ✓
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-orange-400">
                        {pos.unfilled_quantity}
                        {pos.unfilled_quantity > 0 && (
                          <span className="text-[9px] text-orange-400/60 ml-1">
                            ⏳
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono text-white/60">
                        {pos.total_quantity}
                      </td>
                      <td className="px-4 py-4 font-mono text-white/60">
                        ${pos.avg_entry_price.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 font-mono text-white/60">
                        ${pos.current_mark_price.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 font-mono">
                        <div
                          className={`flex items-center gap-1 font-bold ${
                            pos.unrealized_pnl >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {pos.unrealized_pnl >= 0 ? (
                            <TrendingUp size={12} />
                          ) : (
                            <TrendingDown size={12} />
                          )}
                          <span>${Math.abs(pos.unrealized_pnl).toFixed(2)}</span>
                          <span className="text-[9px] opacity-60">
                            ({pos.unrealized_pnl_pct.toFixed(2)}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black inline-flex items-center gap-1 ${
                            pos.status === "OPEN"
                              ? "bg-blue-500/10 text-blue-400"
                              : pos.status === "PARTIALLY_FILLED"
                              ? "bg-orange-500/10 text-orange-400"
                              : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {pos.status === "PARTIALLY_FILLED" && (
                            <AlertCircle size={10} />
                          )}
                          {pos.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}

        {/* TRADE HISTORY TAB */}
        {activeTab === "Trade History" ? (
          <div className="min-w-[900px]">
            {tradeHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/10 gap-3">
                <LayoutDashboard size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  No trade history
                </span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] font-black text-white/20 uppercase tracking-tighter border-b border-white/5 bg-[#0a0a0a]/50">
                    <th className="px-4 py-3">Symbol</th>
                    <th className="px-4 py-3">Side</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Entry Price</th>
                    <th className="px-4 py-3">Strategy</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium">
                  {tradeHistory.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-white/90">
                        {order.symbol}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            order.side === "BUY"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {order.side}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-white/60">
                        {order.quantity}
                      </td>
                      <td className="px-4 py-3 font-mono text-white/60">
                        ${order.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-white/60">
                        {order.strategy_id}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-green-500/10 text-green-500">
                          FILLED
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-[9px]">
                        {new Date(order.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}

        {/* LIVE ACTIVITY TAB */}
        {activeTab === "Live Activity" ? (
          <div className="min-w-[900px]">
            {liveOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/10 gap-3">
                <Activity size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Waiting for orders...
                </span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] font-black text-white/20 uppercase tracking-tighter border-b border-white/5 bg-[#0a0a0a]/50">
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Strategy</th>
                    <th className="px-4 py-3">Symbol</th>
                    <th className="px-4 py-3">Side</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Message</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium">
                  {liveOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-white/60 text-[9px]">
                        {new Date(order.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-white/60">
                        {order.strategy_id}
                      </td>
                      <td className="px-4 py-3 font-bold text-white/90">
                        {order.symbol}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            order.side === "BUY"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {order.side}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-white/60">
                        {order.quantity}
                      </td>
                      <td className="px-4 py-3 font-mono text-white/60">
                        ${order.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            order.status === "ACCEPTED"
                              ? "bg-green-500/10 text-green-500"
                              : order.status === "PENDING"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-[9px] max-w-xs truncate">
                        {order.message || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}

        {/* FUNDS TAB */}
        {activeTab === "Funds" ? (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-[9px] font-black text-white/40 uppercase">
                  Total Equity
                </div>
                <div className="text-xl font-bold text-white/90 mt-2">
                  ${summary.total_equity.toFixed(2)}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-[9px] font-black text-white/40 uppercase">
                  Total Margin Used
                </div>
                <div className="text-xl font-bold text-orange-400 mt-2">
                  ${summary.total_margin.toFixed(2)}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-[9px] font-black text-white/40 uppercase">
                  Available Margin
                </div>
                <div className="text-xl font-bold text-green-400 mt-2">
                  ${summary.available_margin.toFixed(2)}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-[9px] font-black text-white/40 uppercase">
                  Unrealized P&L
                </div>
                <div
                  className={`text-xl font-bold mt-2 ${
                    summary.total_unrealized_pnl >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  ${Math.abs(summary.total_unrealized_pnl).toFixed(2)}
                  <span className="text-[9px] ml-1 opacity-60">
                    ({summary.total_unrealized_pnl_pct.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      
    </div>
  );
};

export default TradePositions;
