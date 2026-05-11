import React, { useEffect, useRef, memo } from "react";

interface TradeChartProps {
  symbol?: string;
}

function TradeChart({ symbol = "SOLUSD" }: TradeChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = "";

    const script = document.createElement("script");

    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "COINBASE:${symbol}",
        "interval": "1",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "hide_side_toolbar": false,
        "backgroundColor": "#181818",
        "gridColor": "rgba(242, 242, 242, 0.06)"
      }`;

    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: "100%", width: "100%" }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

export default memo(TradeChart);