import { useState } from "react";
import { 
  User, 
  Settings, 
  History, 
  Wallet, 
  TrendingUp, 
  Shield, 
  Bell,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export const Profile = () => {
    const [activeTab, setActiveTab] = useState("overview");

    const tradingStats = [
        { label: "Total Trades", value: "1,248" },
        { label: "Win Rate", value: "68.4%", color: "text-green-400" },
        { label: "Profit Factor", value: "2.42" },
        { label: "Avg. Profit", value: "$452.00", color: "text-green-400" },
        { label: "Max Drawdown", value: "12.4%", color: "text-red-400" },
        { label: "Sharpe Ratio", value: "1.85" },
    ];

    const recentTrades = [
        { id: 1, pair: "BTC/USDT", side: "Buy", amount: "0.45", pnl: "+$1,240.00", status: "Win", time: "2h ago" },
        { id: 2, pair: "ETH/USDT", side: "Sell", amount: "4.20", pnl: "-$320.50", status: "Loss", time: "5h ago" },
        { id: 3, pair: "SOL/USDT", side: "Buy", amount: "125.0", pnl: "+$842.20", status: "Win", time: "1d ago" },
        { id: 4, pair: "BTC/USDT", side: "Buy", amount: "0.12", pnl: "+$410.00", status: "Win", time: "2d ago" },
    ];

    return (
        <div className="h-full overflow-y-auto bg-[#0a0a0a] text-white p-6 pb-20">
            {/* Header Section */}
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-[#FF6D1F]/20 flex items-center justify-center border-2 border-[#FF6D1F]">
                            <User size={48} className="text-[#FF6D1F]" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-[#0a0a0a] rounded-full"></div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold mb-1">Param</h1>
                        <p className="text-white/50 mb-4">param@blink.com • Pro Algo Trader</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs border border-green-500/20">Active • Live Account</span>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs border border-blue-500/20">Verified</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/10 flex items-center gap-2 text-sm">
                            <Settings size={16} /> Edit Profile
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Stats & Balance */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Balance Card */}
                        <div className="p-6 rounded-2xl bg-[#FF6D1F] text-white shadow-lg shadow-[#FF6D1F]/10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-white/80 text-sm mb-1">Total Balance</p>
                                    <h2 className="text-3xl font-bold">$200000.00</h2>
                                </div>
                                <Wallet size={24} className="text-white/80" />
                            </div>
                            <div className="flex items-center gap-2 text-sm bg-white/10 w-fit px-2 py-1 rounded">
                                <ArrowUpRight size={14} />
                                <span>+12.5% this month</span>
                            </div>
                        </div>

                        {/* Trading Stats */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-6 text-white/70">
                                <TrendingUp size={20} />
                                <h3 className="font-semibold text-lg">Performance</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {tradingStats.map((stat, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-white/40 text-xs mb-1">{stat.label}</p>
                                        <p className={`font-bold ${stat.color || "text-white"}`}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security & Settings Quick Access */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="font-semibold text-lg mb-4">Quick Settings</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Shield size={18} className="text-blue-400" />
                                        <span className="text-sm">API Management</span>
                                    </div>
                                    <span className="text-white/30 group-hover:text-white transition-colors">→</span>
                                </button>
                                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Bell size={18} className="text-yellow-400" />
                                        <span className="text-sm">Notifications</span>
                                    </div>
                                    <span className="text-white/30 group-hover:text-white transition-colors">→</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Trading History & Active Strategies */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-4 border-b border-white/10 pb-px mb-2">
                            {["overview", "history", "strategies"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 px-2 text-sm font-medium transition-all relative ${
                                        activeTab === tab ? "text-[#FF6D1F]" : "text-white/40 hover:text-white"
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6D1F]"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {activeTab === "overview" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Recent Trades Table */}
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-2">
                                            <History size={20} className="text-white/70" />
                                            <h3 className="font-semibold text-lg">Recent Trades</h3>
                                        </div>
                                        <button className="text-xs text-[#FF6D1F] hover:underline">View All</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-white/30 text-xs border-b border-white/10">
                                                    <th className="pb-4 font-medium">Instrument</th>
                                                    <th className="pb-4 font-medium">Side</th>
                                                    <th className="pb-4 font-medium">P&L</th>
                                                    <th className="pb-4 font-medium">Time</th>
                                                    <th className="pb-4 font-medium text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {recentTrades.map((trade) => (
                                                    <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="py-4 font-medium">{trade.pair}</td>
                                                        <td className="py-4">
                                                            <span className={trade.side === "Buy" ? "text-blue-400" : "text-orange-400"}>
                                                                {trade.side}
                                                            </span>
                                                        </td>
                                                        <td className={`py-4 font-mono ${trade.status === "Win" ? "text-green-400" : "text-red-400"}`}>
                                                            {trade.pnl}
                                                        </td>
                                                        <td className="py-4 text-white/50">{trade.time}</td>
                                                        <td className="py-4 text-right">
                                                            <div className="flex justify-end">
                                                                {trade.status === "Win" ? (
                                                                    <CheckCircle2 size={18} className="text-green-500" />
                                                                ) : (
                                                                    <XCircle size={18} className="text-red-500" />
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Active Strategies Preview */}
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <h3 className="font-semibold text-lg mb-4">Active Strategies</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Trend Follower V2</p>
                                                <p className="text-xs text-green-500">Running • +2.4% Today</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                <TrendingUp size={20} className="text-green-500" />
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Grid Bot (BTC)</p>
                                                <p className="text-xs text-blue-500">Active • 12 trades open</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <History size={20} className="text-blue-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div className="flex flex-col items-center justify-center py-20 text-white/30 animate-in fade-in duration-500">
                                <History size={48} className="mb-4 opacity-20" />
                                <p>Extended trade history will be loaded here.</p>
                            </div>
                        )}

                        {activeTab === "strategies" && (
                            <div className="flex flex-col items-center justify-center py-20 text-white/30 animate-in fade-in duration-500">
                                <TrendingUp size={48} className="mb-4 opacity-20" />
                                <p>Detailed strategy performance analysis.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};