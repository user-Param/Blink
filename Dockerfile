FROM ubuntu:22.04 AS build

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential cmake git libboost-all-dev libssl-dev \
    libcurl4-openssl-dev nlohmann-json3-dev python3-dev pybind11-dev \
    libpq-dev libpqxx-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Build all components
RUN cd broker && mkdir -p build && cd build && cmake .. && make
RUN cd executor && mkdir -p build && cd build && cmake .. && make
RUN cd engine && mkdir -p build && cd build && cmake .. && make
RUN cd datafeed && mkdir -p build && cd build && cmake .. && make

# Runtime stage
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    supervisor nginx \
    libboost-thread1.74.0 libboost-system1.74.0 libboost-filesystem1.74.0 \
    libssl3 libcurl4 libpq5 libpqxx-dev \
    libpython3.10 python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies for research_executor
RUN pip3 install flask flask-cors

WORKDIR /app

# Create necessary directories
RUN mkdir -p broker executor engine datafeed algos logs

# Copy binaries from build stage
COPY --from=build /app/broker/build/eadapter ./broker/eadapter
COPY --from=build /app/executor/build/executor ./executor/executor
COPY --from=build /app/engine/build/engine ./engine/engine
COPY --from=build /app/datafeed/build/datafeed ./datafeed/datafeed

# Copy runtime assets
COPY engine/algos ./algos
COPY research_executor.py .

# Copy config files
COPY supervisord.conf /etc/supervisor/supervisord.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Set environment variables
ENV PYTHONPATH="/app:/app/engine:/app/algos"
ENV PYTHONUNBUFFERED=1

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
