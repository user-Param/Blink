import { useEffect } from "react";
import { BGPattern } from "../components/animation/background";
import { Component as TextVaporize } from "../components/animation/text";
import AnimatedTextCycle from "../components/animation/text2";



import {
  TrendingUp,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Globe,
  Cpu,
  Layers,
} from "lucide-react";
import { useWebSocket } from "../hooks/useWebSocket";

interface HomeProps {
  setActivePage: (page: string) => void;
}

const Home = ({ setActivePage }: HomeProps) => {
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
      description:
        "Execute trades in microseconds with our high-performance C++ core engine.",
    },
    {
      icon: <Shield className="text-blue-400" size={24} />,
      title: "Institutional Security",
      description:
        "Military-grade encryption and multi-sig cold storage for all digital assets.",
    },
    {
      icon: <BarChart3 className="text-[#FF6D1F]" size={24} />,
      title: "Advanced Analytics",
      description:
        "Powerful backtesting suite with millisecond-precision historical data.",
    },
  ];

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-screen z-0 pointer-events-none">
        <BGPattern variant="grid" size={40} fill="rgba(255,255,255,0.03)" mask="fade-edges" />
      </div>
      
      <div className="relative z-10 pt-20 pb-16 px-6 lg:pt-32 lg:pb-32 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto text-left w-full">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/60 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#FF6D1F] animate-pulse"></span>
            Blink V1.0 is now live
          </div>

          <h1 className="mb-8 font-black tracking-tighter leading-[1.1] flex flex-col uppercase">
            <span className="text-2xl lg:text-4xl normal-case font-medium text-white/70">
              Shaping the next generation of 
            </span>
            <span className="text-2xl lg:text-4xl normal-case font-medium text-white/70">
              algorithmic traders
            </span>
            <div className="flex flex-col lg:flex-row lg:gap-4 items-start">
              <span className="text-3xl lg:text-5xl opacity-10">Build.</span>
              <span className="text-3xl lg:text-5xl opacity-30">Backtest.</span>
              <span className="text-3xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF6D1F] to-[#ff8c4a]">
                Deploy.
              </span>
            </div>
          </h1>

          <div className="flex flex-col sm:flex-row items-start justify-start gap-4 mt-8">
            <button
              onClick={() => setActivePage("research")}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#FF6D1F] hover:bg-[#e55d1a] text-white font-bold transition-all shadow-lg shadow-[#FF6D1F]/20 flex items-center justify-center gap-2 group text-sm"
            >
              Start Researching{" "}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button
              onClick={() => setActivePage("docs")}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-all flex items-center justify-center gap-2 text-sm"
            >
              View Documentation
            </button>
          </div>
        </div>
      </div>

      {/* Animated Text Section */}
      <div className="relative z-10 w-full py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-[20vh] w-full flex justify-evenly items-center mb-12">
            <div className="h-full w-[20%] rounded-xl"><TextVaporize text="15B+"/></div>
            <div className="h-full w-[20%] rounded-xl"><TextVaporize text="99%"/></div>
            <div className="h-full w-[20%] rounded-xl"><TextVaporize text="24/7"/></div>
            <div className="h-full w-[20%] rounded-xl"><TextVaporize text="0.1ms"/></div>
          </div>
          
          <div className="h-[20vh] w-full flex flex-col justify-center items-center border-t border-white/20">
            <p className="text-white/30 text-sm uppercase tracking-widest mb-4">Empowering Traders to</p>
            <AnimatedTextCycle
              words={["Analyze.", "Automate.", "Accelerate.", "Succeed."]}
              interval={1000}
              className="text-4xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF6D1F] to-[#ff8c4a]"
            />
          </div>
        </div>
      </div>

      <div className="h-screen"></div>
    </div>  );
};

export default Home;
