#pragma once

#include <string>
#include "external/httplib.h"
#include "ChessRoutes.h"
#include "LlamaRoutes.h"

class Server {
public:
    Server(const std::string& stockfishPath, const std::string& llamaPath, const std::string& modelPath);
    void start(const std::string& address, int port);

private:
    ChessRoutes chessRoutes_;
    LlamaRoutes llamaRoutes_;
};