#include "processLauncher.h"
#include "stockfishApiHandler.h"
#include <iostream>

int main() {
    ProcessLauncher::LaunchEngines();

    std::string getUrl = "http://localhost:1337"; 
    std::string postUrl = "http://localhost:1337"; 
    std::string stockfishPath = "C:\\stockfish\\stockfish-windows-x86-64-avx2.exe";

    StockfishApiHandler handler(getUrl, postUrl, stockfishPath);
    handler.Run();

    return 0;
}