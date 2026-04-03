#ifndef EADAPTER_H
#define EADAPTER_H

#include <memory>
#include <string>
#include <vector>
#include <atomic>
#include <thread>
#include <functional>

class Exchange1;







class EAdapter {
public:
    EAdapter();
    ~EAdapter();

    void connect_to_exchange();     
    void subscribe_symbols();       
    void on_update();         
    void run();                     
    void stop();                    
    
    void set_symbols(const std::vector<std::string>& symbols);


    using ExternalCallback = std::function<void(
    const std::string&,
    double,
    double,
    double,
    long
    )>;
    
    void set_callback(ExternalCallback cb);

    


    
private:
    std::unique_ptr<Exchange1> exchange_;
    std::vector<std::string> symbols_;
    std::atomic<bool> running_{false};
    std::thread worker_thread_;
    ExternalCallback external_cb_;
};

#endif