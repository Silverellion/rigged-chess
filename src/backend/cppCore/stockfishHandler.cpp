#include "stockfishHandler.h"
#include "StockfishProcess.h"
#include <memory>
#include <mutex>
#include <sstream>
#include <iostream>

static std::unique_ptr<StockfishProcess> g_stockfish;
static std::once_flag g_stockfish_once;

void ensureStockfish(const std::string& stockfishPath) {
    std::call_once(g_stockfish_once, [&]() {
        g_stockfish = std::make_unique<StockfishProcess>(stockfishPath);
        });
}

bool StockfishApiHandler::getBestMoveFromStockfish(const std::string& stockfishPath, const std::string& fen, int depth, std::string& bestmove) {
    ensureStockfish(stockfishPath);

    // Prepare UCI commands
    std::ostringstream oss;
    oss << "position fen " << fen << "\n";
    oss << "go depth " << depth << "\n";

    std::string resultLine;
    if (!g_stockfish->sendCommand(oss.str())) return false;
    if (!g_stockfish->readUntil("bestmove", resultLine)) return false;

    std::istringstream iss(resultLine);
    std::string tag, move;
    iss >> tag >> move;
    bestmove = move;
    return true;
}