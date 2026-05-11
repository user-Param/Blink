const ws = new WebSocket("ws://localhost:9000");

ws.onopen = () => {
  ws.send(JSON.stringify({ subscribe: ["backtest_price_", "backtest_bid_", "backtest_ask_", "backtest_complete"] }));
};

ws.onmessage = (event: MessageEvent) => {
  try {
    const data = JSON.parse(event.data as string);
    console.log("[datafeed]", data);
  } catch {
    console.log("[raw]", event.data);
  }
};
