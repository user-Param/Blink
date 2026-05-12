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
The platform will work without API keys in test mode, but for live trading real credentials are required.

2. Database (PostgreSQL)

If you plan to use historical backtesting, make sure PostgreSQL is running. Create a database named blink and run the initial schema:

bash
psql -U postgres -f database/init.sql
The default database user is blink with password blink_password (adjust in docker-compose.yml if needed). For local development without Docker, update the connection string in database/Dadapter.cpp (the db_config_ variable).

3. Build and Start Services

The easiest way is to use the start.sh script, which compiles and runs all C++ services, the research backend, and the frontend.

bash
chmod +x start.sh
./start.sh
Alternatively, you can use Docker Compose (requires Docker installed):

bash
docker-compose up --build
This will spin up the PostgreSQL database, datafeed, broker, engine, executor, and frontend. The frontend will be available at http://localhost.

4. Access the Terminal

Frontend – open http://localhost (or http://localhost:5173 if using dev mode).
Datafeed WebSocket – ws://localhost:9000
Executor WebSocket – ws://localhost:9001
Research backend – http://localhost:5001
Project Structure (simplified)

text
├── broker/            # Exchange adapters (Binance, Jupiter, Birdeye)
├── database/          # Dadapter, init.sql, CSV data
├── engine/            # C++ trading engine, Risk Manager, Algo Manager
│   └── algos/         # Python strategy files live here
├── executor/          # Order executor (Binance REST / WebSocket)
├── user/blink/        # React frontend
│   └── src/
│       ├── components/  # UI components (editor, trade, AI)
│       ├── pages/       # Home, Trade, Research, Simulate, Docs
│       └── hooks/       # WebSocket and order tracking hooks
├── supabase/          # Supabase configuration (for cloud deployment)
├── docker-compose.yml
├── Dockerfile         # Container build for all services
├── start.sh           # Local build & launch script
└── .env               # your API keys (not committed)
Developing Strategies

You can write strategies directly in the browser editor (Research page). The platform supports:

Python – define a class with an on_tick method. The engine will call it with market data.
C++ – inherit from Algo and implement onTick(const MarketData& data). Use the buy/sell methods.
Jupyter Notebooks – for data analysis and visualization.
All saved strategies are placed in engine/algos/ and automatically picked up by the trading engine.

Running a Backtest

Go to the Simulate page.
Select a dataset (import a CSV file if needed).
Pick a saved strategy.
Click Start Backtest.
The engine will replay historical ticks, execute the strategy, and display performance metrics (return, drawdown, Sharpe ratio, etc.).
Switching Between Exchanges

The Trade page allows you to choose Binance, Jupiter or Birdeye as the data source. This selection is forwarded to the broker, which restarts the appropriate adapter.

License

MIT License – see the LICENSE file for details.

