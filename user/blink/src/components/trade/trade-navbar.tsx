import { useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";

type TradeNavbarProps = {
  isConnected: boolean;
  marketData: any;
  sendMessage?: (msg: string) => void;
};


type ExchangeOption = {
  id: "BINANCE" | "JUPITER";
  label: string;
  color: string;        // accent colour for the badge
  badgeBg: string;      // tailwind bg class
  dotColor: string;     // live-dot colour
};
 
const EXCHANGES: ExchangeOption[] = [
  {
    id: "BINANCE",
    label: "Binance",
    color: "#00ff04",
    badgeBg: "transparent",
    dotColor: "bg-yellow-400",
  },
  {
    id: "JUPITER",
    label: "Jupiter",
    color: "#ff0000",
    badgeBg: "transparent",
    dotColor: "bg-violet-400",
  },
];


const TradeNavbar = ({ isConnected, marketData, sendMessage }: TradeNavbarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<ExchangeOption>(EXCHANGES[0]);

  // Calculate 24h change (mock for now - would come from backend)
  const price24hAgo = 69500;
  const currentPrice = marketData?.price || 0;
  const change24h = currentPrice > 0 ? ((currentPrice - price24hAgo) / price24hAgo) * 100 : 0;
  const high24h = currentPrice > 0 ? currentPrice * 1.01 : 0; // Mock: 1% above current
  const low24h = currentPrice > 0 ? currentPrice * 0.99 : 0;  // Mock: 1% below current
  const volume24h = 12450.85; // Mock volume

  const handleSelectExchange = (ex: ExchangeOption) => {
    if (ex.id === selectedExchange.id) {
      setDropdownOpen(false);
      return;
    }
    setSelectedExchange(ex);
    setDropdownOpen(false);
 
    // Notify the engine/broker via the existing WebSocket channel
    if (sendMessage) {
      sendMessage(
        JSON.stringify({
          type: "switch_exchange",
          exchange: ex.id,          // "BINANCE" | "JUPITER"
        })
      );
    }
  };

  return (
    <div className="h-14 flex items-center px-4 gap-8 bg-[#111] shrink-0 border border-white/30">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold  shadow-lg shadow-orange-500/20">B</div>
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold  shadow-lg shadow-blue-500/20">T</div>
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
        
      </div>

      <div className="ml-auto relative">
        {/* Trigger button */}
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border border-white/10 text-[11px] font-bold
                       transition-all duration-200 hover:brightness-110 select-none
                       ${selectedExchange.badgeBg}`}
        >
          {/* Live dot */}
          <span
            className={`w-1.5 h-1.5 rounded-full ${selectedExchange.dotColor} ${
              isConnected ? "animate-pulse" : "opacity-30"
            }`}
          />
          {selectedExchange.label}
          <ChevronDown
            size={11}
            className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>
 
        {/* Dropdown */}
        {dropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-40 rounded-sm 
                        bg-[#111] shadow-2xl z-50 overflow-hidden border border-white/30"
          >
            <div className="px-3 py-2">
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">
                Data Source
              </p>
            </div>
 
            {EXCHANGES.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleSelectExchange(ex)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-semibold
                             transition-all duration-150 hover:bg-white/5
                             ${
                               selectedExchange.id === ex.id
                                 ? "text-white bg-white/5"
                                 : "text-white/50"
                             }`}
              >
                {/* Colour dot */}
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ex.color }}
                />
                {ex.label}
                {selectedExchange.id === ex.id && (
                  <span className="ml-auto text-[9px] text-white/30 font-bold uppercase tracking-wider">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
 
      {/* Click-away overlay */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default TradeNavbar;