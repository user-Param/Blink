# Quick Start - Real Trading Setup

## 1. Get Binance API Keys
```bash
# Go to https://www.binance.com/en/account/api-management
# Create API keys with trading permissions
# Enable testnet for testing: https://testnet.binance.vision
```

## 2. Configure .env
```bash
cd /Users/param/Documents/BLINK
vi .env

# Update these lines:
BINANCE_API_KEY=your_actual_api_key_here
BINANCE_API_SECRET=your_actual_api_secret_here
BINANCE_TESTNET=false  # Set to true for testnet first!
```

## 3. Start the Platform
```bash
./start.sh
```

## 4. Watch Real Orders Flow
```bash
# In executor logs:
[RiskManager] ✓ Order sent [strategy_0]: BTCUSDT SELL 1 @ $71258
[Binance] Sending order: BTCUSDT SELL 1 @ 71258
[OAdapter] Order Response: BTCUSDT_SELL_123 | Status: ACCEPTED

# Your order is now on Binance!
```

## 5. Add Your Own Strategies
Create a new strategy in `engine/src/main.cpp`:

```cpp
class MyTrendFollower : public Algo {
public:
    void onTick(const MarketData& data) override {
        // Your trading logic here
        if (should_buy) {
            buy(data.symbol, data.price, 1);
        }
    }
};

// In main():
algoMgr->addAlgo(std::make_unique<MyTrendFollower>());
```

Each strategy gets its own `strategy_id` and all orders are tracked separately!

## Multi-Strategy Example
```cpp
// Run 3 strategies simultaneously on same executor
algoMgr->addAlgo(std::make_unique<SimpleScalper>());      // strategy_0
algoMgr->addAlgo(std::make_unique<MeanReversion>());      // strategy_1
algoMgr->addAlgo(std::make_unique<TrendFollower>());      // strategy_2

// All orders go through single executor with proper tracking
```

## Security Checklist
- [ ] .env file is in .gitignore
- [ ] API keys never in code or logs
- [ ] Using TESTNET first before mainnet
- [ ] Risk limits set in .env (MAX_ORDER_SIZE, MAX_DAILY_LOSS)
- [ ] Orders properly validated in RiskManager

## Monitoring
```bash
# Check executor is receiving orders
grep "📤 Order from Strategy" logs.txt

# Check exchange responses
grep "Order Response" logs.txt

# Check for errors
grep "❌" logs.txt
```

## Emergency Stop
```bash
# Press Ctrl+C in terminal running start.sh
```

---
**Ready to trade! Start with TESTNET first to verify everything works.**
