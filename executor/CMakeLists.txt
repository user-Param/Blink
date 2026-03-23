cmake_minimum_required(VERSION 3.10)
project(executor)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find dependencies
find_package(Boost REQUIRED COMPONENTS thread)
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)

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
    ${Boost_LIBRARIES}
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
)