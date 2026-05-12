markdown
# BLINK - Algorithmic Trading Platform

BLINK is a distributed, high-performance trading system designed for quantitative strategy development. It combines a C++ backend for low-latency data processing and order execution with a modern React frontend for research, simulation, and live trading. The platform supports multiple exchanges (Binance, Jupiter, Birdeye), real-time market data streaming, historical backtesting, and a built-in code editor for Python, C++, and notebooks.

---

## System Architecture

BLINK consists of several independent services that communicate via WebSockets and REST APIs. Each service can be built, deployed, and scaled separately.

- **Datafeed Server (port 9000)**: Central hub for market data. Connects to live exchanges via the broker or streams historical data from the database adapter. Clients subscribe to topics such as `price_`, `bid_`, `ask_` to receive updates.
- **Broker (EAdapter)**: Abstraction layer over exchange APIs. Currently supports Binance (WebSocket), Jupiter (REST), and Birdeye (REST). The broker normalizes price feeds and forwards them to the datafeed server or directly to the engine.
- **Database Adapter (Dadapter)**: Bridges PostgreSQL historical data with the datafeed server. When backtest mode is active, it queries the `market_data` table, replays ticks in chronological order, and broadcasts them under backtest-specific topics.
- **Trading Engine**: Core execution environment. Subscribes to market ticks from the datafeed, runs all active trading algorithms (C++ or Python), and sends order signals to the Risk Manager. Tracks backtest metrics (equity, drawdown, Sharpe ratio) when in simulation mode.
- **Risk Manager**: Validates every order before transmission. Enforces quantity limits, daily loss thresholds, symbol whitelisting, and basic sanity checks. Connects to the Order Executor on port 9001.
- **Order Executor (OAdapter, port 9001)**: Receives validated orders from the Risk Manager and routes them to the configured exchange. Handles HMAC-SHA256 signing, order placement, and status reporting. Also provides a WebSocket interface for the frontend to track orders in real time.
- **Research Executor (Python backend, port 5001)**: A Flask server that compiles/executes code from the browser editor. Validates strategy structure, runs Python cells (including Matplotlib output), and saves strategies to the `engine/algos` directory so the engine can load them.
- **Frontend (React/Vite)**: The Blink Terminal dashboard. Includes:
  - **Trade page:** Live price chart, order book, manual order panel, and algorithm deployment controls.
  - **Research page:** Monaco-powered editor with syntax highlighting for C++, Python, and Jupyter notebooks. Terminal output and AI-assisted strategy generation.
  - **Simulate page:** Backtest interface – select datasets and strategies, run simulations, view detailed results.
  - **Docs page:** Platform documentation.
  - **Social page:** Community strategy sharing (mock).
  - **Profile page:** User account and performance summary.

---

## Prerequisites

To run BLINK locally you need:

- **C++ build environment**: GCC 11+ or Clang 14+, CMake 3.16+, make
- **Libraries**: Boost (Asio, Beast, system), OpenSSL, nlohmann/json, libpqxx (for PostgreSQL)
- **Python 3.8+** with pip (for research executor and Python strategies)
- **Node.js 18+** and npm (for the frontend)
- **PostgreSQL 15+** (optional but needed for historical backtesting)

Most dependencies can be installed via your system package manager. For example on Ubuntu:

```bash
sudo apt update
sudo apt install build-essential cmake libboost-all-dev libssl-dev nlohmann-json3-dev libpqxx-dev python3 python3-pip nodejs npm
If you plan to use the Python research features, install the required Python packages:

bash
pip install flask flask-cors matplotlib numpy pandas
Installation and Setup

1. Clone the repository

bash
git clone <repository-url>
cd blink
2. Configure environment variables

Create a .env file in the project root. This file stores exchange API keys, database credentials, and other sensitive settings. It is ignored by git.

Example minimal .env:

text
# Binance account credentials (live or testnet)
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret
BINANCE_TESTNET=true

# Jupiter (Solana) – optional, free tier does not require a key
JUPITER_API_KEY=

# Birdeye (Solana tokens) – optional
BIRDEYE_API_KEY=your_birdeye_api_key

# Default exchange to use when starting the broker
DEFAULT_EXCHANGE=binance

# Research backend port
RESEARCH_BACKEND_PORT=5001

# Database connection (see Dadapter.cpp for full string)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blink
DB_USER=blink
DB_PASSWORD=blink_password
The platform will work without real API keys (test mode). In that case the Executor will not be able to place live orders; it will only route simulated orders if the exchange is unreachable.

3. Database setup (for backtesting)

If you intend to use backtesting, install PostgreSQL and create the database:

bash
sudo -u postgres createdb blink
sudo -u postgres psql blink < database/init.sql
This creates the required tables (market_data, strategies, profiles, trade_history) and grants privileges to the user blink. Adjust the username/password if needed; you can change the connection string in database/Dadapter.cpp line db_config_.

To load historical CSV data, use the COPY command or an ETL script. For initial testing, the Dadapter will generate mock data if the table is empty.

4. Build the C++ services

You can build all back-end components manually using CMake, or run the automated build script.

Manual build (for each directory):

bash
# Datafeed (if you have a separate datafeed component – usually built with the broker)
cd broker
mkdir build && cd build
cmake ..
make
cd ../..

# Executor
cd executor
mkdir build && cd build
cmake ..
make
cd ../..

# Engine
cd engine
mkdir build && cd build
cmake ..
make
cd ../..
Note: The Dadapter (database/Dadapter.cpp) can be compiled as a standalone program:

bash
g++ -std=c++17 -O2 database/Dadapter.cpp -o dadapter -lboost_system -lssl -lcrypto -lpqxx -lpq -lpthread
Using the provided start.sh script:

The script start.sh handles compilation and startup of all services (datafeed, dadapter, executor, engine, research backend, frontend). It also allows selective logging.

bash
chmod +x start.sh
./start.sh          # builds and starts everything, tails all logs
./start.sh --all    # same as above
./start.sh --engine # show only engine log
./start.sh --none   # start services but suppress log output
5. Start the frontend

If you are not using Docker, navigate to the frontend directory:

bash
cd user/blink
npm install        # only first time
npm run dev        # starts Vite dev server on port 5173 (or 5174)
The frontend will proxy WebSocket connections to localhost ports 9000 and 9001.

6. Using Docker Compose

For a containerised setup, ensure Docker and Docker Compose are installed. From the project root, run:

bash
docker-compose up --build
This builds and starts all services (PostgreSQL, datafeed, broker, executor, engine, frontend). The frontend will be available at http://localhost.

Using the Platform

Once all services are running, open the frontend in your browser.

Home Page

Shows system status (datafeed connection indicator), navigation to other sections, and animated statistics.

Trade Page

The left area displays the Order Book, Price Chart (TradingView widget), and Positions / Live Orders tables.
The right panel contains the Market Data Widget (symbol quotes) and the Control Panel.
Use the exchange dropdown in the top navbar to switch between Binance, Jupiter, and Birdeye. This sends a switch_exchange message to the broker.
Manual Mode: choose order type, enter price and quantity, click Buy/Sell. Orders are sent to the Executor via WebSocket.
Algorithmic Mode: select a saved strategy and click "Deploy Algo". The Executor registers the strategy, and the Engine starts listening to its signals.
Research Page

This is the integrated development environment.

Explorer: manage files. You can create new Python, C++, or Jupyter notebook files.
Editor: Monaco editor with syntax highlighting. Active file content is displayed.
Terminal: shows output from code execution and validation.
AI Assistant: switch to the AI file to use the strategy copilot (requires a Gemini API key in .env: VITE_GEMINI_API_KEY=...).
Save & Run: Validate and save strategies. The platform checks the code structure (e.g., on_tick method for Python, onTick for C++). After confirmation, it writes the file to engine/algos/, making it available for backtesting and live trading.
Simulate Page

Select a dataset (pre-loaded or uploaded CSV).
Choose a strategy from the saved list.
Click Start Backtest.
The engine replays historical ticks, executes the strategy, and displays results in an overlay: Total Return, P&L, Max Drawdown, Sharpe Ratio, Win Rate, etc. You can download results as CSV.
Docs Page

Contains detailed developer documentation on the system architecture, API references, and risk management.

Profile Page

Displays mock account statistics, settings, and integration options.

Writing Strategies

Python Strategy Template

Python strategies must define a class with an on_tick(self, symbol, price, bid, ask, timestamp) method. You can call self.buy(symbol, price, quantity) and self.sell(...) to generate trading signals. Example:

python
import blink
import sys

class SimpleScalper(blink.Algo):
    def __init__(self, threshold=0.0001):
        super().__init__()
        self.threshold = threshold
        self.last_price = 0
        print("[Scalper] Initialized")

    def on_tick(self, symbol, price, bid, ask, timestamp):
        if self.last_price > 0:
            change = price - self.last_price
            if change < -self.threshold:
                self.buy(symbol, price, 1)
            elif change > self.threshold:
                self.sell(symbol, price, 1)
        self.last_price = price
Save the file in the editor. It will be placed in engine/algos/ and automatically loaded by the AlgoManager.

C++ Strategy Template

C++ strategies derive from the Algo base class and implement void onTick(const MarketData& data). Use buy(symbol, price, quantity) and sell(...). Example:

cpp
#include "algo.h"
#include <iostream>

class PriceThresholdAlgo : public Algo {
public:
    void onTick(const MarketData& data) override {
        if (data.price < 50000.0) {
            std::cout << "Buying " << data.symbol << std::endl;
            buy(data.symbol, data.price, 1);
        } else if (data.price > 51000.0) {
            std::cout << "Selling " << data.symbol << std::endl;
            sell(data.symbol, data.price, 1);
        }
    }
};
C++ strategies must be compiled into the engine (or loaded via dynamic library, though currently they are part of the engine binary). The provided editor validates compilation before saving.

Jupyter Notebooks

Notebooks (ipynb) are supported for research. They support Python code cells and Markdown. When you run a cell, the Research Executor executes it and returns any output, including Matplotlib plots.

Backtesting Architecture

The backtest workflow is as follows:

The frontend sends a JSON command with mode: "_Backtest", the chosen strategy ID, dataset filename, and initial capital to the engine via WebSocket.
The engine switches to backtest mode and instructs the datafeed to listen for backtest topics.
The database adapter (Dadapter) starts streaming historical ticks from the market_data table, prefixed with backtest_.
The engine routes those ticks to the selected strategy. Instead of sending orders to the live executor, it records them internally and calculates P&L, drawdowns, etc.
Once the data stream ends (or a backtest_complete message is received), the engine generates a performance report and sends it back to the frontend.
The frontend displays the results in a modal.
Configuration Reference

Exchange Adapters

The broker (broker/main.cpp) accepts an exchange argument (e.g., BINANCE, JUPITER, BIRDEYE) or reads the EXCHANGE environment variable. The frontend's trade page can also switch dynamically.

Risk Manager Limits

Currently, the Risk Manager (engine/src/riskManager.cpp) only checks for positive quantity. Additional risk parameters (max order size, daily loss limit, etc.) can be added in the validateAndSend function. The codebase is ready for such extensions.

WebSocket Topics

The datafeed server supports subscription to:

Live ticks: price_, bid_, ask_, ticker_
Backtest ticks: backtest_price_, backtest_bid_, backtest_ask_
Control: backtest_complete
Clients (engine, frontend) send { "subscribe": ["topic1", ...] } to start receiving data.

Environment Variables Summary

Variable	Used by	Description
BINANCE_API_KEY	Executor	Binance API key
BINANCE_API_SECRET	Executor	Binance secret key
BINANCE_TESTNET	Executor	Use testnet (true/false)
JUPITER_API_KEY	Broker (Exchange2)	Jupiter API key (optional)
BIRDEYE_API_KEY	Broker (Exchange3)	Birdeye API key
DEFAULT_EXCHANGE	Executor	Exchange to connect (binance)
RESEARCH_BACKEND_PORT	Research Executor	Port for research API (5001)
VITE_GEMINI_API_KEY	Frontend	Google Gemini API key for AI assistant
VITE_BACKEND_URL	Frontend	Override WebSocket backend URL (default wss://blink-backend.onrender.com in prod)
Troubleshooting

Datafeed not connecting: Ensure the datafeed server is running on port 9000. Check that no other process is using that port. The engine and frontend both connect to it.
Executor connection failed: Make sure the executor binary is running on port 9001. The Risk Manager and the frontend trade panel require it.
No market data: Verify that the broker is running and has correct exchange credentials (if needed). Without API keys, the broker may still function using public endpoints for some exchanges.
Backtest not starting: Check that the database is accessible and the market_data table exists. The adapter logs connection errors. If the table is empty, the backtest will complete immediately with no trades.
Python strategy not loading: Ensure the file is saved in engine/algos/ and has no syntax errors. The AlgoManager scans that directory every 100 ticks. Check engine logs for Python import errors.
Frontend build errors: Run npm install in user/blink to ensure all dependencies are installed. The Vite config expects environment variables from a .env file in the project root.
For more details, inspect the logs in the logs/ directory (when using start.sh) or the stdout of each service.

License

BLINK is released under the MIT License. See the LICENSE file for the full text.