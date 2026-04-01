import { useRef } from "react";

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

  return (
    <div className="flex items-center justify-between">

      <h2 className="text-white text-lg font-semibold">Blink</h2>

      <div className="flex items-center">
        <span className="pr-5 pl-5">
          <input
            className="border border-white/30 rounded-sm px-2 py-1 bg-transparent text-white"
            type="text"
            placeholder="search..."
          />
        </span>

        <span
          onClick={() => setActivePage("home")}
          className={`pr-5 pl-5 cursor-pointer ${
            activePage === "home" ? "text-white" : "text-white/50"
          }`}
        >
          Home
        </span>

        <span
          onClick={() => setActivePage("docs")}
          className={`pr-5 pl-5 cursor-pointer ${
            activePage === "docs" ? "text-white" : "text-white/50"
          }`}
        >
          Docs
        </span>

        <span
          onClick={() => {setActivePage("trade"); sendMode("_Live")}}
          className={`pr-5 pl-5 cursor-pointer ${
            activePage === "trade" ? "text-white" : "text-white/50"
          }`}
        >
          Trade
        </span>

        <span
          onClick={() => {setActivePage("research")}}
          className={`pr-5 pl-5 cursor-pointer ${
            activePage === "editor" ? "text-white" : "text-white/50"
          }`}
        >
          Research
        </span>

        <span
          onClick={() => {setActivePage("simulate"); sendMode("_Backtest")}}
          className={`pr-5 pl-5 cursor-pointer ${
            activePage === "simulate" ? "text-white" : "text-white/50"
          }`}
        >
          Simulate
        </span>

        <span
          onClick={() => setActivePage("profile")}
          className={`pr-5 pl-5 cursor-pointer ${
            activePage === "profile" ? "text-white" : "text-white/50"
          }`}
        >
          Param
        </span>
      </div>
    </div>
  );
};

export default Navbar;
