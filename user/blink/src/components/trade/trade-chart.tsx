import React, { useEffect, useRef, memo } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  type UTCTimestamp,
} from "lightweight-charts";

interface TradeChartProps {
  symbol?: string;
}

const TradeChart: React.FC<TradeChartProps> = ({ symbol = "BTCUSDT" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#000000" },
        textColor: "#DDD",
      },
      grid: {
        vertLines: { color: "#222" },
        horzLines: { color: "#222" },
      },
      width: containerRef.current.clientWidth || 800,
      height: containerRef.current.clientHeight || 600,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(containerRef.current);

    const ws = new WebSocket("ws://localhost:9000");
    let lastCandle: any = null;

    ws.onopen = () => {
      ws.send("_Live");
      ws.send(JSON.stringify({ subscribe: ["ticker_"] }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.topic !== "ticker_" || data.symbol !== symbol) return;

        const price = data.price;
        const time = (Math.floor(data.timestamp / 10000 / 60) * 60) as UTCTimestamp;

        if (!lastCandle || lastCandle.time !== time) {
          lastCandle = { time, open: price, high: price, low: price, close: price };
        } else {
          lastCandle.high = Math.max(lastCandle.high, price);
          lastCandle.low = Math.min(lastCandle.low, price);
          lastCandle.close = price;
        }
        candleSeries.update(lastCandle);
      } catch (e) {
        // Ignore
      }
    };

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      ws.close();
    };
  }, [symbol]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "200px" }} />;
};

export default memo(TradeChart);

