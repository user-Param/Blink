FROM ubuntu:22.04 AS build
RUN apt-get update && apt-get install -y \
    build-essential cmake git libboost-all-dev python3 \
    libssl-dev nlohmann-json3-dev python3-dev pybind11-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .

# Build Broker
RUN cd broker && mkdir build && cd build && cmake .. && make

# Build Executor
RUN cd executor && mkdir build && cd build && cmake .. && make

# Build Engine
RUN cd engine && mkdir build && cd build && cmake .. && make