import { useState } from "react";
import { MessageCircle, ArrowUpRight, Clock, TrendingUp } from "lucide-react";

// Mock strategies posted by the community
const strategies = [
  {
    id: 1,
    name: "Golden Cross ETH",
    author: "Alex Quant",
    language: "Python",
    description: "50/200 EMA crossover on ETHUSDT",
    winRate: "68%",
    backtestReturn: "+124.5%",
    postedAgo: "2h ago",
    comments: 14,
  },
  {
    id: 2,
    name: "RSI Scalper",
    author: "TraderJoe",
    language: "C++",
    description: "Ultra-low latency RSI mean reversion",
    winRate: "72%",
    backtestReturn: "+98.3%",
    postedAgo: "5h ago",
    comments: 23,
  },
  {
    id: 3,
    name: "Grid Bot SOL",
    author: "SolSurfer",
    language: "Python",
    description: "Dynamic grid levels for SOLUSDT",
    winRate: "61%",
    backtestReturn: "+55.7%",
    postedAgo: "8h ago",
    comments: 8,
  },
  {
    id: 4,
    name: "Breakout Sniper",
    author: "ChartMaster",
    language: "C++",
    description: "Volume + ATR breakout detection",
    winRate: "79%",
    backtestReturn: "+213.4%",
    postedAgo: "12h ago",
    comments: 31,
  },
  {
    id: 5,
    name: "Momentum Reversal",
    author: "DeepQuant",
    language: "Python",
    description: "RSI divergence + MACD confirmation",
    winRate: "63%",
    backtestReturn: "+87.9%",
    postedAgo: "1d ago",
    comments: 19,

  },
  {
    id: 6,
    name: "Scalping AI",
    author: "MLTrader",
    language: "Python",
    description: "LSTM model for 1m BTCUSDT",
    winRate: "71%",
    backtestReturn: "+156.2%",
    postedAgo: "2d ago",
    comments: 42,
  },
  {
    id: 1,
    name: "Golden Cross ETH",
    author: "Alex Quant",
    language: "Python",
    description: "50/200 EMA crossover on ETHUSDT hourly",
    winRate: "68%",
    backtestReturn: "+124.5%",
    postedAgo: "2h ago",
    comments: 14,
  },
  {
    id: 2,
    name: "RSI Scalper",
    author: "TraderJoe",
    language: "C++",
    description: "Ultra-low latency RSI mean reversion",
    winRate: "72%",
    backtestReturn: "+98.3%",
    postedAgo: "5h ago",
    comments: 23,
  },
  {
    id: 3,
    name: "Grid Bot SOL",
    author: "SolSurfer",
    language: "Python",
    description: "Dynamic grid levels for SOLUSDT",
    winRate: "61%",
    backtestReturn: "+55.7%",
    postedAgo: "8h ago",
    comments: 8,
  },
  {
    id: 4,
    name: "Breakout Sniper",
    author: "ChartMaster",
    language: "C++",
    description: "Volume + ATR breakout detection",
    winRate: "79%",
    backtestReturn: "+213.4%",
    postedAgo: "12h ago",
    comments: 31,
  },
  {
    id: 5,
    name: "Momentum Reversal",
    author: "DeepQuant",
    language: "Python",
    description: "RSI divergence + MACD confirmation",
    winRate: "63%",
    backtestReturn: "+87.9%",
    postedAgo: "1d ago",
    comments: 19,
  },
  {
    id: 6,
    name: "Scalping AI",
    author: "MLTrader",
    language: "Python",
    description: "LSTM model for 1m BTCUSDT",
    winRate: "71%",
    backtestReturn: "+156.2%",
    postedAgo: "2d ago",
    comments: 42,
  },
  {
    id: 1,
    name: "Golden Cross ETH",
    author: "Alex Quant",
    language: "Python",
    description: "50/200 EMA crossover on ETHUSDT hourly",
    winRate: "68%",
    backtestReturn: "+124.5%",
    postedAgo: "2h ago",
    comments: 14,
  },
  {
    id: 2,
    name: "RSI Scalper",
    author: "TraderJoe",
    language: "C++",
    description: "Ultra-low latency RSI mean reversion",
    winRate: "72%",
    backtestReturn: "+98.3%",
    postedAgo: "5h ago",
    comments: 23,
  },
  {
    id: 3,
    name: "Grid Bot SOL",
    author: "SolSurfer",
    language: "Python",
    description: "Dynamic grid levels for SOLUSDT",
    winRate: "61%",
    backtestReturn: "+55.7%",
    postedAgo: "8h ago",
    comments: 8,
  },
  {
    id: 4,
    name: "Breakout Sniper",
    author: "ChartMaster",
    language: "C++",
    description: "Volume + ATR breakout detection",
    winRate: "79%",
    backtestReturn: "+213.4%",
    postedAgo: "12h ago",
    comments: 31,
  },
  {
    id: 5,
    name: "Momentum Reversal",
    author: "DeepQuant",
    language: "Python",
    description: "RSI divergence + MACD confirmation",
    winRate: "63%",
    backtestReturn: "+87.9%",
    postedAgo: "1d ago",
    comments: 19,
  },
  {
    id: 6,
    name: "Scalping AI",
    author: "MLTrader",
    language: "Python",
    description: "LSTM model for 1m BTCUSDT",
    winRate: "71%",
    backtestReturn: "+156.2%",
    postedAgo: "2d ago",
    comments: 42,
  },
];

const tabs = ["Social", "Leaderboard", "Trending now"];

const Social = () => {
  const [activeTab, setActiveTab] = useState("Home");

  return (
    <div className="h-full overflow-y-auto text-white">
      {/* Tabs / Top Navigation */}
      <div className="flex items-center gap-1 px-6 py-4 border-b border-white/10 bg-[#111] sticky top-0 z-20">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        
        <div className="text-xl font-bold mb-6">Trending tokens</div>
        <div className="text-xl font-bold mb-6">Trending strategies</div>
        <div className="text-xl font-bold mb-6">Explore Strategies</div>

        {/* Strategy Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((s) => (
            <div
              key={s.id}
              className="bg-[#111] border border-white/10 p-5 hover:border-[#FF6D1F]/30 transition-all hover:shadow-lg hover:shadow-[#FF6D1F]/5 group cursor-pointer"
            >
              {/* Header: Image Placeholder + Name/Language + WinRate */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2">
                  <div>
                    {/* IMAGE PLACEHOLDER - exactly as requested */}
                    <div className="min-h-[100px] border border-white/20 bg-black/20 w-[100%]" />
                    <p className="text-white transition-colors mt-2">
                      {s.name}
                    </p>
                    <p className="text-xs text-white/40">
                      {s.language} • by {s.author}
                    </p>
                  </div>
                </div>
                
              </div>

              {/* Description */}
              <p className="text-sm text-white/50 mb-4 leading-relaxed">
                {s.description}
              </p>

              {/* Stats Row */}
              <div className="gap-3 items-center text-xs text-white/30 mb-4">
                <span className="flex items-center">
                  <Clock size={12} />
                  {s.postedAgo}
                </span>
                <span className="font-mono text-green-400">
                  {s.backtestReturn}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={14} className="text-white/40" />
                  {s.comments}
                </span>
              </div>

              {/* Action Button */}
              <button className="w-full py-2.5 bg-white/5 hover:bg-[#FF6D1F]/10 border border-white/5 hover:border-[#FF6D1F]/30 text-xs font-bold text-white/80 hover:text-[#FF6D1F] transition-all flex items-center justify-center gap-2">
                <ArrowUpRight size={14} />
                View & Deploy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Social;