import { useState } from "react";
import { 
  BookOpen, 
  Code2, 
  Terminal, 
  Cpu, 
  Zap, 
  Shield, 
  Search,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export const Docs = () => {
    const [activeSection, setActiveSection] = useState("introduction");

    const sections = [
        { id: "introduction", title: "Introduction", icon: <BookOpen size={18} /> },
        { id: "getting-started", title: "Getting Started", icon: <Zap size={18} /> },
        { id: "core-engine", title: "C++ Core Engine", icon: <Cpu size={18} /> },
        { id: "api-reference", title: "API Reference", icon: <Terminal size={18} /> },
        { id: "backtesting", title: "Backtesting Suite", icon: <Code2 size={18} /> },
        { id: "security", title: "Security & Risk", icon: <Shield size={18} /> },
    ];

    const renderContent = () => {
        switch(activeSection) {
            case "introduction":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">Documentation</h1>
                            <p className="text-white/50 text-lg">Welcome to the Blink Trading documentation. Blink is a high-performance algorithmic trading platform designed for institutional-grade execution and rigorous backtesting.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                                <Zap className="text-[#FF6D1F] mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold mb-2">Fast Execution</h3>
                                <p className="text-white/40 text-sm">Learn how to leverage our C++ backend for sub-millisecond execution latencies.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                                <Code2 className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold mb-2">Backtesting</h3>
                                <p className="text-white/40 text-sm">Run complex simulations on years of historical market data with tick-by-tick precision.</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-4">
                            <Info className="text-blue-400 shrink-0" size={24} />
                            <div>
                                <h4 className="font-bold text-blue-400 mb-1">Latest Version: V2.0.4</h4>
                                <p className="text-sm text-blue-400/80">The current version includes the new WebSocket stream manager and optimized order matching logic.</p>
                            </div>
                        </div>
                    </div>
                );
            case "core-engine":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-4xl font-bold">C++ Core Engine</h1>
                        <p className="text-white/50 text-lg">The Blink engine is built with modern C++ to ensure deterministic execution and minimal memory footprint.</p>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Architecture</h2>
                            <p className="text-white/40">Our architecture separates the market data gateway, the strategy execution layer, and the order management system (OMS) into highly optimized, lock-free components.</p>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#111] border border-white/10 font-mono text-sm overflow-x-auto">
                            <div className="flex gap-2 mb-4 pb-4 border-b border-white/5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                            </div>
                            <p className="text-blue-400">// Example Engine Configuration</p>
                            <p className="text-white"><span className="text-purple-400">#include</span> &lt;blink/engine.hpp&gt;</p>
                            <p className="text-white mt-4"><span className="text-orange-400">auto</span> engine = blink::<span className="text-yellow-400">EngineFactory</span>::<span className="text-yellow-400">create</span>({"{"}</p>
                            <p className="text-white ml-4">.latency_mode = <span className="text-purple-400">ULTRA_LOW</span>,</p>
                            <p className="text-white ml-4">.threading_policy = <span className="text-purple-400">LOCK_FREE</span>,</p>
                            <p className="text-white ml-4">.max_throughput = <span className="text-purple-400">10'000'000</span></p>
                            <p className="text-white">{"}"});</p>
                            <p className="text-white mt-4">engine-&gt;<span className="text-yellow-400">start</span>();</p>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                            <AlertTriangle className="text-yellow-400 shrink-0" size={24} />
                            <p className="text-sm text-yellow-400/80">Performance critical code should avoid dynamic allocations during hot paths. Use our pre-allocated memory pools.</p>
                        </div>
                    </div>
                );
            case "api-reference":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-4xl font-bold">API Reference</h1>
                        <p className="text-white/50 text-lg">Comprehensive guide to the Blink REST and WebSocket APIs.</p>

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded text-xs font-bold">GET</span>
                                    <code className="text-white/80 font-mono text-sm">/api/v1/market/depth</code>
                                </div>
                                <p className="text-sm text-white/40 mb-4">Retrieves the current order book depth for a specific instrument.</p>
                                <div className="bg-black/50 p-4 rounded-lg">
                                    <h4 className="text-xs font-bold text-white/20 uppercase mb-2 tracking-widest">Parameters</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <span className="text-blue-400">symbol</span>
                                        <span className="text-white/40">e.g. BTCUSDT</span>
                                        <span className="text-blue-400">limit</span>
                                        <span className="text-white/40">Default: 100</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded text-xs font-bold">WS</span>
                                    <code className="text-white/80 font-mono text-sm">wss://api.blink.com/v1/stream</code>
                                </div>
                                <p className="text-sm text-white/40 mb-4">Subscribe to real-time market data ticks and order status updates.</p>
                                <div className="bg-[#111] p-4 rounded-lg font-mono text-xs text-white/60">
                                    {"{ \"method\": \"SUBSCRIBE\", \"params\": [\"btcusdt@aggTrade\"] }"}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                            <CheckCircle2 className="text-green-500 shrink-0" size={24} />
                            <p className="text-sm text-green-500/80">All API responses are formatted in strict JSON-Schema-compliant payloads.</p>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-20 text-white/20">
                        <BookOpen size={48} className="mb-4 opacity-20" />
                        <p>This documentation section is currently being updated.</p>
                    </div>
                );
        }
    }

    return (
        <div className="h-full flex bg-[#0a0a0a] text-white overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-72 border-r border-white/10 flex flex-col bg-[#111]">
                <div className="p-6">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FF6D1F] transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search docs..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#FF6D1F] transition-all"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-4 mb-4">Platform Documentation</p>
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                                activeSection === section.id 
                                    ? "bg-[#FF6D1F]/10 text-[#FF6D1F] border border-[#FF6D1F]/20" 
                                    : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {section.icon}
                                <span className="text-sm font-medium">{section.title}</span>
                            </div>
                            <ChevronRight size={14} className={`transition-transform duration-300 ${activeSection === section.id ? "rotate-90" : "opacity-0 group-hover:opacity-100"}`} />
                        </button>
                    ))}
                </div>

                <div className="p-6 border-t border-white/5">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FF6D1F]/20 to-transparent border border-[#FF6D1F]/20">
                        <p className="text-xs font-bold text-[#FF6D1F] mb-1">Need help?</p>
                        <p className="text-[10px] text-white/40 mb-3">Join our developer discord community.</p>
                        <button className="text-[10px] font-bold text-white bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-colors">
                            Join Discord
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-12 py-16">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs text-white/20 mb-8">
                        <span>Docs</span>
                        <ChevronRight size={12} />
                        <span className="text-white/40">{sections.find(s => s.id === activeSection)?.title}</span>
                    </div>

                    {renderContent()}

                    {/* Footer Nav */}
                    <div className="mt-20 pt-12 border-t border-white/5 flex justify-between items-center text-sm">
                        <div className="text-white/20">
                            Last updated October 2026
                        </div>
                        <div className="flex gap-4 text-[#FF6D1F]">
                            <button className="hover:underline">Edit on GitHub</button>
                            <span className="text-white/5">|</span>
                            <button className="hover:underline">Next section →</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};