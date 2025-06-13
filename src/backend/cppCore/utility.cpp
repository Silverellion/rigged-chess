#include "utility.h"

#include <fstream>
#include <map>

int Utility::read_port_from_env(const std::string& filename) {
    std::ifstream file(filename);
    std::string line;
    while (std::getline(file, line)) {
        if (line.find("PORT=") == 0) {
            return std::stoi(line.substr(5));
        }
    }
    return 1337; // default
}