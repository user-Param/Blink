import { useEffect } from "react";
import { BGPattern } from "../components/animation/background";



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

          <h1 className="mb-8 font-black tracking-tighter leading-[0.9] flex flex-col uppercase">
            <span className="text-4xl lg:text-6xl mb-4 normal-case font-medium text-white/70">
              Shaping the next generation of algorithmic traders
            </span>
            <div className="flex flex-col lg:flex-row lg:gap-8 items-start">
              <span className="text-6xl lg:text-[100px] opacity-30">Build.</span>
              <span className="text-6xl lg:text-[100px] opacity-60">Backtest.</span>
              <span className="text-6xl lg:text-[100px] text-transparent bg-clip-text bg-gradient-to-r from-[#FF6D1F] to-[#ff8c4a]">
                Deploy.
              </span>
            </div>
          </h1>

          <div className="flex flex-col sm:flex-row items-start justify-start gap-6 mt-12">
            <button
              onClick={() => setActivePage("research")}
              className="w-full sm:w-auto px-10 py-5 rounded-xl bg-[#FF6D1F] hover:bg-[#e55d1a] text-white font-black transition-all shadow-lg shadow-[#FF6D1F]/20 flex items-center justify-center gap-3 group text-xl"
            >
              Start Researching{" "}
              <ArrowRight
                size={24}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button
              onClick={() => setActivePage("docs")}
              className="w-full sm:w-auto px-10 py-5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black border border-white/10 transition-all flex items-center justify-center gap-3 text-xl"
            >
              View Documentation
            </button>
          </div>
        </div>
      </div>
      <div className="h-screen"></div>
    </div>  );
};

export default Home;
