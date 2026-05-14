FROM ubuntu:22.04 AS build

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    build-essential cmake git libboost-all-dev libssl-dev \
    libcurl4-openssl-dev nlohmann-json3-dev python3-dev pybind11-dev \
    libpq-dev libpqxx-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Build all binaries
RUN cd broker && mkdir -p build && cd build && cmake .. && make
RUN cd executor && mkdir -p build && cd build && cmake .. && make
RUN cd engine && mkdir -p build && cd build && cmake .. && make
RUN cd datafeed && mkdir -p build && cd build && cmake .. && make

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies + postgres-client for migrations
RUN apt-get update && apt-get install -y \
    supervisor nginx postgresql-client \
    libboost-thread1.74.0 libboost-system1.74.0 libboost-filesystem1.74.0 \
    libssl3 libcurl4 libpq5 libpqxx-dev \
    libpython3.10 python3-pip \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install flask flask-cors

WORKDIR /app

# Copy binaries
COPY --from=build /app/broker/build/eadapter ./broker/eadapter
COPY --from=build /app/executor/build/executor ./executor/executor
COPY --from=build /app/engine/build/engine ./engine/engine
COPY --from=build /app/datafeed/build/datafeed ./datafeed/datafeed

# Copy database schema for migration
COPY database/init.sql ./database/init.sql

# Copy runtime scripts and assets
COPY engine/algos ./algos
COPY research_executor.py .
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Configs
COPY supervisord.conf /etc/supervisor/supervisord.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Production Environment Variables
ENV PYTHONPATH="/app:/app/engine:/app/algos"
ENV PYTHONUNBUFFERED=1
ENV PORT=80

EXPOSE 80

ENTRYPOINT ["/app/entrypoint.sh"]
