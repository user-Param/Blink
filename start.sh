#!/bin/bash

# Get project root directory
PROJECT_ROOT=$(pwd)

# Kill any existing processes on port 9000 to avoid conflicts
echo "Cleaning up old processes on port 9000..."
lsof -ti:9000 | xargs kill -9 2>/dev/null || true
sleep 1


echo "Building and starting BLINK Datafeed + Dadapter + Engine + Client"

cd "$PROJECT_ROOT/datafeed"
if [ ! -d "build" ]; then
    mkdir build
fi
cd build
cmake ..
make -j4
if [ $? -ne 0 ]; then
    echo "Datafeed build failed"
    exit 1
fi
./datafeed 0.0.0.0 9000 4 &
DATAFEED_PID=$!
echo "Datafeed server started (PID: $DATAFEED_PID)"

# Give datafeed server time to start up
sleep 2

echo "Starting Dadapter..."
./dadapter &
ADAPTER_PID=$!
echo "Dadapter started (PID: $ADAPTER_PID)"

echo "Starting blink engine...."
cd "$PROJECT_ROOT/engine"
if [ ! -d "build" ]; then
    mkdir build
fi
cd build
cmake ..
make -j4
if [ $? -ne 0 ]; then
    echo "Engine build failed"
    kill $DATAFEED_PID $ADAPTER_PID
    exit 1
fi
./engine 0.0.0.0 9000 4 &
ENGINE_PID=$!

echo "Starting React frontend..."
cd "$PROJECT_ROOT/user/blink"
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run dev &
REACT_PID=$!

echo "All services are running. Press Ctrl+C to stop."

trap "echo 'Stopping...'; kill $DATAFEED_PID $ADAPTER_PID $ENGINE_PID $REACT_PID 2>/dev/null; exit" INT
wait