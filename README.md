# BLINK: High-Performance Algorithmic Trading Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![C++](https://img.shields.io/badge/C++-20-blue.svg)](https://isocpp.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)

**BLINK** is a sophisticated, distributed algorithmic trading platform engineered for low-latency execution, comprehensive backtesting, and real-time market data visualization. It combines a high-performance C++ backend with a modern React-based "Blink Terminal" to provide a seamless end-to-end experience for quantitative traders and developers.

---

## 🏗 Technical Architecture

BLINK follows a microservices-inspired distributed architecture, utilizing high-speed WebSocket communication and a robust C++ core.

### System Components

1.  **Datafeed Server (`/datafeed`)**: 
    - The central nervous system of the platform.
    - Built with **Boost.Asio** and **Boost.Beast** for asynchronous WebSocket/HTTP handling.
    - Manages real-time data ingestion from live sources and historical data streaming from the database.
    - Supports multi-threaded session management and topic-based subscription (Price, Bid, Ask).

2.  **Trading Engine (`/engine`)**:
    - The core execution environment for algorithms.
    - Implements a low-latency event loop that processes market ticks via a virtualized `Algo` interface.
    - Includes a **Risk Manager** to validate orders against predefined constraints before execution.
    - Features an **Algo Manager** that dynamically loads and orchestrates multiple trading strategies.

3.  **Database Adapter (`/database/Dadapter`)**:
    - A dedicated bridge between the **PostgreSQL** time-series database and the Datafeed.
    - Handles high-throughput streaming of historical market data during backtesting/simulation modes.
    - Manages persistence for user profiles, strategies, and trade history using `libpqxx`.

4.  **Order Executor (`/executor`)**:
    - Handles the final stage of order placement.
    - Abstracted exchange interface allows for easy integration with multiple liquidity providers/exchanges.

5.  **Blink Terminal (`/user/blink`)**:
    - A high-fidelity React (Vite/TypeScript) dashboard.
    - **Live Editor**: A Monaco-powered IDE supporting C++, Python, and even Interactive Notebooks (`.ipynb`).
    - **Real-time Visualization**: Dynamic SVG/Canvas-based charts and order books powered by WebSocket streams.
    - **Simulation Control**: Toggle between Live, Backtest, and Research modes directly from the UI.

---

## 🚀 Key Features

- **Hybrid Execution Modes**: Seamlessly switch between `_Live` (real-time exchange data) and `_Backtest` (historical database streaming).
- **Embedded Strategy IDE**: Develop, compile, and deploy strategies directly within the browser using a VS-Code-like experience.
- **Risk Management Layer**: Integrated `RiskManager` to prevent fat-finger errors and ensure capital preservation.
- **Low-Latency C++ Core**: Leveraging modern C++20 features and Boost libraries for maximum performance.
- **Notebook Support**: Native support for Jupyter-style notebooks in the strategy research phase.

---

## 🛠 Tech Stack

- **Backend**: C++20, Boost.Asio, Boost.Beast, nlohmann/json, libpqxx.
- **Frontend**: React 18, TypeScript, TailwindCSS, Monaco Editor, Lucide Icons, Vite.
- **Database**: PostgreSQL (Time-series optimized).
- **Communication**: WebSockets (JSON Protocol).

---

## 📖 Getting Started

### Prerequisites

- **Compiler**: GCC 11+ or Clang 14+ (C++20 support required).
- **Libraries**: `boost`, `nlohmann-json`, `libpqxx`, `postgresql`.
- **Node.js**: v18+ and `npm`.

### Installation & Build

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-repo/blink.git
    cd blink
    ```

2.  **Initialize Database**:
    Ensure PostgreSQL is running and execute:
    ```bash
    psql -U postgres -f database/init.sql
    ```

3.  **Automatic Launch**:
    The provided `start.sh` script automates the build and deployment process for all services:
    ```bash
    chmod +x start.sh
    ./start.sh
    ```
    This script will:
    - Build and start the **Datafeed Server** on port `9000`.
    - Build and start the **Dadapter**.
    - Build and start the **Trading Engine**.
    - Install dependencies and start the **React Terminal** in dev mode.

---

## 📡 WebSocket Protocol

The platform uses a standardized JSON protocol for inter-service communication.

### Subscription
```json
{
  "subscribe": ["price_", "bid_", "ask_"]
}
```

### Mode Switching
- **Live**: `_Live`
- **Backtest**: `_Backtest`

### Market Data Format
```json
{
  "symbol": "BTC/USD",
  "price": 65432.10,
  "bid": 65431.50,
  "ask": 65432.50,
  "timestamp": 1672531200000
}
```

---

## 🛡 Security & Risk

The platform includes a strict `RiskManager` that evaluates:
- **Maximum Order Size**
- **Daily Loss Limits**
- **Symbol Whitelisting**
- **Frequency/Rate Limiting**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ for High-Frequency Quantitative Trading.*
