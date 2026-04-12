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
  Play,
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-6xl text-white">Introduction</h1>
            <div className="space-y-5">
                <p className="text-white/60 text-lg leading-relaxed max-w-4xl">
                    BLINK is an powerful algorithmic trading engine built for easy strategy research, 
                    backtesting, and live trading. We integrate with common data providers and brokerages 
                    so you can quickly deploy algorithmic trading strategies.
                </p>
                <p className="text-white/60 text-lg leading-relaxed max-w-4xl">
                    The core of BLINK is written in C++20 for maximum performance, paired with a React based web client that provides an interactive environment for trading, writing algorithms and visualizing research thesis. You can prototype ideas rapidly in Python, then optimize them in C++ using integrated compilers all within the same workspace. Strategies are saved internally, ready to be backtested against custom market scenarios in a simulated environment or deployed directly to live markets in the blink of an eye.
                </p>
            </div>

            {/* System Overview */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="w-1 h-7 bg-[#FF6D1F] rounded-full"></span>
                    <h2 className="text-3xl font-bold text-white tracking-tight">System Overview</h2>
                </div>
                {/* System Overview */}
<div className="space-y-6">    
    <p className="text-white/60 text-base leading-relaxed max-w-3xl">
        BLINK is built as a collection of independent, single purpose services that communicate 
        over fast WebSocket connections. This modular design keeps the system resilient and easy 
        to extend you can modify or replace one component without disrupting the others.
    </p>
    
    <p className="text-white/60 text-base leading-relaxed max-w-3xl">
        At the center sits the <span className="text-white font-medium">Datafeed Server</span>, 
        which ingests real time market data from exchanges, databrokers and historical ticks from the database. 
        It broadcasts everything over a publish subscribe system, so clients receive only the topics 
        they care about.
    </p>
    
    <p className="text-white/60 text-base leading-relaxed max-w-3xl">
        The <span className="text-white font-medium">Trading Engine</span> subscribes to these topics 
        and runs your strategies. Every incoming tick is passed to the active algorithms, which can 
        generate buy or sell signals. Those signals are validated by the 
        <span className="text-white font-medium"> Risk Manager</span> and then forwarded to the 
        <span className="text-white font-medium"> Order Executor</span>. The Executor 
        handles all communication with exchanges placing orders, tracking fills, and reporting 
        results back to the client.
    </p>
    
    <p className="text-white/60 text-base leading-relaxed max-w-3xl">
        For backtesting, the <span className="text-white font-medium">Dadapter</span> service reads 
        historical price data from PostgreSQL and streams it to the Datafeed Server exactly as if 
        it were live. Your strategies process this data identically to real time ticks, giving you 
        a faithful simulation of how they would have performed in the past.
    </p>
    
</div>


                <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/10 rounded-3xl p-6">
        <div className="relative w-full flex justify-center">
            <img 
                src="src/assets/systemoverview.png" 
                alt="BLINK System Architecture Diagram"
                className="w-full max-w-4xl h-auto rounded-xl border border-white/5 shadow-2xl"
            />
        </div>
        <p className="text-white/30 text-xs text-center mt-4 italic">
            High‑level overview of BLINK's modular, service‑oriented systems architecture.
        </p>
    </div>













                {/* The most important plugins */}
                <p className="text-white/60 text-base leading-relaxed max-w-3xl">
                    The most important plugins are:
                </p>

                {/* Modular Diagram / Plugin Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {[
                        { title: "Result Processing", desc: "Handle all messages from the algorithmic trading engine. Decide what should be sent, and where.", icon: "📤" },
                        { title: "Datafeed Sourcing", desc: "Connect and download the data required. For backtesting, files from disk; for live, a real‑time stream.", icon: "📡" },
                        { title: "Transaction Processing", desc: "Process new order requests; either using fill models or an actual brokerage.", icon: "🔐" },
                        { title: "Realtime Event Management", desc: "Generate real‑time events like end‑of‑day. Trigger callbacks to event handlers.", icon: "⏱️" },
                        { title: "Algorithm State Setup", desc: "Configure the algorithm cash, portfolio and data requested. Initialize all state parameters.", icon: "⚙️" },
                    ].map((plugin, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#FF6D1F]/40 transition-all">
                            <div className="text-2xl mb-2">{plugin.icon}</div>
                            <h4 className="text-white font-bold text-sm mb-1">{plugin.title}</h4>
                            <p className="text-white/40 text-[11px] leading-relaxed">{plugin.desc}</p>
                        </div>
                    ))}
                </div>

                <p className="text-white/50 text-sm italic max-w-3xl">
                    These are all configurable from the <code className="text-[#FF6D1F] bg-[#FF6D1F]/10 px-1.5 py-0.5 rounded">.env</code> file.
                </p>
            </div>

            {/* Getting Started Button */}
            <div className="pt-4">
                <button
                    onClick={() => setActiveSection("getting-started")}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#FF6D1F] hover:bg-[#e55d1a] text-white font-bold text-lg transition-all shadow-lg shadow-[#FF6D1F]/30 hover:shadow-xl hover:shadow-[#FF6D1F]/40 overflow-hidden"
                >
                    <span className="relative z-10">Start Building Strategies</span>
                    <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
                <p className="text-white/30 text-xs mt-3">
                    Jump into the Getting Started guide and write your first strategy in under 5 minutes.
                </p>
            </div>
        </div>
    );
      case "getting-started":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Strategy Development
            </h1>

            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-white/60 text-lg leading-relaxed">
                Developing a strategy on the BLINK platform is designed to be an
                intuitive and streamlined process, regardless of your preferred
                programming language. We support a multi-language approach:{" "}
                <span className="text-white font-bold">C++</span> for
                high-performance live trading and{" "}
                <span className="text-white font-bold">Python</span> for rapid
                prototyping and research analysis. This section walks you
                through how to write trading logic that integrates perfectly
                with our execution core.
              </p>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Code size={24} className="text-[#FF6D1F]" />
                  Developing in C++
                </h2>
                <p className="text-white/60 text-lg leading-relaxed">
                  C++ strategies are the gold standard for performance within
                  the BLINK ecosystem. Every C++ strategy must inherit from the{" "}
                  <code className="text-[#FF6D1F]">Algo</code> base class
                  defined in{" "}
                  <code className="text-white">engine/include/algo.h</code>.
                  This class provides a consistent and efficient interface for
                  receiving market updates and placing orders. The most
                  important method you will implement is{" "}
                  <code className="text-[#FF6D1F]">
                    onTick(const MarketData& data)
                  </code>
                  . This virtual method is called by the engine every time a new
                  price update arrives from the Datafeed Server.
                </p>
                <p className="text-white/60 text-lg leading-relaxed">
                  The <code className="text-white">MarketData</code> structure
                  provides everything you need to make a trading decision: the
                  current price, top-of-book bid and ask quotes, the symbol
                  name, and a precise millisecond timestamp. Inside your
                  strategy, you have access to protected{" "}
                  <code className="text-white">buy()</code> and{" "}
                  <code className="text-white">sell()</code> methods. It is
                  important to understand that these methods do not send orders
                  directly to the exchange; instead, they forward the request to
                  the <code className="text-[#FF6D1F]">AlgoManager</code>, which
                  then validates the request via the{" "}
                  <code className="text-[#FF6D1F]">RiskManager</code> before
                  finally transmitting it to the Order Executor. This layered
                  approach ensures that a logic error in your strategy cannot
                  result in an invalid or dangerous order being sent to the
                  market.
                </p>
                <div className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-xs text-white/80 overflow-x-auto leading-relaxed">
                  <code>{`#include "algo.h"
#include <iostream>

class PriceThresholdAlgo : public Algo {
public:
    // This method is called automatically for every market tick
    void onTick(const MarketData& data) override {
        // Simple logic: Buy if price drops below 50k, Sell if it spikes above 51k
        if (data.price < 50000.0) {
            std::cout << "Threshold reached! Buying " << data.symbol << std::endl;
            buy(data.symbol, data.price, 1); // side, price, quantity
        } else if (data.price > 51000.0) {
            std::cout << "Exit target reached! Selling " << data.symbol << std::endl;
            sell(data.symbol, data.price, 1);
        }
    }
};`}</code>
                </div>
                <p className="text-white/60 text-lg leading-relaxed">
                  C++ strategies are compiled directly into the main engine
                  executable. When you are ready to deploy, use the{" "}
                  <span className="text-white font-bold">"Save"</span> button in
                  our integrated editor. This will trigger a validation process
                  that attempts to compile your code and checks for the required
                  interfaces. If successful, your strategy is persisted to the
                  PostgreSQL database, where it becomes available for selection
                  in the simulation and deployment dashboards.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Activity size={24} className="text-blue-400" />
                  Researching in Python
                </h2>
                <p className="text-white/60 text-lg leading-relaxed">
                  Python is the engine of research in BLINK. It is ideal for
                  rapid prototyping because it allows you to leverage the vast
                  Python data science ecosystem, including libraries like{" "}
                  <span className="text-white font-bold">pandas</span> for
                  time-series manipulation and{" "}
                  <span className="text-white font-bold">scikit-learn</span> for
                  applying machine learning models to market signals. In the
                  BLINK editor, you can create Python scripts that follow our
                  standard strategy template. These scripts define a class with
                  an <code className="text-[#FF6D1F]">on_tick</code> method that
                  receives market data objects and returns signals such as
                  "BUY", "SELL", or None.
                </p>
                <div className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-xs text-white/80 overflow-x-auto leading-relaxed">
                  <code>{`class MomentumStrategy:
    def __init__(self):
        self.prices = []

    def on_tick(self, data):
        # Accumulate prices to calculate a moving average
        self.prices.append(data.price)
        if len(self.prices) > 20:
            avg = sum(self.prices[-20:]) / 20
            if data.price > avg * 1.02:
                return "BUY"
            elif data.price < avg * 0.98:
                return "SELL"
        return None`}</code>
                </div>
                <p className="text-white/60 text-lg leading-relaxed">
                  Python strategies are executed by the{" "}
                  <span className="text-white font-bold">
                    Research Executor
                  </span>{" "}
                  backend. This service manages a pool of Python interpreters
                  and provides them with market data ticks in real-time or
                  historical replay mode. This allows you to verify your signals
                  against actual exchange data without having to write a single
                  line of C++.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Book size={24} className="text-green-400" />
                  Interactive Notebooks
                </h2>
                <p className="text-white/60 text-lg leading-relaxed">
                  For deep analysis and documentation of your research, BLINK
                  supports Jupyter Notebooks (
                  <code className="text-green-400">.ipynb</code>). These files
                  allow you to mix explanatory Markdown text with executable
                  Python code cells. This is perfect for visualizing historical
                  price data, performing statistical tests on strategy
                  performance, or generating equity curve charts. The platform
                  treats notebooks as first-class research artifacts, storing
                  them in the database so your insights are preserved and shared
                  across your workspace.
                </p>
              </section>
            </div>
          </div>
        );

      case "core-engine":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              C++ Core Engine
            </h1>

            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-white/60 text-lg leading-relaxed">
                The BLINK Trading Engine is the high-performance heart of the
                platform. It is responsible for the entire lifecycle of a trade,
                from market data ingestion to order acknowledgement. The engine
                is built using an asynchronous, event-driven architecture
                powered by{" "}
                <span className="text-white font-bold">Boost.Asio</span>,
                ensuring that every nanosecond is spent on trading logic rather
                than waiting for I/O.
              </p>

              <p className="text-white/60 text-lg leading-relaxed">
                The execution flow begins with the{" "}
                <code className="text-white">Engine</code> class. Upon startup,
                it establishes a persistent WebSocket connection to the Datafeed
                Server (typically on port 9000). It utilizes a specialized{" "}
                <code className="text-white">readLoop</code> that waits for
                incoming messages without blocking the main execution thread.
                These messages are typically JSON-encoded market data packets
                arriving from live exchanges or the Dadapter. Once a packet is
                received, it is instantly parsed into a{" "}
                <code className="text-white">MarketData</code> object using the
                highly efficient nlohmann/json library. This object is then
                passed directly to the{" "}
                <code className="text-[#FF6D1F]">AlgoManager</code> for
                processing.
              </p>

              <p className="text-white/60 text-lg leading-relaxed">
                The <code className="text-[#FF6D1F]">AlgoManager</code> acts as
                the central coordinator for all your strategies. It maintains a
                collection of active strategy instances (represented as{" "}
                <code className="text-white">Algo</code> objects). When a new
                market tick arrives, the manager iterates through this
                collection and dispatches the tick to each strategy's{" "}
                <code className="text-white">onTick</code> method. This design
                allows you to run multiple strategies concurrently on the same
                data stream, with each strategy maintaining its own isolated
                state and risk parameters. The manager also handles the dynamic
                activation and deactivation of algorithms, allowing you to
                toggle logic on and off in real-time through the frontend
                dashboard without having to restart the backend services.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Shield size={18} className="text-[#FF6D1F]" />
                    The Risk Gatekeeper
                  </h4>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Every order generated by a strategy is sent to the{" "}
                    <code className="text-[#FF6D1F]">
                      RiskManager::validateAndSend()
                    </code>{" "}
                    method. This is a mandatory checkpoint. The Risk Manager
                    performs pre-trade checks: verifying positive quantities,
                    enforcing maximum order size limits, checking daily realized
                    loss thresholds, and ensuring the instrument is on the
                    approved whitelist. If any check fails, the order is
                    rejected immediately before it ever touches the network.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Zap size={18} className="text-[#FF6D1F]" />
                    Ultra-Low Latency Flow
                  </h4>
                  <p className="text-white/40 text-sm leading-relaxed">
                    When a strategy decides to trade, the path is:{" "}
                    <span className="text-[#FF6D1F]">Algo</span> →{" "}
                    <span className="text-[#FF6D1F]">AlgoManager</span> →{" "}
                    <span className="text-[#FF6D1F]">RiskManager</span> →{" "}
                    <span className="text-[#FF6D1F]">Executor (9001)</span>. By
                    separating the Order Executor from the Engine, we ensure
                    that the Engine is never slowed down by exchange API
                    latencies or network signing overhead. The Engine fires the
                    order and immediately returns to processing the next market
                    tick.
                  </p>
                </div>
              </div>

              <div className="bg-black/50 p-6 rounded-2xl border border-white/5 space-y-4">
                <h4 className="text-white font-bold text-sm">
                  Engine Initialization Example (main.cpp)
                </h4>
                <pre className="font-mono text-[11px] text-[#FF6D1F] overflow-x-auto leading-relaxed">
                  <code>{`// 1. Initialize RiskManager (Connects to Executor on 9001)
auto riskMgr = std::make_shared<RiskManager>();

// 2. Initialize AlgoManager with Risk oversight
auto algoMgr = std::make_shared<AlgoManager>(riskMgr);

// 3. Register your optimized C++ strategies
algoMgr->addAlgo(std::make_unique<SimpleMovingAverageCrossover>());

// 4. Start the Engine and subscribe to data
Engine engine(algoMgr);
engine.setTopics({"ticker_"}); // Receive consolidated ticker updates
engine.start();`}</code>
                </pre>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/10 p-6 rounded-2xl flex gap-4 items-start">
                <div className="mt-1">
                  <AlertCircle className="text-yellow-500" size={20} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-white font-bold mb-1">
                    Critical Performance Mandate
                  </h4>
                  <p className="text-white/40 text-sm leading-relaxed">
                    To maintain microsecond latencies and prevent
                    non-deterministic behavior,{" "}
                    <span className="text-white/80">
                      avoid dynamic memory allocations
                    </span>{" "}
                    (using <code className="text-red-400">new</code>,{" "}
                    <code className="text-red-400">malloc</code>, or resizing
                    large STL containers) within the{" "}
                    <code className="text-[#FF6D1F]">onTick</code> path. Heap
                    allocations can trigger garbage collection or memory
                    management locks that introduce unpredictable latency
                    spikes, often referred to as "jitter." Always use
                    pre-allocated data structures or stack-based objects for
                    hot-path trading logic.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "api-reference":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              API Reference
            </h1>

            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-white/60 text-lg leading-relaxed">
                The BLINK platform provides comprehensive WebSocket and REST
                interfaces for service communication. These APIs allow you to
                interact with the market data streams, manage orders, and
                control the research environment programmatically. All messaging
                uses standard JSON, making it easy to integrate with external
                tools or custom dashboards.
              </p>

              <section className="bg-white/5 border border-white/10 p-8 rounded-2xl overflow-hidden space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">
                    Datafeed WebSocket
                  </h3>
                  <span className="text-xs font-mono text-[#FF6D1F] bg-[#FF6D1F]/10 px-3 py-1 rounded-full border border-[#FF6D1F]/20">
                    ws://localhost:9000
                  </span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">
                  The Datafeed WebSocket is the primary pipe for all market
                  information. It broadcasts ticks from both live exchanges and
                  the historical replay service. It uses a prefix-based
                  subscription model.
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/60 text-xs font-bold uppercase mb-2 tracking-widest">
                      Subscription Protocol
                    </p>
                    <p className="text-white/30 text-xs mb-3">
                      Send this JSON to begin receiving specific data types:
                    </p>
                    <pre className="bg-black/30 p-4 rounded-xl text-[11px] text-blue-400 border border-white/5 overflow-x-auto">
                      {`{ 
  "subscribe": ["price_", "bid_", "ask_", "ticker_"] 
}`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-bold uppercase mb-2 tracking-widest">
                      Tick Message Format
                    </p>
                    <p className="text-white/30 text-xs mb-3">
                      The server will broadcast objects in this structure for
                      every update:
                    </p>
                    <pre className="bg-black/30 p-4 rounded-xl text-[11px] text-green-400 border border-white/5 overflow-x-auto">
                      {`{ 
  "topic": "ticker_",
  "symbol": "BTCUSDT", 
  "price": 64500.50, 
  "bid": 64500.40, 
  "ask": 64500.60,
  "timestamp": 1712834567890 
}`}
                    </pre>
                  </div>
                  <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                    <p className="text-blue-400 text-xs font-bold mb-1 italic">
                      Mode Commands
                    </p>
                    <p className="text-white/30 text-[11px] leading-relaxed">
                      You can switch the entire data source by sending raw
                      strings: <code className="text-white">"_Live"</code>{" "}
                      activates the Binance feed, while{" "}
                      <code className="text-white">"_Backtest"</code> switches
                      to historical PostgreSQL data.
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">
                    Executor WebSocket
                  </h3>
                  <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                    ws://localhost:9001
                  </span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">
                  The Executor API handles secure communication with trading
                  venues. It requires HMAC-SHA256 signing for all requests,
                  which is managed internally by the Executor service.
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/60 text-xs font-bold uppercase mb-2 tracking-widest">
                      Order Submission
                    </p>
                    <pre className="bg-black/30 p-4 rounded-xl text-[11px] text-[#FF6D1F] border border-white/5 overflow-x-auto">
                      {`{
  "type": "order",
  "symbol": "BTCUSDT",
  "side": "BUY",
  "price": 64000.0,
  "quantity": 0.1,
  "strategy_id": "strategy_0",
  "order_type": "LIMIT"
}`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-bold uppercase mb-2 tracking-widest">
                      Order Result Callback
                    </p>
                    <pre className="bg-black/30 p-4 rounded-xl text-[11px] text-white/60 border border-white/5 overflow-x-auto">
                      {`{
  "type": "order_result",
  "status": "FILLED",
  "order_id": "BTCUSDT_BUY_1712834567",
  "exchange_order_id": "987654321",
  "message": "Executed successfully"
}`}
                    </pre>
                  </div>
                </div>
              </section>

              <section className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">
                    Research REST API
                  </h3>
                  <span className="text-xs font-mono text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                    http://localhost:5000
                  </span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">
                  Used exclusively by the integrated editor to execute strategy
                  code and return terminal output. This API is stateless and
                  supports both Python and C++ compilation.
                </p>
                <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-[#FF6D1F]">
                      POST /run
                    </span>
                    <span className="text-[9px] text-white/20 mt-1">
                      Accepts code string and language identifier.
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                    200 OK
                  </span>
                </div>
              </section>
            </div>
          </div>
        );

      case "backtesting":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Backtesting Suite
            </h1>

            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-white/60 text-lg leading-relaxed">
                The BLINK Backtesting Suite is what truly sets this platform
                apart. It allows you to replay market history with{" "}
                <span className="text-white font-bold">
                  tick-level accuracy
                </span>
                . Unlike many backtesters that use simplified one-minute bars or
                hourly candlesticks, BLINK uses the exact same data path as live
                trading. This ensures that the results you see in simulation are
                a faithful representation of how the strategy would have
                performed in real market conditions, capturing every spread
                change and volatility spike.
              </p>

              <p className="text-white/60 text-lg leading-relaxed">
                The system architecture for backtesting relies on two key
                components: the PostgreSQL{" "}
                <code className="text-white">market_data</code> table and the{" "}
                <code className="text-[#FF6D1F]">Dadapter</code> service. The{" "}
                <code className="text-white">market_data</code> table stores
                millions of historical ticks, each containing precise pricing
                and timestamp information. The{" "}
                <code className="text-[#FF6D1F]">Dadapter</code> service acts as
                a "virtual exchange." When backtest mode is activated, it
                queries the database and "streams" these rows sequentially to
                the Datafeed Server as if they were live ticks arriving from an
                exchange.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                  <div className="w-10 h-10 rounded-lg bg-[#FF6D1F]/10 flex items-center justify-center mb-4">
                    <Database size={20} className="text-[#FF6D1F]" />
                  </div>
                  <h4 className="text-white font-bold mb-2">
                    High-Fidelity Replay
                  </h4>
                  <p className="text-white/40 text-xs leading-relaxed">
                    The Dadapter queries ticks in chronological order,
                    simulating the natural flow of market time. Because it uses
                    the exact same JSON format as the live exchange feed, your
                    C++ and Python strategies can process historical ticks
                    identically to live ones. This "replay" approach is
                    essential for identifying edge cases and liquidity issues
                    that bar-based systems often smooth over.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                    <Layers size={20} className="text-blue-500" />
                  </div>
                  <h4 className="text-white font-bold mb-2">
                    Isolation via Topic Mapping
                  </h4>
                  <p className="text-white/40 text-xs leading-relaxed">
                    To prevent live strategies from accidentally trading on
                    historical data, BLINK uses specialized topics. When in
                    backtest mode, ticks are broadcast on{" "}
                    <code className="text-blue-400">backtest_price_</code>,{" "}
                    <code className="text-blue-400">backtest_bid_</code>, and{" "}
                    <code className="text-blue-400">backtest_ask_</code> topics.
                    This ensures that simulation data stays within the Simulate
                    page and backtest engine instances, while live topics remain
                    pure.
                  </p>
                </div>
              </div>

              <p className="text-white/60 text-lg leading-relaxed">
                Running a backtest is a seamless process managed through the{" "}
                <span className="text-white font-bold">Simulate</span>{" "}
                dashboard. You first select a dataset (represented by a CSV file
                imported into your PostgreSQL instance) and then choose a
                strategy from your database of saved code. When you click "Start
                Backtest", the system coordinates the switch to{" "}
                <code className="text-white">_Backtest</code> mode, and the
                Engine begins tracking the performance of the selected logic. As
                trades are generated, the Engine computes real performance
                metrics – including{" "}
                <span className="text-green-400">Total Return</span>,{" "}
                <span className="text-red-400">Max Drawdown</span>, and the{" "}
                <span className="text-blue-400">Sharpe Ratio</span> – providing
                you with a professional-grade evaluation of your alpha before a
                single dollar is put at risk.
              </p>

              <div className="bg-black/50 p-8 rounded-2xl border border-white/5 space-y-6">
                <h4 className="text-white font-bold text-sm uppercase tracking-widest">
                  Backtest Workflow Walkthrough
                </h4>
                <div className="space-y-4">
                  {[
                    {
                      t: "Switch Source",
                      d: 'The platform sends the "_Backtest" command to the Datafeed Server, which halts live exchange data and connects to the Dadapter.',
                    },
                    {
                      t: "Data Streaming",
                      d: "The Dadapter reads the market_data table ordered by timestamp and pushes ticks into the 9000 port broadcast loop.",
                    },
                    {
                      t: "Logic Processing",
                      d: "The selected C++ strategy receives ticks via its onTick() method, generating buy/sell signals as if it were trading live.",
                    },
                    {
                      t: "Result Aggregation",
                      d: "Once the stream ends, the Engine calculates the final P&L, win rate, and risk metrics, sending them to the UI overlay for review.",
                    },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[#FF6D1F]">
                          {i + 1}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white text-xs font-bold">{step.t}</p>
                        <p className="text-white/30 text-[10px] leading-relaxed">
                          {step.d}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Security & Risk
            </h1>

            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-white/60 text-lg leading-relaxed">
                Security is not an afterthought in BLINK; it is a foundational
                principle. Since the platform handles sensitive API keys and
                executes real-time financial transactions, we have implemented
                multiple layers of protection to safeguard your data, your
                account credentials, and most importantly, your trading capital.
              </p>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Shield size={24} className="text-green-500" />
                  API Key Management
                </h2>
                <p className="text-white/60 text-lg leading-relaxed">
                  The first layer of defense is our API Key Management system.
                  BLINK uses a decentralized{" "}
                  <code className="text-white">.env</code> file configuration
                  strategy. Your Binance API keys, secrets, and other sensitive
                  credentials are stored only in this local file, which is
                  explicitly ignored by Git to prevent accidental leaks. At
                  runtime, the <code className="text-[#FF6D1F]">Config</code>{" "}
                  singleton class loads these values directly into the
                  Executor's memory. These keys are never stored in the
                  PostgreSQL database, never logged, and never transmitted over
                  local WebSockets. This ensures that even if an attacker were
                  to gain access to your database or network traffic, your
                  exchange credentials would remain secure.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-green-500/30 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                    <Shield size={20} className="text-green-500" />
                  </div>
                  <h4 className="text-white font-bold mb-2">
                    Cryptographic Signing
                  </h4>
                  <p className="text-white/40 text-xs leading-relaxed">
                    All communication with external exchange endpoints is
                    secured using industry-standard HMAC-SHA256 signing. This
                    process is handled exclusively by the{" "}
                    <span className="text-white font-bold">Order Executor</span>{" "}
                    service using the OpenSSL library. Every request includes a
                    cryptographic signature and a narrow receive window
                    (recvWindow) to prevent replay attacks and ensure that
                    orders are only executed if they reach the exchange within
                    seconds of being generated.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-[#FF6D1F]/30 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#FF6D1F]/10 flex items-center justify-center mb-4">
                    <AlertCircle size={20} className="text-[#FF6D1F]" />
                  </div>
                  <h4 className="text-white font-bold mb-2">
                    Pre-Trade Risk Checks
                  </h4>
                  <p className="text-white/40 text-xs leading-relaxed">
                    The <code className="text-[#FF6D1F]">RiskManager</code>{" "}
                    component serves as a final automated gatekeeper. It
                    enforces several hard-coded safety rules that cannot be
                    bypassed by strategy code: it rejects non-positive
                    quantities, validates that order sizes do not exceed
                    pre-defined safety limits, halts trading if a daily loss
                    threshold is reached, and ensures only whitelisted symbols
                    are traded. This prevents "fat-finger" errors from reaching
                    the exchange.
                  </p>
                </div>
              </div>

              <section className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-2xl space-y-4">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <Shield size={18} className="text-blue-400" />
                  Production Safety Best Practices
                </h4>
                <div className="space-y-4">
                  <p className="text-white/40 text-sm leading-relaxed">
                    1.{" "}
                    <span className="text-white font-bold">Testnet First:</span>{" "}
                    Always use the Binance Testnet credentials in your .env file
                    when deploying a new strategy. We recommend monitoring
                    strategy logs for at least 48 hours to ensure logic
                    stability under real market volatility.
                  </p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    2.{" "}
                    <span className="text-white font-bold">
                      Least Privilege:
                    </span>{" "}
                    When generating API keys on the exchange, disable
                    "Withdrawal" permissions and only enable "Spot Trading" or
                    "Futures Trading" as needed. This significantly limits your
                    exposure in the event of a key compromise.
                  </p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    3.{" "}
                    <span className="text-white font-bold">
                      Localhost Isolation:
                    </span>{" "}
                    By default, BLINK's internal WebSockets bind only to{" "}
                    <code className="text-white">localhost</code>. Do not expose
                    ports 9000 or 9001 to the public internet unless you have
                    implemented an additional layer of VPN or SSL/TLS
                    encryption.
                  </p>
                </div>
              </section>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Activity className="text-white/20 animate-pulse" size={32} />
            </div>
            <h2 className="text-xl font-bold text-white">
              Section Under Construction
            </h2>
            <p className="text-white/40 max-w-xs">
              This documentation section is currently being updated with the
              latest platform changes.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex bg-[#0a0a0a]">
      {/* Sidebar */}
      <div className="w-72 border-r border-white/10 bg-[#111] flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#FF6D1F]">
            <Book size={20} />
            <h2 className="font-bold text-white tracking-tight">
              Documentation
            </h2>
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
              <section.icon
                size={18}
                className={
                  activeSection === section.id
                    ? "text-white"
                    : "group-hover:text-[#FF6D1F]"
                }
              />
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
        <div className="max-w-4xl mx-auto px-12 py-16">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Docs;
