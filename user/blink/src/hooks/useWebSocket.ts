import { useRef, useState, useEffect, useCallback } from "react";

interface UseWebSocketResult {
  isConnected: boolean;
  lastMessage: string | null;
  sendMessage: (message: string) => void;
  subscribe: (topic: string) => void;
  marketData: { price?: number; bid?: number; ask?: number; symbol?: string; timestamp?: number } | null;
}

export const useWebSocket = (url: string = "ws://localhost:9000"): UseWebSocketResult => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<{ price?: number; bid?: number; ask?: number; symbol?: string; timestamp?: number } | null>(null);
  const messageQueue = useRef<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket connected to datafeed server");
      setIsConnected(true);
      // Send queued messages
      while (messageQueue.current.length > 0) {
        const msg = messageQueue.current.shift();
        if (msg) ws.send(msg);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
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
