import { useMemo } from "react";
import { Settings2 } from "lucide-react";

type TradeOrderBookProps = {
  marketData: any;
};

const TradeOrderBook = ({ marketData }: TradeOrderBookProps) => {
  const price = marketData?.price || 65420.50;

  const orderBook = useMemo(() => {
    const asks = Array.from({ length: 12 }, (_, i) => ({
      price: price + (i + 1) * 0.5,
      amount: (Math.random() * 1.5 + 0.1).toFixed(4),
      size: Math.random() * 100
    })).reverse();
    
    const bids = Array.from({ length: 12 }, (_, i) => ({
      price: price - (i + 1) * 0.5,
      amount: (Math.random() * 1.5 + 0.1).toFixed(4),
      size: Math.random() * 100
    }));

    return { asks, bids };
  }, [price]);

  return (
    <div className="w-64 border-r border-white/10 flex flex-col bg-[#0d0d0d] shrink-0">
      <div className="p-3 border-b border-white/10 flex justify-between items-center bg-[#111]">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Order Book</span>
        <Settings2 size={12} className="text-white/20 hover:text-white cursor-pointer transition-colors" />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-2 px-3 py-2 text-[9px] font-bold text-white/20 uppercase tracking-wider border-b border-white/5">
          <span>Price (USDT)</span>
          <span className="text-right">Amount (BTC)</span>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col p-2 space-y-0.5">
          {/* Asks (Sell Orders) */}
          <div className="flex-1 flex flex-col-reverse justify-end min-h-0 overflow-hidden">
            {orderBook.asks.map((ask, i) => (
              <div key={i} className="relative flex justify-between text-[11px] font-mono py-0.5 px-1 hover:bg-red-500/10 group cursor-pointer">
                <div 
                  className="absolute inset-0 bg-red-500/10 origin-right transition-all group-hover:bg-red-500/20" 
                  style={{ width: `${ask.size}%`, left: 'auto' }}
                ></div>
                <span className="text-red-400 relative z-10">{ask.price.toFixed(1)}</span>
                <span className="text-white/60 relative z-10">{ask.amount}</span>
              </div>
            ))}
          </div>

          {/* Spread / Mid Price */}
          <div className="py-3 border-y border-white/5 my-1 flex flex-col items-center justify-center bg-white/5 rounded-lg shadow-inner">
            <span className={`text-lg font-bold font-mono tracking-tight leading-none ${marketData?.price ? "text-green-400" : "text-white"}`}>
              {price.toFixed(2)}
            </span>
            <span className="text-[9px] text-white/20 mt-1 uppercase font-bold tracking-tighter">Spread: 0.50 (0.01%)</span>
          </div>

          {/* Bids (Buy Orders) */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {orderBook.bids.map((bid, i) => (
              <div key={i} className="relative flex justify-between text-[11px] font-mono py-0.5 px-1 hover:bg-green-500/10 group cursor-pointer">
                <div 
                  className="absolute inset-0 bg-green-500/10 origin-left transition-all group-hover:bg-green-500/20" 
                  style={{ width: `${bid.size}%` }}
                ></div>
                <span className="text-green-400 relative z-10">{bid.price.toFixed(1)}</span>
                <span className="text-white/60 relative z-10">{bid.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeOrderBook;