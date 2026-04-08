#!/bin/bash

# Get project root directory
PROJECT_ROOT=$(pwd)

# Kill any existing processes on port 9000 and 9001 to avoid conflicts
echo "Cleaning up old processes on port 9000 and 9001..."
lsof -ti:9000 | xargs kill -9 2>/dev/null || true
lsof -ti:9001 | xargs kill -9 2>/dev/null || true
sleep 1


echo "Building and starting BLINK Ecosystem"

# 1. Start Datafeed
cd "$PROJECT_ROOT/datafeed"
if [ ! -d "build" ]; then mkdir build; fi
cd build && cmake .. && make -j4
./datafeed 0.0.0.0 9000 4 &
DATAFEED_PID=$!
echo "Datafeed server started (PID: $DATAFEED_PID)"

# 2. Start Dadapter
./dadapter &
ADAPTER_PID=$!
echo "Dadapter started (PID: $ADAPTER_PID)"

# 3. Start Executor (New)
cd "$PROJECT_ROOT/executor"
if [ ! -d "build" ]; then mkdir build; fi
cd build && cmake .. && make -j4
./executor &
EXECUTOR_PID=$!
echo "Executor started (PID: $EXECUTOR_PID)"

sleep 2

# 4. Start Engine
echo "Starting blink engine...."
cd "$PROJECT_ROOT/engine"
if [ ! -d "build" ]; then mkdir build; fi
cd build && cmake .. && make -j4
./engine &
ENGINE_PID=$!

# 5. Start Frontend
echo "Starting React frontend..."
cd "$PROJECT_ROOT/user/blink"
npm run dev &
REACT_PID=$!

echo "All services are running. Press Ctrl+C to stop."

trap "echo 'Stopping...'; kill $DATAFEED_PID $ADAPTER_PID $EXECUTOR_PID $ENGINE_PID $REACT_PID 2>/dev/null; exit" INT
wait
