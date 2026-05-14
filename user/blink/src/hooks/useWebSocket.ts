import { useRef, useState, useEffect, useCallback } from "react";

interface UseWebSocketResult {
  isConnected: boolean;
  lastMessage: string | null;
  sendMessage: (message: string) => void;
  subscribe: (topic: string) => void;
  marketData: { price?: number; bid?: number; ask?: number; symbol?: string; timestamp?: number } | null;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === "localhost"
    ? "ws://localhost:9000"
    : "wss://blink-1-6xql.onrender.com/");

export const useWebSocket = (path: string = "/ws/datafeed"): UseWebSocketResult => {
  const url = `${BACKEND_URL}${path}`;
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<{ price?: number; bid?: number; ask?: number; symbol?: string; timestamp?: number } | null>(null);
  const messageQueue = useRef<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
      // Send queued messages
      while (messageQueue.current.length > 0) {
        const msg = messageQueue.current.shift();
        if (msg) ws.send(msg);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      // Connection error — isConnected state tracks status for UI
    };

    ws.onmessage = (event) => {
      const data = event.data;
      setLastMessage(data);

      // Parse market data
      try {
        const json = JSON.parse(data);
        setMarketData((prev) => ({
          ...prev,
          ...json,
        }));
      } catch {
        // Non-JSON message, ignore
      }
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [url]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      // Queue message if not ready
      messageQueue.current.push(message);
    }
  }, []);

  const subscribe = useCallback((topic: string) => {
    const msg = JSON.stringify({ subscribe: [topic] });
    sendMessage(msg);
  }, [sendMessage]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
    marketData,
  };
};
