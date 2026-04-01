import { useState } from "react";
import { LayoutDashboard, History, ListFilter, ArrowDownRight, ArrowUpRight } from "lucide-react";

const TradePositions = () => {
  const [activeTab, setActiveTab] = useState("Positions");

  const tabs = ["Open Orders", "Positions", "Trade History", "Funds"];

  const mockPositions = [
    { id: 1, symbol: "BTC/USDT", side: "Long", size: "0.45", entry: "64,210.50", mark: "65,420.50", pnl: "+$544.50", pnlPct: "+1.88%", margin: "1,240.00" },
  ];

  return (
    <div className="h-64 border-t border-white/10 bg-[#0d0d0d] flex flex-col min-h-0">
      {/* Tabs Header */}
      <div className="flex border-b border-white/5 bg-[#111] shrink-0">
        {tabs.map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? "text-[#FF6D1F]" : "text-white/20 hover:text-white/40"}`}
          >
            {tab}
            {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6D1F] shadow-[0_0_8px_rgba(255,109,31,0.5)]"></div>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center px-4 gap-4">
            <ListFilter size={14} className="text-white/20 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {activeTab === "Positions" ? (
          <div className="min-w-[800px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] font-black text-white/20 uppercase tracking-tighter border-b border-white/5 bg-[#0a0a0a]/50">
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Side</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Entry Price</th>
                  <th className="px-4 py-3">Mark Price</th>
                  <th className="px-4 py-3">Margin (USDT)</th>
                  <th className="px-4 py-3">Unrealized P&L</th>
                  <th className="px-4 py-3 text-right">Close</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-medium">
                {mockPositions.map((pos) => (
                  <tr key={pos.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-4 font-bold text-white/90">{pos.symbol}</td>
                    <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${pos.side === "Long" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                            {pos.side}
                        </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-white/60">{pos.size} BTC</td>
                    <td className="px-4 py-4 font-mono text-white/60">{pos.entry}</td>
                    <td className="px-4 py-4 font-mono text-white/60">{pos.mark}</td>
                    <td className="px-4 py-4 font-mono text-white/60">{pos.margin}</td>
                    <td className="px-4 py-4 font-mono">
                        <div className="flex items-center gap-1 text-green-400 font-bold">
                            <ArrowUpRight size={12} />
                            <span>{pos.pnl}</span>
                            <span className="text-[9px] text-green-400/60 ml-1">({pos.pnlPct})</span>
                        </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                        <button className="text-[10px] font-bold bg-white/5 border border-white/5 px-3 py-1 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100">
                            Market Close
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/10 gap-3 py-8">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <LayoutDashboard size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">No active {activeTab.toLowerCase()} data</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="h-8 border-t border-white/5 bg-[#0a0a0a] flex items-center px-4 justify-between shrink-0">
        <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-white/20 uppercase">Equity</span>
                <span className="text-[10px] font-mono text-white font-bold">$124,560.00</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-white/20 uppercase">Available</span>
                <span className="text-[10px] font-mono text-white font-bold">$12,450.00</span>
            </div>
        </div>
        <div className="text-[9px] font-black text-[#FF6D1F] uppercase tracking-widest animate-pulse">
            Trading Engine Ready
        </div>
      </div>
    </div>
  );
};

export default TradePositions;