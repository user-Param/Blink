import { useEffect } from "react";
import { 
  TrendingUp, 
  Zap, 
  Shield, 
  BarChart3, 
  ArrowRight, 
  Globe, 
  Cpu,
  Layers
} from "lucide-react";
import { useWebSocket } from "../hooks/useWebSocket";

const Home = () => {
    const { isConnected, marketData, subscribe } = useWebSocket();

    useEffect(() => {
        subscribe("price_");
        subscribe("bid_");
        subscribe("ask_");
    }, [subscribe]);

    const features = [
        {
            icon: <Zap className="text-yellow-400" size={24} />,
            title: "Ultra-Low Latency",
            description: "Execute trades in microseconds with our high-performance C++ core engine."
        },
        {
            icon: <Shield className="text-blue-400" size={24} />,
            title: "Institutional Security",
            description: "Military-grade encryption and multi-sig cold storage for all digital assets."
        },
        {
            icon: <BarChart3 className="text-[#FF6D1F]" size={24} />,
            title: "Advanced Analytics",
            description: "Powerful backtesting suite with millisecond-precision historical data."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
            {/* Background Glow Effect */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF6D1F]/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Hero Section */}
            <div className="relative pt-20 pb-16 px-6 lg:pt-32 lg:pb-32">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/60 mb-8 animate-fade-in">
                        <span className="w-2 h-2 rounded-full bg-[#FF6D1F] animate-pulse"></span>
                        Blink V2.0 is now live with enhanced C++ backend
                    </div>
                    
                    <h1 className="text-5xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
                        The Speed of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6D1F] to-orange-400">Thought</span>.<br />
                        The Precision of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Code</span>.
                    </h1>
                    
                    <p className="max-w-2xl mx-auto text-white/50 text-lg lg:text-xl mb-10 leading-relaxed">
                        A high-frequency algorithmic trading platform built for the next generation of quantitative developers. Research, backtest, and deploy in one unified environment.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#FF6D1F] hover:bg-[#e55d1a] text-white font-bold transition-all shadow-lg shadow-[#FF6D1F]/20 flex items-center justify-center gap-2 group">
                            Start Researching <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-all flex items-center justify-center gap-2">
                            View Documentation
                        </button>
                    </div>

                    {/* Dashboard Preview Component */}
                    <div className="relative max-w-5xl mx-auto rounded-2xl border border-white/10 bg-[#111] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-1000">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#181818]">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                            </div>
                            <div className="text-[10px] text-white/20 font-mono tracking-widest uppercase">System Status: Optimal</div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 p-1 bg-white/5">
                            <div className="bg-[#0a0a0a] p-8 flex flex-col items-center justify-center">
                                <p className="text-white/30 text-xs uppercase font-bold mb-4">Live BTC/USDT Price</p>
                                <h3 className="text-4xl font-mono font-bold text-white mb-2">
                                    {marketData?.price ? `$${marketData.price.toLocaleString(undefined, {minimumFractionDigits: 2})}` : "--"}
                                </h3>
                                <div className={`flex items-center gap-1 text-sm ${isConnected ? "text-green-400" : "text-red-400"}`}>
                                    <Globe size={14} className={isConnected ? "animate-spin-slow" : ""} />
                                    {isConnected ? "Live Network Feed" : "Reconnecting..."}
                                </div>
                            </div>
                            
                            <div className="bg-[#0a0a0a] p-8 flex flex-col items-center justify-center border-x border-white/5">
                                <p className="text-white/30 text-xs uppercase font-bold mb-4">Network Latency</p>
                                <div className="flex items-end gap-1 mb-2">
                                    <div className="w-1.5 h-4 bg-green-500/20 rounded-t-sm"></div>
                                    <div className="w-1.5 h-6 bg-green-500/40 rounded-t-sm"></div>
                                    <div className="w-1.5 h-3 bg-green-500/30 rounded-t-sm"></div>
                                    <div className="w-1.5 h-8 bg-green-500 rounded-t-sm"></div>
                                    <div className="w-1.5 h-5 bg-green-500/60 rounded-t-sm"></div>
                                </div>
                                <h3 className="text-2xl font-mono font-bold text-white">0.42ms</h3>
                                <p className="text-white/20 text-[10px]">P99 Execution Time</p>
                            </div>

                            <div className="bg-[#0a0a0a] p-8 flex flex-col items-center justify-center">
                                <p className="text-white/30 text-xs uppercase font-bold mb-4">Algorithm Status</p>
                                <div className="relative w-16 h-16 mb-2">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path className="text-white/5" strokeDasharray="100, 100" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="text-[#FF6D1F]" strokeDasharray="75, 100" strokeWidth="3" strokeLinecap="round" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">75%</div>
                                </div>
                                <p className="text-white/20 text-[10px]">Optimal Exposure</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {features.map((feature, i) => (
                        <div key={i} className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF6D1F]/50 transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-white/40 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tech Stack / Stats */}
            <div className="max-w-7xl mx-auto px-6 py-24 mb-20">
                <div className="p-12 rounded-3xl bg-gradient-to-br from-[#111] to-black border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <TrendingUp size={240} />
                    </div>
                    
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Engineered for the <br />most demanding markets</h2>
                            <p className="text-white/40 mb-8 max-w-md">
                                Blink handles millions of data points per second across global exchanges, ensuring you never miss a tick.
                            </p>
                            <div className="flex gap-8">
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1">10M+</div>
                                    <div className="text-xs text-white/30 uppercase font-bold tracking-widest">Ticks / Sec</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                                    <div className="text-xs text-white/30 uppercase font-bold tracking-widest">Uptime</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1">&lt; 1ms</div>
                                    <div className="text-xs text-white/30 uppercase font-bold tracking-widest">Execution</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4">
                                <Cpu className="text-indigo-400" />
                                <h4 className="font-bold">C++ Core</h4>
                                <p className="text-xs text-white/30">Native performance for critical logic.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4">
                                <Layers className="text-green-400" />
                                <h4 className="font-bold">Distributed</h4>
                                <p className="text-xs text-white/30">Scale horizontally across regions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer-ish Section */}
            <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#FF6D1F] flex items-center justify-center font-bold">B</div>
                    <span className="font-bold tracking-tight">BLINK TRADING</span>
                </div>
                <div className="text-white/20 text-xs">
                    © 2026 Blink Technologies Inc. All rights reserved.
                </div>
                <div className="flex gap-6 text-white/40 text-xs font-medium">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">API Status</a>
                </div>
            </footer>
        </div>
    );
}

export default Home;