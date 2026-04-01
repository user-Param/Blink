import { useState } from "react";
import { Wallet, Shield, Play, Square, Settings2, Info } from "lucide-react";

type TradeControlPanelProps = {
  marketData: any;
  sendMessage: (msg: string) => void;
};

const TradeControlPanel = ({ marketData, sendMessage }: TradeControlPanelProps) => {
  const [tradeMode, setTradeMode] = useState<"manual" | "auto">("manual");
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [amount, setAmount] = useState("");

  const strategies = [
    { id: "tf-1", name: "Trend Follower V2", desc: "HFT Optimized • Momentum", pnl: "+12.4%" },
    { id: "mr-1", name: "Mean Reversion", desc: "Mean Reverting • Low Vol", pnl: "-2.1%" },
    { id: "gb-1", name: "Grid Bot Alpha", desc: "Sideways Markets", pnl: "+5.8%" },
  ];

  const handleOrder = (side: "buy" | "sell") => {
    sendMessage(JSON.stringify({
      action: "place_order",
      side,
      type: orderType,
      amount: parseFloat(amount),
      price: orderType === "limit" ? marketData?.price : null
    }));
    setAmount("");
  };

  const toggleStrategy = (id: string) => {
    if (activeStrategy === id) {
      setActiveStrategy(null);
      sendMessage(JSON.stringify({ mode: "_Live", action: "stop", strategyId: id }));
    } else {
      setActiveStrategy(id);
      sendMessage(JSON.stringify({ mode: "_Live", action: "start", strategyId: id }));
    }
  };

  return (
    <div className="w-80 flex flex-col bg-[#111] shrink-0">
      {/* Mode Switcher */}
      <div className="p-4 flex gap-1 bg-[#0d0d0d] border-b border-white/5">
        <button 
          onClick={() => setTradeMode("manual")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${tradeMode === "manual" ? "bg-white/10 text-white border border-white/10 shadow-lg" : "text-white/30 hover:text-white hover:bg-white/5"}`}
        >
          Manual
        </button>
        <button 
          onClick={() => setTradeMode("auto")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${tradeMode === "auto" ? "bg-[#FF6D1F] text-white shadow-[0_0_20px_rgba(255,109,31,0.3)]" : "text-white/30 hover:text-white hover:bg-white/5"}`}
        >
          Algorithmic
        </button>
      </div>

      {tradeMode === "manual" ? (
        <div className="flex-1 p-5 flex flex-col space-y-6 overflow-y-auto custom-scrollbar">
          {/* Order Type Selector */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            {["limit", "market"].map((t) => (
              <button 
                key={t}
                onClick={() => setOrderType(t as any)} 
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${orderType === t ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-white/30 px-1 uppercase tracking-tighter">
                <span>Price</span>
                <span>USDT</span>
              </div>
              <div className="relative group">
                <input 
                  type="number" 
                  placeholder={orderType === "market" ? "Market Price" : "65420.50"}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-[#FF6D1F]/50 transition-all placeholder:text-white/10"
                  value={orderType === "limit" ? marketData?.price?.toFixed(2) : ""}
                  readOnly={orderType === "market"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-white/30 px-1 uppercase tracking-tighter">
                <span>Amount</span>
                <span className="flex items-center gap-1 text-[#FF6D1F]/60 cursor-pointer hover:text-[#FF6D1F] transition-colors"><Wallet size={10} /> 12,450.00</span>
              </div>
              <div className="relative group">
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-[#FF6D1F]/50 transition-all"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20">BTC</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => handleOrder("buy")}
              className="py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-green-500/20 transition-all active:scale-[0.95]"
            >
              Buy
            </button>
            <button 
              onClick={() => handleOrder("sell")}
              className="py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-[0.95]"
            >
              Sell
            </button>
          </div>

          {/* Risk Info */}
          <div className="mt-auto p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-white/40">
                <Info size={14} />
                <span className="text-[10px] font-bold uppercase">Order Value</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
                <span className="text-white/20">Est. Total</span>
                <span className="text-white font-bold">{(parseFloat(amount || "0") * (marketData?.price || 0)).toFixed(2)} USDT</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-5 flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Active Strategies</span>
            <Settings2 size={14} className="text-white/20 hover:text-white cursor-pointer" />
          </div>

          <div className="space-y-3">
            {strategies.map((strat) => (
              <div 
                key={strat.id} 
                className={`p-4 rounded-2xl border transition-all duration-300 ${activeStrategy === strat.id ? "bg-[#FF6D1F]/10 border-[#FF6D1F]/30 shadow-lg shadow-[#FF6D1F]/5" : "bg-black/30 border-white/5 hover:border-white/10"}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className={`font-bold text-sm ${activeStrategy === strat.id ? "text-white" : "text-white/80"}`}>{strat.name}</h4>
                    <p className="text-[10px] text-white/20 mt-0.5">{strat.desc}</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-black ${strat.pnl.startsWith("+") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {strat.pnl}
                  </div>
                </div>
                
                <button 
                  onClick={() => toggleStrategy(strat.id)}
                  className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeStrategy === strat.id ? "bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30" : "bg-[#FF6D1F] text-white shadow-lg shadow-[#FF6D1F]/20 hover:bg-[#e55d1a]"}`}
                >
                  {activeStrategy === strat.id ? (
                    <><Square size={12} fill="currentColor" className="animate-pulse" /> Stop Strategy</>
                  ) : (
                    <><Play size={12} fill="currentColor" /> Deploy Algo</>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Risk Shield */}
          <div className="mt-auto p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Shield size={40} />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Shield size={16} />
              </div>
              <div>
                <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Risk Manager</h5>
                <p className="text-[11px] font-bold text-white/80 uppercase">Active Guard</p>
              </div>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between text-[10px] uppercase font-bold">
                <span className="text-white/20">Global Drawdown</span>
                <span className="text-blue-400">2.0% MAX</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[15%] shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeControlPanel;