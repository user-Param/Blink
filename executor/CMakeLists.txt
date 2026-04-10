cmake_minimum_required(VERSION 3.10)
project(executor)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
cmake_policy(SET CMP0167 OLD)

list(APPEND CMAKE_PREFIX_PATH "/opt/homebrew")

# Find dependencies
find_package(Boost REQUIRED COMPONENTS thread)
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)
find_package(CURL REQUIRED)
find_package(nlohmann_json REQUIRED)

# Include directories
include_directories(include)

# Create executable
add_executable(executor
    main.cpp
    src/adapter/oadapter.cpp
    src/exchange/exchange1.cpp
)

# Link libraries
target_link_libraries(executor
    PRIVATE
    ${Boost_LIBRARIES}
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
    CURL::libcurl
    nlohmann_json::nlohmann_json
)

# Include directories for targets
target_include_directories(executor PRIVATE
    ${Boost_INCLUDE_DIRS}
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${CURL_INCLUDE_DIRS}
)
