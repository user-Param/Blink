import { useRef } from "react";
import { Zap } from "lucide-react";

type NavbarProps = {
  setActivePage: (page: string) => void;
  activePage: string;
};

const Navbar = ({ setActivePage, activePage }: NavbarProps) => {
  const wsRef = useRef<WebSocket | null>(null);

  const getWebSocket = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      wsRef.current = new WebSocket("ws://localhost:9000");
    }
    return wsRef.current;
  };

  const sendMode = (mode: string) => {
    const ws = getWebSocket();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(mode);
      console.log(`Sent mode: ${mode}`);
    } else {
      console.warn("WebSocket not ready, cannot send mode");
    }
  };

  const navLinks = [
    { name: "Home", id: "home", action: () => setActivePage("home") },
    { name: "Docs", id: "docs", action: () => setActivePage("docs") },
    { name: "Trade", id: "trade", action: () => { setActivePage("trade"); sendMode("_Live"); } },
    { name: "Research", id: "research", action: () => setActivePage("research") },
    { name: "Simulate", id: "simulate", action: () => { setActivePage("simulate"); sendMode("_Backtest"); } },
    { name: "Social", id: "social", action: () => setActivePage("social") },
    { name: "Param", id: "profile", action: () => setActivePage("profile") },
  ];

  return (
    <div className="flex items-center justify-between p-4">
      {/* Logo Section */}
      <div 
        className="flex items-center gap-2 cursor-pointer group" 
        onClick={() => setActivePage("home")}
      >
        <div className="relative">
          <Zap className="text-[#FF6D1F] fill-[#FF6D1F] animate-pulse" size={20} />
        </div>
        <h2 className="text-white text-xl font-black tracking-tighter group-hover:text-[#FF6D1F] transition-colors">
          BLINK
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative mr-4">
          <input
            className="border border-white/10 rounded-full px-4 py-1.5 bg-white/5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6D1F]/50 transition-all w-48"
            type="text"
            placeholder="Search assets..."
          />
        </div>

        <div className="flex items-center">
          {navLinks.map((link) => (
            <span
              key={link.id}
              onClick={link.action}
              className={`px-4 py-1 text-sm font-bold cursor-pointer transition-all relative group ${
                activePage === link.id ? "text-white" : "text-white/40 hover:text-white"
              }`}
            >
              {link.name}
              {activePage === link.id && (
                <div className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-[#FFFFFF] opacity-20"></div>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
