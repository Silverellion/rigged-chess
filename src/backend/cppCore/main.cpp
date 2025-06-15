#include "server.h"
#include "utility.h"

#include <iostream>
#include <string>

int main() {
    std::string stockfishPath = "C:\\RiggedChess\\stockfish\\stockfish-windows-x86-64-avx2.exe";
    std::string llamaPath = "C:\\Users\\Impasta\\Documents\\Mein Scheisse\\Mein Works\\Personal Project\\rigged-chess\\src\\backend\\cppCore\\llamaCpp\\llama-cli.exe";
    std::string modelPath = "C:\\RiggedChess\\models\\google_gemma-3-4b-it-Q4_K_M.gguf";

    int port = Utility::read_port_from_env(".env");

    Server server(stockfishPath, llamaPath, modelPath);
    server.start("0.0.0.0", port);

    return 0;
}