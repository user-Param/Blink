
echo "Building and starting BLINK Datafeed + Dadapter..."

cd datafeed/build
cmake ..
make -j4
if [ $? -ne 0 ]; then
    echo "❌ Datafeed build failed"
    exit 1
fi

./datafeed 0.0.0.0 9000 4 &
DATAFEED_PID=$!
echo "Datafeed server started (PID: $DATAFEED_PID)"


cd ../../database
g++ -std=c++17 -I/opt/homebrew/include -L/opt/homebrew/lib Dadapter.cpp -o adapter 
if [ $? -ne 0 ]; then
    echo "Dadapter build failed"
    kill $DATAFEED_PID
    exit 1
fi

./adapter &
ADAPTER_PID=$!
echo "Dadapter started (PID: $ADAPTER_PID)"


echo "Starting blink engine...."

cd engine/build
cmake ..
make 
./engine 0.0.0.0 9000 4

echo "All services are running. Press Ctrl+C to stop."


trap "echo 'Stopping...'; kill $DATAFEED_PID $ADAPTER_PID; exit" INT
wait