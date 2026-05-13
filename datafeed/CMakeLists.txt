cmake_minimum_required(VERSION 3.10)
project(datafeed)

set(CMAKE_CXX_STANDARD 17)
if(POLICY CMP0167)
    cmake_policy(SET CMP0167 NEW)
endif()

list(APPEND CMAKE_PREFIX_PATH "/opt/homebrew")

# Find packages
find_package(Boost 1.74 REQUIRED COMPONENTS
    thread
    chrono
    date_time
    atomic
)
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)
find_package(nlohmann_json REQUIRED)

# Find libpqxx
find_library(PQXX_LIB pqxx PATHS /opt/homebrew/lib /usr/local/lib /usr/lib)
find_path(PQXX_INCLUDE_DIR pqxx/pqxx PATHS /opt/homebrew/include /usr/local/include /usr/include)

# Find libpq (required by libpqxx)
find_library(PQ_LIB pq PATHS /opt/homebrew/opt/libpq/lib /opt/homebrew/lib /usr/local/lib /usr/lib)
find_path(PQ_INCLUDE_DIR libpq-fe.h PATHS /opt/homebrew/opt/libpq/include /opt/homebrew/include /usr/local/include /usr/include)

# Error if not found
if(NOT PQXX_LIB)
    message(FATAL_ERROR "libpqxx not found. Please install it: brew install libpqxx")
endif()
if(NOT PQXX_INCLUDE_DIR)
    message(FATAL_ERROR "libpqxx headers not found. Please install it: brew install libpqxx")
endif()
if(NOT PQ_LIB)
    message(FATAL_ERROR "libpq not found. Please install it: brew install libpq")
endif()

include_directories(/opt/homebrew/include)

include_directories(
    /opt/homebrew/include
    ${CMAKE_SOURCE_DIR}/../broker/include
)

add_executable(datafeed 
    server/server.h
    server/server.cpp
    session/session_manager.cpp
    live_source/live_source.cpp
    backtest_source/backtest_source.cpp

    ../broker/src/adapter/eadapter.cpp
    ../broker/src/exchange/exchange1.cpp
    ../broker/src/exchange/exchange2.cpp
    ../broker/src/exchange/exchange3.cpp
    )

add_executable(dadapter
    ../database/Dadapter.cpp
)

target_link_libraries(datafeed 
    PRIVATE
    ${Boost_LIBRARIES}
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
)

target_link_libraries(dadapter 
    PRIVATE
    ${Boost_LIBRARIES}
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
    ${PQXX_LIB}
    ${PQ_LIB}
)

target_include_directories(datafeed PRIVATE 
    ${Boost_INCLUDE_DIRS}
    ${CMAKE_CURRENT_SOURCE_DIR}
    nlohmann_json::nlohmann_json
    )

target_include_directories(dadapter PRIVATE 
    ${Boost_INCLUDE_DIRS}
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${PQXX_INCLUDE_DIR}
    ${PQ_INCLUDE_DIR}
    )
