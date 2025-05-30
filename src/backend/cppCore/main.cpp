#include "processLauncher.h"
#include "HttpServerHandler.h"
#include "utilitites.h"

#include <iostream>
#include <string>

int main() {
    ProcessLauncher::LaunchEngines();

    std::string stockfishPath = "C:\\stockfish\\stockfish-windows-x86-64-avx2.exe";
    int port = Utilities::read_port_from_env();
    HttpServerHandler server(stockfishPath);
    server.start("0.0.0.0", port);

    return 0;
}