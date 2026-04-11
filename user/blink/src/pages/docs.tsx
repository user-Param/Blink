import { useState } from "react";
import { 
    Book, 
    Code, 
    Terminal, 
    Cpu, 
    Layers, 
    Shield, 
    Zap, 
    Activity, 
    ChevronRight,
    ExternalLink,
    Copy,
    Check,
    AlertCircle,
    Info,
    Database,
    Play
} from "lucide-react";

const Docs = () => {
    const [activeSection, setActiveSection] = useState("introduction");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const sections = [
        { id: "introduction", title: "Introduction", icon: Book },
        { id: "getting-started", title: "Getting Started", icon: Play },
        { id: "core-engine", title: "C++ Core Engine", icon: Cpu },
        { id: "api-reference", title: "API Reference", icon: Terminal },
        { id: "backtesting", title: "Backtesting Suite", icon: Database },
        { id: "security", title: "Security & Risk", icon: Shield },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case "introduction":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h1 className="text-4xl font-bold text-white tracking-tight">Introduction</h1>
                            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-green-500 text-xs font-bold uppercase tracking-wider">Latest Version: V2.0.4</span>
                            </div>
                        </div>

                        <p className="text-white/60 text-lg leading-relaxed max-w-3xl">
                            BLINK is a professional-grade algorithmic trading platform featuring a high-performance 
                            <span className="text-white/80"> C++ core</span> built with Boost.Asio and a modern 
                            <span className="text-white/80"> React frontend</span>. It is designed for low-latency execution, 
                            comprehensive research, and robust strategy management.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-[#FF6D1F]/50 transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-[#FF6D1F]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Zap className="text-[#FF6D1F]" size={24} />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">Fast Execution</h3>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    C++ Boost.Asio event loop with multi-threaded strands and lock-free queues ensures sub-millisecond tick processing 
                                    and deterministic order execution.
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-[#FF6D1F]/50 transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Activity className="text-blue-500" size={24} />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">Backtesting</h3>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    Tick-by-tick historical replay from PostgreSQL via Dadapter allows for realistic strategy simulation 
                                    with isolated backtest data streams.
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#FF6D1F]/5 border border-[#FF6D1F]/10 p-6 rounded-2xl flex gap-4 items-start">
                            <div className="mt-1">
                                <Info className="text-[#FF6D1F]" size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Recent Platform Updates</h4>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    V2.0.4 introduces <span className="text-white/80">Backtest Topic Isolation</span>, a new 
                                    <span className="text-white/80"> WebSocket Stream Manager</span> for improved connection stability, 
                                    and dedicated historical data topics to prevent simulation leakage.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case "getting-started":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-4xl font-bold text-white tracking-tight">Strategy Development</h1>
                        
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Code size={24} className="text-[#FF6D1F]" />
                                C++ Strategies
                            </h2>
                            <p className="text-white/60 text-sm leading-relaxed">
                                C++ strategies provide the highest performance and are suitable for live trading. All strategies must inherit from the <code className="text-[#FF6D1F]">Algo</code> base class.
                            </p>
                            <div className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-sm text-white/80 overflow-x-auto">
                                <code>{`#include "algo.h"

class SimpleScalper : public Algo {
public:
    void onTick(const MarketData& data) override {
        // data contains: symbol, price, bid, ask, timestamp
        if (data.price < threshold_) {
            buy(data.symbol, data.price, 1.0); // side, price, quantity
        } else if (data.price > exit_) {
            sell(data.symbol, data.price, 1.0);
        }
    }
private:
    double threshold_ = 50000.0;
    double exit_ = 50100.0;
};`}</code>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Activity size={24} className="text-blue-400" />
                                Python Research
                            </h2>
                            <p className="text-white/60 text-sm leading-relaxed">
                                Python strategies are ideal for rapid prototyping and research. They execute via the Research Executor and process incoming <code className="text-[#FF6D1F]">MarketData</code> objects.
                            </p>
                            <div className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-sm text-white/80 overflow-x-auto">
                                <code>{`class MomentumStrategy:
    def __init__(self):
        self.prices = []

    def on_tick(self, data):
        self.prices.append(data.price)
        if len(self.prices) > 20:
            if data.price > sum(self.prices[-20:])/20:
                return "BUY"
            else:
                return "SELL"
        return None`}</code>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Book size={24} className="text-green-400" />
                                Jupyter Notebooks
                            </h2>
                            <p className="text-white/60 text-sm leading-relaxed">
                                Use <code className="text-[#FF6D1F]">.ipynb</code> files for interactive research. You can mix markdown documentation with live code cells to analyze historical data and visualize strategy performance.
                            </p>
                        </section>
                    </div>
                );

            case "core-engine":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-4xl font-bold text-white tracking-tight">C++ Core Engine</h1>
                        
                        <p className="text-white/60 text-lg leading-relaxed">
                            The BLINK Engine manages the strategy lifecycle, risk validation, and market data distribution.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <h4 className="text-white font-bold mb-3">Event Loop</h4>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    The <code className="text-[#FF6D1F]">Engine</code> connects to the Datafeed (9000), parses incoming JSON, and dispatches ticks to the <code className="text-[#FF6D1F]">AlgoManager</code>.
                                </p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <h4 className="text-white font-bold mb-3">Order Flow</h4>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    Orders flow from <code className="text-[#FF6D1F]">Algo</code> → <code className="text-[#FF6D1F]">AlgoManager</code> → <code className="text-[#FF6D1F]">RiskManager</code> → WebSocket Executor (9001).
                                </p>
                            </div>
                        </div>

                        <div className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-sm text-[#FF6D1F]">
                            <code>{`// Engine Initialization
int main() {
    auto manager = std::make_shared<AlgoManager>();
    manager->addAlgo(std::make_shared<SimpleScalper>());
    
    Engine engine(manager);
    engine.start("127.0.0.1", "9000");
    return 0;
}`}</code>
                        </div>

                        <div className="bg-yellow-500/5 border border-yellow-500/10 p-6 rounded-2xl flex gap-4 items-start">
                            <div className="mt-1">
                                <AlertCircle className="text-yellow-500" size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Performance Mandate</h4>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    To maintain microsecond latencies, <span className="text-white/80">avoid dynamic allocations</span> within the <code className="text-[#FF6D1F]">onTick</code> path.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case "api-reference":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-4xl font-bold text-white tracking-tight">API Reference</h1>
                        
                        <div className="space-y-6">
                            <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <h3 className="text-xl font-bold text-white mb-4">Datafeed (Port 9000)</h3>
                                <p className="text-white/40 text-sm mb-4">Subscription Protocol:</p>
                                <pre className="bg-black/30 p-4 rounded-xl text-xs font-mono text-blue-400">
                                    {`{ "subscribe": ["price_", "bid_", "ask_"] }`}
                                </pre>
                                <p className="text-white/40 text-sm mt-4 mb-4">Market Data Format:</p>
                                <pre className="bg-black/30 p-4 rounded-xl text-xs font-mono text-green-400">
                                    {`{ "symbol": "BTCUSDT", "price": 65000.0, "timestamp": 1712834567890 }`}
                                </pre>
                            </section>

                            <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <h3 className="text-xl font-bold text-white mb-4">Executor (Port 9001)</h3>
                                <p className="text-white/40 text-sm mb-4">Order Submission:</p>
                                <pre className="bg-black/30 p-4 rounded-xl text-xs font-mono text-[#FF6D1F]">
                                    {`{
  "type": "order",
  "symbol": "BTCUSDT",
  "side": "BUY",
  "price": 65000.0,
  "quantity": 0.1,
  "strategy_id": "strategy_0"
}`}
                                </pre>
                            </section>
                        </div>
                    </div>
                );

            case "backtesting":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-4xl font-bold text-white tracking-tight">Backtesting Suite</h1>
                        
                        <p className="text-white/60 text-lg leading-relaxed">
                            BLINK uses the <span className="text-white/80">Dadapter</span> service to stream historical ticks from PostgreSQL.
                        </p>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                            <h4 className="text-white font-bold mb-3">Topic Isolation</h4>
                            <p className="text-white/40 text-sm leading-relaxed">
                                Historical ticks are broadcast to <code className="text-blue-400">backtest_price_</code>, 
                                <code className="text-blue-400">backtest_bid_</code>, and <code className="text-blue-400">backtest_ask_</code> topics to 
                                isolate simulation data from live market data.
                            </p>
                        </div>

                        <div className="bg-black/50 p-6 rounded-2xl border border-white/5">
                            <h4 className="text-white font-bold mb-4">Backtest Workflow</h4>
                            <ol className="space-y-3 text-white/40 text-sm">
                                <li>1. Send <code className="text-[#FF6D1F]">_Backtest</code> command to Datafeed Server.</li>
                                <li>2. Dadapter begins streaming rows from <code className="text-[#FF6D1F]">market_data</code> table.</li>
                                <li>3. UI subscriptions to <code className="text-blue-400">backtest_*</code> topics receive historical ticks.</li>
                                <li>4. Analyze results in the real-time simulation overlay.</li>
                            </ol>
                        </div>
                    </div>
                );

            case "security":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-4xl font-bold text-white tracking-tight">Security & Risk</h1>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <h4 className="text-white font-bold mb-3">API Protection</h4>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    Keys are loaded from <code className="text-[#FF6D1F]">.env</code> via the <code className="text-[#FF6D1F]">Config</code> singleton.
                                </p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                                <h4 className="text-white font-bold mb-3">Risk Manager</h4>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    Pre-trade validation: Max order size, daily loss limit, and symbol whitelisting.
                                </p>
                            </div>
                        </div>

                        <div className="bg-green-500/5 border border-green-500/10 p-6 rounded-2xl flex gap-4 items-start">
                            <div className="mt-1">
                                <Shield className="text-green-500" size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Order Signing</h4>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    All exchange requests are signed using <span className="text-white/80">HMAC-SHA256</span> with OpenSSL.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Activity className="text-white/20 animate-pulse" size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Section Under Construction</h2>
                        <p className="text-white/40 max-w-xs">
                            This documentation section is currently being updated with the latest platform changes.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="h-full flex bg-[#0a0a0a]">
            {/* Sidebar */}
            <div className="w-72 border-r border-white/10 bg-[#111] flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 text-[#FF6D1F]">
                        <Book size={20} />
                        <h2 className="font-bold text-white tracking-tight">Documentation</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                                activeSection === section.id
                                    ? "bg-[#FF6D1F] text-white shadow-lg shadow-[#FF6D1F]/20"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <section.icon size={18} className={activeSection === section.id ? "text-white" : "group-hover:text-[#FF6D1F]"} />
                            {section.title}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-white/10">
                    <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 text-xs transition-all">
                        <span>External API Docs</span>
                        <ExternalLink size={14} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#111] to-[#0a0a0a]">
                <div className="max-w-4xl mx-auto px-12 py-16">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Docs;