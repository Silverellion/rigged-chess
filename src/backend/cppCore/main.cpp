#include "processLauncher.h"
#include "HttpServerHandler.h"
#include <iostream>
#include <string>

int main() {
    ProcessLauncher::LaunchEngines();

    std::string stockfishPath = "C:\\stockfish\\stockfish-windows-x86-64-avx2.exe";
    HttpServerHandler server(stockfishPath);
    server.start("0.0.0.0", 1337);

    return 0;
}