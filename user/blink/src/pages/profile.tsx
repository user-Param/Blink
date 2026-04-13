import { useState, useEffect, useMemo } from "react";
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

import { useAccountInfo } from "../hooks/useAccountInfo";
import { useOrderTracking } from "../hooks/useOrderTracking";

export const Profile = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const { accountInfo, totalBalance, loading } = useAccountInfo();
    const { orders, summary } = useOrderTracking();
    const [tradeHistory, setTradeHistory] = useState<any[]>([]);

    useEffect(() => {
        const fetchTradeHistory = () => {
            const ws = new WebSocket('ws://localhost:9001');
            ws.onopen = () => {
                ws.send(JSON.stringify({ type: 'get_trade_history', symbol: 'BTCUSDT' }));
            };
            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'trade_history' && Array.isArray(message.data)) {
                        setTradeHistory(message.data);
                    }
                } catch (e) {
                    console.error('Error fetching trade history:', e);
                }
                ws.close();
            };
        };
        fetchTradeHistory();
    }, []);

    const tradingStats = useMemo(() => {
        const allTrades = [...tradeHistory];
        const totalTrades = allTrades.length;
        
        if (totalTrades === 0) {
            return [
                { label: "Total Trades", value: "0" },
                { label: "Win Rate", value: "0%", color: "text-gray-400" },
                { label: "Profit Factor", value: "0" },
                { label: "Avg. Profit", value: "$0.00", color: "text-gray-400" },
                { label: "Max Drawdown", value: "0%", color: "text-gray-400" },
                { label: "Sharpe Ratio", value: "0" },
            ];
        }

        const winningTrades = allTrades.filter(t => parseFloat(t.realizedPnl || '0') > 0);
        const winRate = ((winningTrades.length / totalTrades) * 100).toFixed(1);
        
        const totalProfit = allTrades.reduce((sum, t) => sum + parseFloat(t.realizedPnl || '0'), 0);
        const totalLoss = Math.abs(allTrades.reduce((sum, t) => {
            const pnl = parseFloat(t.realizedPnl || '0');
            return pnl < 0 ? sum + pnl : sum;
        }, 0));
        
        const profitFactor = totalLoss > 0 ? (totalProfit / totalLoss).toFixed(2) : totalProfit > 0 ? "MAX" : "0.00";
        const avgProfit = (totalProfit / totalTrades).toFixed(2);

        return [
            { label: "Total Trades", value: totalTrades.toString() },
            { label: "Win Rate", value: `${winRate}%`, color: parseFloat(winRate) >= 50 ? "text-green-400" : "text-red-400" },
            { label: "Profit Factor", value: profitFactor },
            { label: "Avg. Profit", value: `$${avgProfit}`, color: parseFloat(avgProfit) >= 0 ? "text-green-400" : "text-red-400" },
            { label: "Max Drawdown", value: "---", color: "text-gray-400" },
            { label: "Sharpe Ratio", value: "---" },
        ];
    }, [tradeHistory]);

    const recentTrades = useMemo(() => {
        if (tradeHistory.length > 0) {
            return tradeHistory.slice(0, 10).map((trade, idx) => ({
                id: trade.id || idx,
                pair: trade.symbol,
                side: trade.isBuyer ? 'BUY' : 'SELL',
                amount: trade.qty,
                pnl: `${parseFloat(trade.realizedPnl || '0') >= 0 ? '+' : ''}$${parseFloat(trade.realizedPnl || '0').toFixed(2)}`,
                status: 'Filled',
                time: new Date(trade.time).toLocaleTimeString(),
            }));
        }
        
        return orders
            .slice(0, 10)
            .map((trade: any, idx: number) => ({
                id: idx,
                pair: trade.symbol,
                side: trade.side?.toUpperCase() || 'BUY',
                amount: trade.quantity?.toString() || '0',
                pnl: trade.status === 'ACCEPTED' ? 'Executing' : 'Pending',
                status: trade.status === 'ACCEPTED' ? 'Filled' : 'Pending',
                time: new Date(trade.timestamp || 0).toLocaleTimeString(),
            }));
    }, [tradeHistory, orders]);

    const monthlyChange = useMemo(() => {
        // Placeholder for monthly change calculation if we had more history
        return (summary.total_unrealized_pnl / (totalBalance || 1) * 100).toFixed(1);
    }, [summary.total_unrealized_pnl, totalBalance]);

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
                        <h1 className="text-3xl font-bold mb-1">{accountInfo?.accountType === 'SPOT' ? 'Trading Account' : 'Account'}</h1>
                        <p className="text-white/50 mb-4">
                            {accountInfo ? `${accountInfo.permissions?.join(' • ')} Account` : 'Loading account info...'}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs border border-green-500/20">
                                {accountInfo?.canTrade ? 'Active • Live Account' : 'Inactive'}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs border border-blue-500/20">
                                {accountInfo ? 'Verified' : 'Verifying...'}
                            </span>
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
                                    <h2 className="text-3xl font-bold">
                                        {loading ? '...' : `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    </h2>
                                </div>
                                <Wallet size={24} className="text-white/80" />
                            </div>
                            <div className="flex items-center gap-2 text-sm bg-white/10 w-fit px-2 py-1 rounded">
                                <ArrowUpRight size={14} />
                                <span>{parseFloat(monthlyChange) >= 0 ? '+' : ''}{monthlyChange}% from open positions</span>
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
                                                {recentTrades.map((trade: any) => (
                                                    <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="py-4 font-medium">{trade.pair}</td>
                                                        <td className="py-4">
                                                            <span className={trade.side === "BUY" ? "text-blue-400" : "text-orange-400"}>
                                                                {trade.side}
                                                            </span>
                                                        </td>
                                                        <td className={`py-4 font-mono ${trade.status === "Filled" ? "text-green-400" : "text-red-400"}`}>
                                                            {trade.pnl}
                                                        </td>
                                                        <td className="py-4 text-white/50">{trade.time}</td>
                                                        <td className="py-4 text-right">
                                                            <div className="flex justify-end">
                                                                {trade.status === "Filled" ? (
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
                                                <p className="text-xs text-green-500">Running • {parseFloat(monthlyChange) >= 0 ? '+' : ''}{monthlyChange}% Today</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                <TrendingUp size={20} className="text-green-500" />
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Grid Bot (BTC)</p>
                                                <p className="text-xs text-blue-500">Active • {summary.positions.length} trades open</p>
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