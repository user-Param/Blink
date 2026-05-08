cmake_minimum_required(VERSION 3.10)
project(engine)

set(CMAKE_CXX_STANDARD 17)
cmake_policy(SET CMP0167 OLD)

list(APPEND CMAKE_PREFIX_PATH /opt/homebrew)
# Add pybind11 installed via pip to the prefix path
list(APPEND CMAKE_PREFIX_PATH "/Users/param/Documents/BLINK/.venv/lib/python3.14/site-packages/pybind11/share/cmake/pybind11")

find_package(Boost 1.90.0 REQUIRED COMPONENTS thread)
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)
find_package(nlohmann_json REQUIRED)
find_package(Python3 REQUIRED COMPONENTS Interpreter Development)
find_package(pybind11 REQUIRED)

include_directories(include)


add_executable(engine 
    src/main.cpp
    src/engine.cpp
    src/algo.cpp
    src/algoManager.cpp
    src/riskManager.cpp
    src/python_bindings.cpp
    )

target_link_libraries(engine
    PRIVATE
    ${Boost_LIBRARIES}
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
    Python3::Python
    pybind11::embed
)

target_include_directories(engine PRIVATE 
    ${Boost_INCLUDE_DIRS}
    ${CMAKE_CURRENT_SOURCE_DIR}
    )
