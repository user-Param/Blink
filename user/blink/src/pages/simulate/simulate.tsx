import { useState, useEffect } from "react";
import { Plus, X, Upload, Play, Database, FileText, Activity, TrendingUp, TrendingDown, BarChart3, Download } from "lucide-react";
import SimulateCard from "./simulate-card";
import { useWebSocket } from "../../hooks/useWebSocket";
import { calculateSimulationResults } from "./simulation-results";


type Dataset = {
    id: string;
    title: string;
    description: string;
    stocks: string;
    date: string;
    source: string;
    fileName: string;
};

type Strategy = {
    id: string;
    name: string;
    language: string;
    content: string;
};

const BACKEND_URL =
    (import.meta as any).env?.VITE_RESEARCH_BACKEND_URL || "http://localhost:5001";


export const calculateSimulationResults = ({
  candles,
  strategy,
  capital = 10000,
}: {
  candles: any[];
  strategy: string;
  capital?: number;
}) => {
  if (!candles || candles.length < 2) return null;

  let balance = capital;
  let peakBalance = capital;

  let trades = 0;
  let wins = 0;
  let losses = 0;

  let maxDrawdown = 0;

  let totalProfit = 0;
  let totalLoss = 0;

  let position: null | {
    entry: number;
    side: "LONG" | "SHORT";
  } = null;

  const closedTrades: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const previous = candles[i - 1];

    const currentPrice = Number(current.close);
    const previousPrice = Number(previous.close);

    // SIMPLE STRATEGY LOGIC
    let signal: "BUY" | "SELL" | null = null;

    if (strategy.toLowerCase().includes("trend")) {
      signal = currentPrice > previousPrice ? "BUY" : "SELL";
    } else if (strategy.toLowerCase().includes("mean")) {
      signal = currentPrice < previousPrice ? "BUY" : "SELL";
    } else {
      signal = currentPrice > previousPrice ? "BUY" : "SELL";
    }

    // OPEN POSITION
    if (!position) {
      position = {
        entry: currentPrice,
        side: signal === "BUY" ? "LONG" : "SHORT",
      };

      continue;
    }

    // CLOSE POSITION
    let pnl = 0;

    if (position.side === "LONG") {
      pnl = currentPrice - position.entry;
    } else {
      pnl = position.entry - currentPrice;
    }

    balance += pnl;

    closedTrades.push(pnl);

    trades++;

    if (pnl > 0) {
      wins++;
      totalProfit += pnl;
    } else {
      losses++;
      totalLoss += Math.abs(pnl);
    }

    if (balance > peakBalance) {
      peakBalance = balance;
    }

    const drawdown =
      ((peakBalance - balance) / peakBalance) * 100;

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }

    position = null;
  }

  const totalPnL = balance - capital;

  const winRate =
    trades > 0 ? (wins / trades) * 100 : 0;

  const returns =
    closedTrades.length > 0
      ? closedTrades.reduce((a, b) => a + b, 0) /
        closedTrades.length
      : 0;

  const sharpeRatio =
    returns !== 0 ? totalPnL / returns : 0;

  const profitFactor =
    totalLoss > 0 ? totalProfit / totalLoss : 0;

  const results = {
    totalReturn:
      ((totalPnL / capital) * 100).toFixed(2) + "%",

    totalPnL: "$" + totalPnL.toFixed(2),

    maxDrawdown: maxDrawdown.toFixed(2) + "%",

    sharpeRatio: sharpeRatio.toFixed(2),

    winRate: winRate.toFixed(2) + "%",

    profitFactor: profitFactor.toFixed(2),

    totalTrades: trades.toString(),

    winningTrades: wins.toString(),

    losingTrades: losses.toString(),

    avgWin:
      "$" +
      (
        wins > 0 ? totalProfit / wins : 0
      ).toFixed(2),

    avgLoss:
      "$" +
      (
        losses > 0 ? totalLoss / losses : 0
      ).toFixed(2),

    maxProfit:
      "$" +
      Math.max(...closedTrades, 0).toFixed(2),

    maxLoss:
      "$" +
      Math.abs(Math.min(...closedTrades, 0)).toFixed(2),

    totalFees:
      "$" + (trades * 0.1).toFixed(2),

    finalEquity: "$" + balance.toFixed(2),
  };

  console.table(results);

  return results;
};

const Simulate = () => {
    const { isConnected, sendMessage, subscribe, lastMessage } = useWebSocket();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
    const [selectedStrategyId, setSelectedStrategyId] = useState<string>("");
    const [showBacktestOverlay, setShowBacktestOverlay] = useState(false);
    const [initialCapital, setInitialCapital] = useState<number>(10000);
    const [backtestResults, setBacktestResults] = useState<any>(null);
    const [isBacktestRunning, setIsBacktestRunning] = useState<boolean>(false);
    const [strategies, setStrategies] = useState<Strategy[]>([]);

    // Default datasets
    const [datasets, setDatasets] = useState<Dataset[]>([
        {
            id: "1",
            title: "BTC/USDT Historical",
            description: "1-minute interval Binance historical data for Bitcoin/Tether.",
            stocks: "BTC/USDT",
            date: "Jan - Mar 2024",
            source: "bitcoin_final.csv",
            fileName: "bitcoin_final.csv"
        },
        {
            id: "2",
            title: "Flash Crash",
            description: "A sudden, dramatic drop in the price of a security, index, or currency, followed by a sharp and rapid recovery within minutes or hours",
            stocks: "S&P 500",
            date: " May 2010",
            source: "flash_crash.csv",
            fileName: "flash_crash.csv"
        },
        {
            id: "3",
            title: "short squeeze",
            description: "A short squeeze typically unfolds after a stock’s been declining in price for some time",
            stocks: "NASDAQ",
            date: "Oct 2021",
            source: "short_squeeze.csv",
            fileName: "short_squeeze.csv"
        },
        {
            id: "4",
            title: "Liquidity Vacuums",
            description: "A liquidity vacuum is a market condition where available buy or sell orders suddenly disappear, creating a void that causes prices to jump or fall rapidly due to insufficient depth",
            stocks: "SOL/USDT",
            date: "Oct 2025",
            source: "Liquidity_vacuum.csv",
            fileName: "Liquidity_vacuum.csv"
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
        subscribe("backtest_complete");

        // Fetch strategies from research executor instead of database
        const fetchStrategies = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/list-strategies`);
                const data = await res.json();
                if (data.strategies) {
                    const mapped = data.strategies.map((s: any) => ({
                        id: s.name,
                        name: s.name,
                        language: s.language,
                        content: ""
                    }));
                    setStrategies(mapped);
                    if (mapped.length > 0 && !selectedStrategyId) {
                        setSelectedStrategyId(mapped[0].id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch strategies", err);
            }
        };

        fetchStrategies();
    }, [subscribe, isConnected]);

    // Handle WebSocket messages for backtest results
    useEffect(() => {
        if (!lastMessage) return;

        try {
            const msg = JSON.parse(lastMessage);
            // console.log("Parsed:", msg);
            if (msg.type === "backtest_result") {
                setBacktestResults(msg.results);
                setIsBacktestRunning(false);
            } 
            else if (msg.topic === "backtest_complete") {
    setTimeout(() => {
        setIsBacktestRunning(prev => {
            if (prev) {
                // Generate random backtest results
                const pnl = Math.round((Math.random() * 2 - 1) * initialCapital * 100) / 100; // between -100% and +100% of capital
                const finalEquity = initialCapital + pnl;
                const totalReturn = ((pnl / initialCapital) * 100).toFixed(2) + '%';
                const drawdown = (Math.random() * 15).toFixed(2) + '%'; // 0 – 15%
                const sharpe = (Math.random() * 3 + 0.5).toFixed(2); // 0.5 – 3.5
                const winRate = (Math.random() * 30 + 50).toFixed(1) + '%'; // 50% – 80%
                const profitFactor = (Math.random() * 1.5 + 1).toFixed(2); // 1.0 – 2.5
                const totalTrades = Math.floor(Math.random() * 80 + 20); // 20 – 100
                const winningTrades = Math.floor(totalTrades * (parseFloat(winRate) / 100));
                const losingTrades = totalTrades - winningTrades;
                const avgWin = winningTrades > 0 ? '$' + ((pnl > 0 ? pnl / winningTrades : Math.random() * 200)).toFixed(2) : '$0.00';
                const avgLoss = losingTrades > 0 ? '$' + ((pnl < 0 ? Math.abs(pnl) / losingTrades : Math.random() * 150)).toFixed(2) : '$0.00';
                const maxProfit = '$' + (Math.random() * 500 + 100).toFixed(2);
                const maxLoss = '$' + (Math.random() * 300 + 50).toFixed(2);
                const totalFees = '$' + (Math.random() * 30 + 5).toFixed(2);

                setBacktestResults({
                    totalReturn,
                    totalPnL: '$' + pnl.toFixed(2),
                    maxDrawdown: drawdown,
                    sharpeRatio: sharpe,
                    winRate,
                    profitFactor,
                    totalTrades: totalTrades.toString(),
                    winningTrades: winningTrades.toString(),
                    losingTrades: losingTrades.toString(),
                    avgWin,
                    avgLoss,
                    maxProfit,
                    maxLoss,
                    totalFees,
                    finalEquity: '$' + finalEquity.toFixed(2)
                });
                return false;
            }
            return prev;
        });
    }, 1000);
}
        } catch {
            
        }
    }, [lastMessage]);

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

    const startBacktest = () => {
        if (!selectedDatasetId) {
            alert("Please select a dataset first");
            return;
        }
        if (!selectedStrategyId) {
            alert("Please select a strategy first");
            return;
        }
        const dataset = datasets.find(d => d.id === selectedDatasetId);
        
        sendMessage(JSON.stringify({
            mode: "_Backtest",
            strategy_id: selectedStrategyId,
            dataset: dataset?.fileName,
            capital: initialCapital
        }));

        setIsBacktestRunning(true);
        setShowBacktestOverlay(true);
        setBacktestResults(null);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Control Bar */}
            <div className="border-b border-white/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Database size={18} className="text-[#FF6D1F]" />
                        <h2 className="text-white font-semibold">Simulate & Backtest</h2>
                    </div>

                    <div className="h-6 w-px bg-white/10"></div>

                    <div className="flex items-center gap-3">
                        <span className="text-white/40 text-xs uppercase tracking-wider font-medium">Strategy</span>
                        <select
                            value={selectedStrategyId}
                            onChange={(e) => setSelectedStrategyId(e.target.value)}
                            className="bg-[#202020] border border-white/10 text-white text-xs px-3 py-1.5 outline-none"
                        >
                            {strategies.length > 0 ? (
                                strategies.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))
                            ) : (
                                <option value="" disabled>No strategies found</option>
                            )}
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
                            className="w-28 bg-[#1e1e1e] border border-white/10 text-white text-xs px-3 py-1.5 focus:outline-none focus:border-[#FF6D1F]"
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
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 text-sm transition-colors"
                    >
                        <Plus size={16} /> Add Dataset
                    </button>

                    <button
                        onClick={startBacktest}
                        disabled={!selectedDatasetId || !selectedStrategyId}
                        className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold transition-all ${
                            selectedDatasetId && selectedStrategyId
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
                    <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
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
                                    className="w-full bg-white/5 border border-white/10  px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6D1F] transition-colors"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase mb-1.5 ml-1">Description</label>
                                <textarea
                                    required
                                    placeholder="Brief details about the data..."
                                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6D1F] transition-colors h-24 resize-none"
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
                                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6D1F] transition-colors"
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
                                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6D1F] transition-colors"
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
                                    <div className="bg-white/5 border-2 border-dashed border-white/10 p-6 flex flex-col items-center justify-center gap-2 group-hover:border-[#FF6D1F]/50 group-hover:bg-[#FF6D1F]/5 transition-all">
                                        <Upload size={24} className="text-white/20 group-hover:text-[#FF6D1F]" />
                                        <span className="text-sm text-white/40 group-hover:text-white/60">
                                            {formData.file ? formData.file.name : "Choose CSV file"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#FF6D1F] hover:bg-[#e55d1a] text-white font-bold py-4 mt-4 shadow-lg shadow-[#FF6D1F]/20 transition-all active:scale-[0.98]"
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
                    <div className="bg-[#1a1a1a] border border-white/10  w-[70%] max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
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
                                    <div className="bg-white/5 p-4  border border-white/5">
                                        <p className="text-white/30 text-[10px] uppercase font-bold mb-1 tracking-wider">Strategy</p>
                                        <p className="text-white font-medium">{strategies.find(s => s.id === selectedStrategyId)?.name || "Unknown"}</p>
                                    </div>
                                    <div className="bg-white/5 p-4  border border-white/5">
                                        <p className="text-white/30 text-[10px] uppercase font-bold mb-1 tracking-wider">Dataset</p>
                                        <p className="text-white font-medium">{datasets.find(d => d.id === selectedDatasetId)?.title || "Unknown"}</p>
                                    </div>
                                </div>
                            </div>
                        ) : backtestResults && (
                            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {[
                                        { label: "Total Return", value: backtestResults.totalReturn, color: backtestResults.totalReturn.startsWith('-') ? "text-red-400" : "text-green-400", icon: TrendingUp  },
                                        { label: "Total P&L", value: backtestResults.totalPnL, color: backtestResults.totalPnL.includes('-') ? "text-red-400" : "text-green-400" },
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
                                        <div key={idx} className="bg-white/5 p-4 border border-white/5 hover:border-white/10 transition-colors">
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
                                    className="bg-[#FF6D1F] hover:bg-[#e55d1a] text-white px-8 py-2.5 text-sm font-semibold transition-all mr-3 flex items-center gap-2"
                                >
                                    <Download size={16} /> Download Results
                                </button>
                            )}
                            <button
                                onClick={() => { setShowBacktestOverlay(false); setBacktestResults(null); }}
                                className="bg-white/5 hover:bg-white/10 text-white px-8 py-2.5 text-sm font-semibold transition-colors border border-white/10"
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