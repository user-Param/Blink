import { ArrowUpRight, Globe } from "lucide-react";

type TradeNavbarProps = {
  isConnected: boolean;
  marketData: any;
};

const TradeNavbar = ({ isConnected, marketData }: TradeNavbarProps) => {
  // Calculate 24h change (mock for now - would come from backend)
  const price24hAgo = 69500;
  const currentPrice = marketData?.price || 0;
  const change24h = currentPrice > 0 ? ((currentPrice - price24hAgo) / price24hAgo) * 100 : 0;
  const high24h = currentPrice > 0 ? currentPrice * 1.01 : 0; // Mock: 1% above current
  const low24h = currentPrice > 0 ? currentPrice * 0.99 : 0;  // Mock: 1% below current
  const volume24h = 12450.85; // Mock volume

  return (
    <div className="h-14 border-b border-white/10 flex items-center px-4 gap-8 bg-[#111] shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold border border-black shadow-lg shadow-orange-500/20">B</div>
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold border border-black shadow-lg shadow-blue-500/20">T</div>
        </div>
        <span className="font-bold text-sm tracking-tight">BTC / USDT</span>
      </div>

      <div className="h-8 w-px bg-white/10"></div>

      <div className="flex flex-col min-w-[100px]">
        <span className={`text-sm font-mono font-bold transition-colors duration-200 ${currentPrice ? "text-green-400" : "text-white/40"}`}>
          {currentPrice ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
        </span>
        <span className="text-[10px] text-white/30">${currentPrice ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</span>
      </div>

      <div className="hidden md:flex flex-col">
        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">24h Change</span>
        <span className={`text-[11px] font-bold flex items-center gap-1 ${change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
          <ArrowUpRight size={12} /> {change24h.toFixed(2)}%
        </span>
      </div>

      <div className="hidden md:flex flex-col">
        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">24h High</span>
        <span className="text-[11px] font-mono text-white/80">{high24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      <div className="hidden md:flex flex-col">
        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">24h Low</span>
        <span className="text-[11px] font-mono text-white/80">{low24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      <div className="hidden lg:flex flex-col">
        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">24h Volume (BTC)</span>
        <span className="text-[11px] font-mono text-white/80">{volume24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500"}`}></span>
          <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest flex items-center gap-2">
            <Globe size={10} className={isConnected ? "animate-spin-slow" : ""} />
            {isConnected ? "Live Network Feed" : "Reconnecting..."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TradeNavbar;