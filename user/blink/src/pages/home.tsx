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
      <div className="absolute inset-0 z-0">
        <BGPattern variant="grid" size={40} fill="rgba(255,255,255,0.03)" mask="fade-edges" />
      </div>
      
      <div className="relative z-10 pt-20 pb-16 px-6 lg:pt-32 lg:pb-32">
        <div className="max-w-7xl mx-auto text-center">
          
          

          <h1 className="mb-8 font-black tracking-tight leading-[1.05] flex-col">
            <span className="block text-5xl lg:text-6xl">
              Shaping the next generation of algorithmic traders

              
            </span>
            <span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#9AD872] to-green-400">
                Build, backtest, and deploy strategies in one unified platform
              </span>
</h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={() => setActivePage("research")}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#FF6D1F] hover:bg-[#e55d1a] text-white font-bold transition-all shadow-lg shadow-[#FF6D1F]/20 flex items-center justify-center gap-2 group"
            >
              Start Researching{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button
              onClick={() => setActivePage("docs")}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              View Documentation
            </button>
          </div>

                      </div>
      </div>
    </div>  );
};

export default Home;
