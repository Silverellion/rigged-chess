#include "stockfishHandler.h"
#include <fstream>
#include <sstream>
#include <cstdio>

bool StockfishApiHandler::getBestMoveFromStockfish(const std::string& stockfishPath, const std::string& fen, int depth, std::string& bestmove) {
    // Write commands to a temporary file
    std::string tmpFile = "stockfish_input.txt";
    std::ofstream ofs(tmpFile);
    ofs << "position fen " << fen << "\n";
    ofs << "go depth " << depth << "\n";
    ofs.close();

    // Run Stockfish, redirecting input from the file
    std::string cmd = stockfishPath + " < " + tmpFile;
    FILE* pipe = _popen(cmd.c_str(), "r");
    if (!pipe) return false;

    char buffer[256];
    std::string output;
    while (fgets(buffer, sizeof(buffer), pipe)) {
        output += buffer;
        if (std::string(buffer).find("bestmove") != std::string::npos) {
            break;
        }
    }
    _pclose(pipe);

    std::istringstream iss(output);
    std::string line;
    while (std::getline(iss, line)) {
        if (line.find("bestmove") == 0) {
            std::istringstream lss(line);
            std::string tag, move;
            lss >> tag >> move;
            bestmove = move;
            return true;
        }
    }
    return false;
}