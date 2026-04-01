-- Initialize Blink Trading Platform Database

-- 1. Market Data Table (replacing bitcoin_final.csv)
CREATE TABLE IF NOT EXISTS market_data (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(18, 8) NOT NULL,
    bid DECIMAL(18, 8),
    ask DECIMAL(18, 8),
    volume DECIMAL(18, 8)
);

-- Create an index on timestamp for faster time-series queries
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data(timestamp);

-- 2. Strategies Table
CREATE TABLE IF NOT EXISTS strategies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    language VARCHAR(20) NOT NULL, -- 'cpp', 'python', 'ipynb'
    content TEXT NOT NULL,
    path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    total_balance DECIMAL(18, 2) DEFAULT 0.00,
    active_strategies_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Trade History (Non time-series market data)
CREATE TABLE IF NOT EXISTS trade_history (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(id),
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL, -- 'BUY' or 'SELL'
    amount DECIMAL(18, 8) NOT NULL,
    price DECIMAL(18, 8) NOT NULL,
    pnl DECIMAL(18, 2),
    status VARCHAR(20), -- 'WIN', 'LOSS', 'OPEN'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
