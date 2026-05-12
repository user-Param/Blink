# BLINK – Algorithmic Trading Platform

BLINK is a distributed algorithmic trading system designed for high-performance strategy development, backtesting, and live deployment. It consists of a C++ backend (data ingestion, order execution, strategy engine) and a modern React frontend that provides a complete terminal for research, simulation, and trading.

## System Components

The platform is split into several independent services that communicate over WebSockets and REST:

- **Datafeed Server** – ingests live market data from exchanges and streams it to clients on port `9000`.
- **Broker (EAdapter)** – connects to cryptocurrency exchanges (Binance, Jupiter, Birdeye) and provides unified price feeds.
- **Database Adapter (Dadapter)** – bridges PostgreSQL historical data with the Datafeed Server for backtesting.
- **Trading Engine** – runs trading strategies written in C++ or Python, processes market ticks, and enforces risk limits.
- **Risk Manager** – validates every order before it reaches the executor.
- **Order Executor (OAdapter)** – translates strategy signals into real orders and sends them to the chosen exchange on port `9001`.
- **Research Executor** – a Python backend on port `5001` that executes and validates strategies written in the browser editor.
- **Frontend (Blink Terminal)** – a React/Vite dashboard with a code editor, live charts, order book, and simulation controls.

## Prerequisites

- **C++ Compiler** (GCC 11+ or Clang 14+) and CMake
- **Boost libraries** (Beast, Asio, system)
- **OpenSSL**, **nlohmann/json**, **libpqxx** (for PostgreSQL)
- **Python 3** (with `flask`, `flask-cors`, `matplotlib`, `numpy` – install via pip)
- **Node.js** 18+ and npm
- **PostgreSQL** 15+ (optional but required for historical data backtesting)

## Quick Local Setup

Clone the repository, then follow the steps for your environment.

### 1. Environment Configuration

Create a `.env` file in the project root (the same level as `docker-compose.yml`). Add your exchange API keys and other settings. Example:

```bash
# Binance
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret
BINANCE_TESTNET=true          # set to false for live trading

# Jupiter (Solana DEX aggregator)
JUPITER_API_KEY=              # optional, free tier works without

# Birdeye (Solana token data)
BIRDEYE_API_KEY=your_birdeye_api_key

# Default exchange to use (binance, jupiter, birdeye)
DEFAULT_EXCHANGE=binance