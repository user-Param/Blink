#ifndef CONFIG_H
#define CONFIG_H

#include <string>
#include <map>
#include <iostream>
#include <fstream>
#include <sstream>

class Config {
public:
    static Config& getInstance() {
        static Config instance;
        return instance;
    }

    void load(const std::string& env_file = ".env") {
        std::ifstream file(env_file);
        if (!file.is_open()) {
            std::cerr << "[Config] Warning: Could not open " << env_file << std::endl;
            return;
        }

        std::string line;
        while (std::getline(file, line)) {
            if (line.empty() || line[0] == '#') continue;
            size_t delimiter_pos = line.find('=');
            if (delimiter_pos == std::string::npos) continue;

            std::string key = line.substr(0, delimiter_pos);
            std::string value = line.substr(delimiter_pos + 1);
            key = trim(key);
            value = trim(value);
            config_map_[key] = value;
        }
        file.close();
        std::cout << "[Config] Loaded configuration from " << env_file << std::endl;
    }

    std::string get(const std::string& key, const std::string& default_value = "") const {
        auto it = config_map_.find(key);
        return (it != config_map_.end()) ? it->second : default_value;
    }

    int getInt(const std::string& key, int default_value = 0) const {
        try { return std::stoi(get(key, "")); } catch (...) { return default_value; }
    }

    double getDouble(const std::string& key, double default_value = 0.0) const {
        try { return std::stod(get(key, "")); } catch (...) { return default_value; }
    }

    bool getBool(const std::string& key, bool default_value = false) const {
        std::string value = get(key, "");
        return value == "true" || value == "1" || value == "yes";
    }

private:
    Config() = default;
    std::map<std::string, std::string> config_map_;

    static std::string trim(const std::string& str) {
        size_t first = str.find_first_not_of(" \t\r\n");
        if (first == std::string::npos) return "";
        size_t last = str.find_last_not_of(" \t\r\n");
        return str.substr(first, (last - first + 1));
    }
};

#endif
