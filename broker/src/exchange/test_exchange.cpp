// #include "exchange/exchange1.h"
// #include <iostream>
// int main() {
//     Exchange1 exchange;

//     exchange.connect();

//     exchange.set_callback([](auto symbol, auto price, auto bid, auto ask, auto ts) {
//         std::cout << symbol << " | " << price << std::endl;
//     });

//     exchange.subscribe({"BTCUSDT"});

//     while (true); // keep alive
// }