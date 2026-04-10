import { useState, useEffect } from "react";
import { Plus, X, Upload, Play, Database, FileText, Activity, TrendingUp, TrendingDown, BarChart3, Download } from "lucide-react";
import SimulateCard from "./simulate-card";
import { useWebSocket } from "../../hooks/useWebSocket";

type Dataset = {
    id: string;
    title: string;
    description: string;
    stocks: string;
    date: string;
    source: string;
    fileName: string;
};

const Simulate = () => {
    const { isConnected, marketData, sendMessage, subscribe } = useWebSocket();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
    const [selectedStrategy, setSelectedStrategy] = useState("Trend Follower");
    const [showBacktestOverlay, setShowBacktestOverlay] = useState(false);
    const [initialCapital, setInitialCapital] = useState<number>(10000);
    const [backtestResults, setBacktestResults] = useState<any>(null);
    const [isBacktestRunning, setIsBacktestRunning] = useState<boolean>(false);

    // Default datasets
    const [datasets, setDatasets] = useState<Dataset[]>([
        {
            id: "1",
            title: "BTC/USDT Historical",
            description: "1-minute interval Binance historical data for Bitcoin/Tether.",
            stocks: "BTC/USDT",
            date: "Jan 2024 - Mar 2024",
            source: "bitcoin_final.csv",
            fileName: "bitcoin_final.csv"
        }
    ]);

    // Modal form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        instrument: "",
        timeframe: "",
        file: null as File | null
    });

    useEffect(() => {
        // Subscribe to backtest market data
        subscribe("backtest_price_");
        subscribe("backtest_bid_");
        subscribe("backtest_ask_");
    }, [subscribe]);

    const handleAddDataset = (e: React.FormEvent) => {
        e.preventDefault();
        const newDataset: Dataset = {
            id: Date.now().toString(),
            title: formData.title,
            description: formData.description,
            stocks: formData.instrument,
            date: formData.timeframe,
            source: formData.file?.name || "Uploaded CSV",
            fileName: formData.file?.name || ""
        };
        setDatasets([...datasets, newDataset]);
        setIsModalOpen(false);
        setFormData({ title: "", description: "", instrument: "", timeframe: "", file: null });
    };

    const downloadBacktestResults = () => {
        if (!backtestResults) return;
        
        const csvRows = [
            ["Metric", "Value"],
            ...Object.entries(backtestResults).map(([key, value]) => [
                key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                `"${value}"`
            ])
        ];
        
        const csvContent = csvRows.map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `backtest_results_${Date.now()}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generateMockBacktestResults = (capital: number) => {
        const profit = capital * 0.1542;
        return {
            totalReturn: "15.42%",
            totalPnL: `$${profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            maxDrawdown: "4.21%",
            sharpeRatio: "1.85",
            winRate: "64.5%",
            profitFactor: "1.62",
            totalTrades: "42",
            winningTrades: "27",
            losingTrades: "15",
            avgWin: `$${(profit * 1.2 / 27).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            avgLoss: `$${(profit * 0.4 / 15).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            maxProfit: `$${(profit * 0.35).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            maxLoss: `$${(profit * 0.22).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            totalFees: `$${(capital * 0.001).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            finalEquity: `$${(capital + profit - (capital * 0.001)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        };
    };

    const startBacktest = () => {
        if (!selectedDatasetId) {
            alert("Please select a dataset first");
            return;
        }
        const dataset = datasets.find(d => d.id === selectedDatasetId);
        console.log(`Starting backtest with strategy: ${selectedStrategy} on dataset: ${dataset?.title}`);

        sendMessage(JSON.stringify({
            mode: "_Backtest",
            strategy: selectedStrategy,
            dataset: dataset?.fileName,
            capital: initialCapital
        }));

        setIsBacktestRunning(true);
        setShowBacktestOverlay(true);
        setBacktestResults(null);

        setTimeout(() => {
            const mockResults = generateMockBacktestResults(initialCapital);
            setBacktestResults(mockResults);
            setIsBacktestRunning(false);
        }, 3000);
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Control Bar */}
            <div className="border-b border-white/10 p-4 flex items-center justify-between bg-[#111]">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Database size={18} className="text-[#FF6D1F]" />
                        <h2 className="text-white font-semibold">Simulate & Backtest</h2>
                    </div>

                    <div className="h-6 w-px bg-white/10"></div>

                    <div className="flex items-center gap-3">
                        <span className="text-white/40 text-xs uppercase tracking-wider font-medium">Strategy</span>
                        <select
                            value={selectedStrategy}
                            onChange={(e) => setSelectedStrategy(e.target.value)}
                            className="bg-[#1e1e1e] border border-white/10 text-white text-xs rounded px-3 py-1.5 focus:outline-none focus:border-[#FF6D1F]"
                        >
                            <option>Trend Follower</option>
                            <option>Mean Reversion</option>
                            <option>Scalping Algo</option>
                            <option>MACD Crossover</option>
                        </select>
                    </div>

                    <div className="h-6 w-px bg-white/10"></div>
                    <div className="flex items-center gap-3">
                        <span className="text-white/40 text-xs uppercase tracking-wider font-medium">Capital</span>
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            value={initialCapital}
                            onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 0)}
                            className="w-28 bg-[#1e1e1e] border border-white/10 text-white text-xs rounded px-3 py-1.5 focus:outline-none focus:border-[#FF6D1F]"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 mr-2">
                        <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
                        <span className="text-white/40 text-xs">{isConnected ? "Connected" : "Disconnected"}</span>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        <Plus size={16} /> Add Dataset
                    </button>

                    <button
                        onClick={startBacktest}
                        disabled={!selectedDatasetId}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                            selectedDatasetId
                                ? "bg-[#FF6D1F] hover:bg-[#e55d1a] text-white shadow-lg shadow-[#FF6D1F]/20"
                                : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                        }`}
                    >
                        <Play size={16} fill="currentColor" /> Start Backtest
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">Available Datasets</h1>
                            <p className="text-white/40 text-sm">Select a dataset to begin simulation</p>
                        </div>

                        {marketData && (
                            <div className="flex gap-6 bg-white/5 border border-white/10 p-4 rounded-xl">
                                <div className="text-center">
                                    <p className="text-white/30 text-[10px] uppercase font-bold mb-1">Price</p>
                                    <p className="text-white font-mono font-bold">{marketData.price?.toFixed(2) || "---"}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-green-500/30 text-[10px] uppercase font-bold mb-1">Bid</p>
                                    <p className="text-green-400 font-mono font-bold">{marketData.bid?.toFixed(2) || "---"}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-red-500/30 text-[10px] uppercase font-bold mb-1">Ask</p>
                                    <p className="text-red-400 font-mono font-bold">{marketData.ask?.toFixed(2) || "---"}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {datasets.map((dataset) => (
                            <SimulateCard
                                key={dataset.id}
                                title={dataset.title}
                                description={dataset.description}
                                stocks={dataset.stocks}
                                date={dataset.date}
                                source={dataset.source}
                                isSelected={selectedDatasetId === dataset.id}
                                onClick={() => setSelectedDatasetId(dataset.id)}
                            />
                        ))}

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-white/5 hover:border-[#FF6D1F]/50 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus size={24} className="text-white/20 group-hover:text-[#FF6D1F]" />
                            </div>
                            <span className="text-white/20 font-medium group-hover:text-white/50">Add New Dataset</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText size={20} className="text-[#FF6D1F]" />
                                New Dataset
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-white/30 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddDataset} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase mb-1.5 ml-1">Dataset Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. BTC-USDT 2024 Spring"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6D1F] transition-colors"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase mb-1.5 ml-1">Description</label>
                                <textarea
                                    required
                                    placeholder="Brief details about the data..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6D1F] transition-colors h-24 resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase mb-1.5 ml-1">Instrument</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="BTC/USDT"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6D1F] transition-colors"
                                        value={formData.instrument}
                                        onChange={e => setFormData({...formData, instrument: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase mb-1.5 ml-1">Timeframe</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Jan-Dec 2023"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6D1F] transition-colors"
                                        value={formData.timeframe}
                                        onChange={e => setFormData({...formData, timeframe: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-bold text-white/40 uppercase mb-1.5 ml-1">Upload CSV</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={e => setFormData({...formData, file: e.target.files ? e.target.files[0] : null})}
                                    />
                                    <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 group-hover:border-[#FF6D1F]/50 group-hover:bg-[#FF6D1F]/5 transition-all">
                                        <Upload size={24} className="text-white/20 group-hover:text-[#FF6D1F]" />
                                        <span className="text-sm text-white/40 group-hover:text-white/60">
                                            {formData.file ? formData.file.name : "Choose CSV file"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#FF6D1F] hover:bg-[#e55d1a] text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-[#FF6D1F]/20 transition-all active:scale-[0.98]"
                            >
                                Add Dataset
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Backtest Overlay */}
            {showBacktestOverlay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-[70%] max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity size={20} className="text-[#FF6D1F]" />
                                {isBacktestRunning ? "Running Backtest" : "Backtest Results"}
                            </h3>
                            <button
                                onClick={() => { setShowBacktestOverlay(false); setBacktestResults(null); }}
                                className="text-white/30 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {isBacktestRunning ? (
                            <div className="p-12 space-y-6">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-[#FF6D1F]/10 flex items-center justify-center mb-6 animate-pulse">
                                        <Activity size={32} className="text-[#FF6D1F]" />
                                    </div>
                                    <h4 className="text-white text-xl font-bold mb-2">Backtest is in progress...</h4>
                                    <p className="text-white/40 text-sm max-w-sm">
                                        Please wait while the system processes the historical data using the selected parameters.
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6 pt-6">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <p className="text-white/30 text-[10px] uppercase font-bold mb-1 tracking-wider">Strategy</p>
                                        <p className="text-white font-medium">{selectedStrategy}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <p className="text-white/30 text-[10px] uppercase font-bold mb-1 tracking-wider">Dataset</p>
                                        <p className="text-white font-medium">{datasets.find(d => d.id === selectedDatasetId)?.title || "Unknown"}</p>
                                    </div>
                                </div>
                            </div>
                        ) : backtestResults && (
                            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                                {/* Revenue Chart Placeholder */}
                                <div className="w-full h-48 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-2 text-white/20">
                                        <BarChart3 size={32} />
                                        <span className="text-sm font-medium">Revenue Chart (Mock)</span>
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {[
                                        { label: "Total Return", value: backtestResults.totalReturn, color: "text-green-400", icon: TrendingUp },
                                        { label: "Total P&L", value: backtestResults.totalPnL, color: "text-green-400" },
                                        { label: "Max Drawdown", value: backtestResults.maxDrawdown, color: "text-red-400", icon: TrendingDown },
                                        { label: "Sharpe Ratio", value: backtestResults.sharpeRatio },
                                        { label: "Win Rate", value: backtestResults.winRate },
                                        { label: "Profit Factor", value: backtestResults.profitFactor },
                                        { label: "Total Trades", value: backtestResults.totalTrades },
                                        { label: "Winning Trades", value: backtestResults.winningTrades, color: "text-green-400" },
                                        { label: "Losing Trades", value: backtestResults.losingTrades, color: "text-red-400" },
                                        { label: "Avg Win", value: backtestResults.avgWin },
                                        { label: "Avg Loss", value: backtestResults.avgLoss },
                                        { label: "Max Profit", value: backtestResults.maxProfit },
                                        { label: "Max Loss", value: backtestResults.maxLoss },
                                        { label: "Total Fees", value: backtestResults.totalFees },
                                        { label: "Final Equity", value: backtestResults.finalEquity, color: "text-[#FF6D1F]" }
                                    ].map((m, idx) => (
                                        <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-2 mb-2">
                                                {m.icon && <m.icon size={12} className="text-[#FF6D1F]/60" />}
                                                <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider">{m.label}</p>
                                            </div>
                                            <p className={`font-mono font-bold ${m.color || "text-white"}`}>{m.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="p-6 border-t border-white/5 flex justify-end">
                            {backtestResults && (
                                <button
                                    onClick={downloadBacktestResults}
                                    className="bg-[#FF6D1F] hover:bg-[#e55d1a] text-white px-8 py-2.5 rounded-xl text-sm font-semibold transition-all mr-3 flex items-center gap-2"
                                >
                                    <Download size={16} /> Download Results
                                </button>
                            )}
                            <button
                                onClick={() => { setShowBacktestOverlay(false); setBacktestResults(null); }}
                                className="bg-white/5 hover:bg-white/10 text-white px-8 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-white/10"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Simulate;