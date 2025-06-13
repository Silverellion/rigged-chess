#include "processLauncher.h"
#include "HttpServerHandler.h"
#include "utility.h"

#include <iostream>
#include <string>

int main() {
    ProcessLauncher::LaunchEngines();

    std::string stockfishPath = "C:\\RiggedChess\\stockfish\\stockfish-windows-x86-64-avx2.exe";
    int port = Utility::read_port_from_env();
    HttpServerHandler server(stockfishPath);
    server.start("0.0.0.0", port);

    return 0;
}