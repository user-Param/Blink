FROM ubuntu:22.04 AS build

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libboost-all-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Build Datafeed
RUN cd datafeed && mkdir build && cd build && cmake .. && make

# Build Broker
RUN cd broker && mkdir build && cd build && cmake .. && make

# Build Executor
RUN cd executor && mkdir build && cd build && cmake .. && make

# Build Engine
RUN cd engine && mkdir build && cd build && cmake .. && make

FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    supervisor \
    nginx \
    libboost-all-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binaries from build stage
COPY --from=build /app/datafeed/build/datafeed ./datafeed/datafeed
COPY --from=build /app/broker/build/broker ./broker/broker
COPY --from=build /app/executor/build/executor ./executor/executor
COPY --from=build /app/engine/build/engine ./engine/engine

# Copy configs
COPY supervisord.conf /etc/supervisor/supervisord.conf
COPY nginx.conf /etc/nginx/sites-available/default

# Expose Render port
EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
