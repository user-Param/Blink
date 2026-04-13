# RSI Mean Reversion Strategy
import time

class RSIStrategy:
    def __init__(self, period=14, overbought=70, oversold=30):
        self.period = period
        self.overbought = overbought
        self.oversold = oversold
        self.prices = []
        print(f"RSI Strategy Initialized (Period: {period}, OB: {overbought}, OS: {oversold})")

    def calculate_rsi(self, prices):
        if len(prices) <= self.period:
            return 50
        
        gains = []
        losses = []
        for i in range(1, len(prices)):
            diff = prices[i] - prices[i-1]
            if diff >= 0:
                gains.append(diff)
                losses.append(0)
            else:
                gains.append(0)
                losses.append(abs(diff))
        
        avg_gain = sum(gains[-self.period:]) / self.period
        avg_loss = sum(losses[-self.period:]) / self.period
        
        if avg_loss == 0:
            return 100
        
        rs = avg_gain / avg_loss
        return 100 - (100 / (1 + rs))

    def on_tick(self, price):
        self.prices.append(price)
        if len(self.prices) > self.period + 1:
            self.prices.pop(0)
            
        if len(self.prices) < self.period + 1:
            return "WAITING"
            
        rsi = self.calculate_rsi(self.prices)
        
        if rsi < self.oversold:
            return "BUY"
        elif rsi > self.overbought:
            return "SELL"
        return "HOLD"

if __name__ == "__main__":
    strategy = RSIStrategy()
    # Simulated tick
    print(f"Signal for $50000: {strategy.on_tick(50000)}")
