import React, { useEffect, useRef, memo } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  type UTCTimestamp,
} from "lightweight-charts";

// 2. Accept any candle format – we normalise it inside
interface RawCandle {
  // TradingView UDF format
  t?: number | string;
  o?: number;
  h?: number;
  l?: number;
  c?: number;
  // your previous format
  time?: number | string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

interface Candle {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Helper: normalise any input into our internal Candle type
function normaliseCandle(raw: RawCandle): Candle {
  return {
    time: (Number(raw.t ?? raw.time) / 1000) as UTCTimestamp, // UDF gives ms
    open: raw.o ?? raw.open ?? 0,
    high: raw.h ?? raw.high ?? 0,
    low: raw.l ?? raw.low ?? 0,
    close: raw.c ?? raw.close ?? 0,
  };
}

interface TradeChartProps {
  /** Base URL of your datafeed server, e.g. 'http://localhost:8080' */
  datafeedBaseUrl?: string;
  /** Symbol to subscribe to, e.g. 'BTCUSDT' */
  symbol?: string;
  /** Max number of candles to keep in memory (default 500) */
  maxCandles?: number;
}

const TradeChart: React.FC<TradeChartProps> = ({
  datafeedBaseUrl = "http://localhost:8080",
  symbol = "BTCUSDT",
  maxCandles = 500,
}) => {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container.current) return;

    let chart: ReturnType<typeof createChart> | null = null;
    let candleSeries: ReturnType<typeof chart.addSeries> | null = null;
    let ws: WebSocket | null = null;
    let candles: Candle[] = [];
    let reconnectTimeout: NodeJS.Timeout;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0 || chart) return;

      // ----- Chart init -----
      chart = createChart(container.current!, {
        width,
        height,
        layout: {
          background: { type: ColorType.Solid, color: "#0F0F0F" },
          textColor: "#d1d4dc",
        },
        grid: {
          vertLines: { color: "rgba(242,242,242,0.06)" },
          horzLines: { color: "rgba(242,242,242,0.06)" },
        },
        timeScale: {
          timeVisible: true,
          borderColor: "rgba(242,242,242,0.2)",
        },
        rightPriceScale: {
          borderColor: "rgba(242,242,242,0.2)",
        },
        crosshair: { mode: 0 },
      });

      candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#4bffb5",
        downColor: "#ff4976",
        borderDownColor: "#ff4976",
        borderUpColor: "#4bffb5",
        wickDownColor: "#ff4976",
        wickUpColor: "#4bffb5",
      });

      // ----- Fetch initial history -----
      const fetchHistory = async () => {
        try {
          const res = await fetch(
            `${datafeedBaseUrl}/api/candles?symbol=${symbol}&limit=100`
          );
          const json: RawCandle[] = await res.json();
          candles = json.map(normaliseCandle);
          if (candleSeries) {
            candleSeries.setData(candles);
            chart?.timeScale().fitContent();
          }
        } catch (err) {
          console.error("Failed to load history:", err);
        }
      };

      // ----- WebSocket connection -----
      const connectWS = () => {
        if (ws && ws.readyState !== WebSocket.CLOSED) return;

        ws = new WebSocket(`${datafeedBaseUrl.replace(/^http/, "ws")}/ws/candles?symbol=${symbol}`);

        ws.onopen = () => {
          console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
          try {
            const raw: RawCandle = JSON.parse(event.data);
            const candle = normaliseCandle(raw);

            if (
              candles.length > 0 &&
              candles[candles.length - 1].time === candle.time
            ) {
              // update last candle (live bar)
              candles[candles.length - 1] = candle;
            } else {
              candles.push(candle);
              if (candles.length > maxCandles) {
                candles = candles.slice(-maxCandles);
              }
            }

            candleSeries?.setData(candles);
            // optional: keep chart at the rightmost position
            // chart?.timeScale().scrollToPosition(0, false);
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        ws.onerror = (err) => {
          console.error("WebSocket error:", err);
          ws?.close(); // will trigger onclose → reconnect
        };

        ws.onclose = () => {
          console.log("WebSocket closed – reconnecting in 3s...");
          clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(connectWS, 3000);
        };
      };

      fetchHistory();
      connectWS();
    });

    observer.observe(container.current);

    return () => {
      observer.disconnect();
      chart?.remove();
      ws?.close();
      clearTimeout(reconnectTimeout);
    };
  }, [datafeedBaseUrl, symbol, maxCandles]);

  return (
    <div ref={container} style={{ width: "100%", height: "100%" }} />
  );
};

export default memo(TradeChart);