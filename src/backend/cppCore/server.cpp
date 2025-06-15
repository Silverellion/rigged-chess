#include "server.h"
#include <iostream>

Server::Server(const std::string& stockfishPath, const std::string& llamaPath, const std::string& modelPath)
    : chessRoutes_(stockfishPath),
    llamaRoutes_(llamaPath, modelPath) {
}

void Server::start(const std::string& address, int port) {
    httplib::Server svr;

    chessRoutes_.registerRoutes(svr);
    llamaRoutes_.registerRoutes(svr);

    std::cout << "Cpp backend HTTP server running on http://" << address << ":" << port << std::endl;
    svr.listen(address.c_str(), port);
}