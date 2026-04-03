cmake_minimum_required(VERSION 3.10)
project(engine)

set(CMAKE_CXX_STANDARD 17)


list(APPEND CMAKE_PREFIX_PATH /opt/homebrew)


find_package(Boost 1.90.0 REQUIRED COMPONENTS thread)
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)
find_package(nlohmann_json REQUIRED)


include_directories(include)


add_executable(engine 
    src/main.cpp
    src/engine.cpp
    src/algoManager.cpp
    src/riskManager.cpp
    )

    










target_link_libraries(engine
    PRIVATE
    ${Boost_LIBRARIES}
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
)









target_include_directories(engine PRIVATE 
    ${Boost_INCLUDE_DIRS}
    ${CMAKE_CURRENT_SOURCE_DIR}
    )

