#pragma once

#include <string>

/**
 * @brief Provides an interface to communicate with the Stockfish chess engine.
 *
 * This class exposes static methods to send FEN positions to Stockfish,
 * request analysis, and retrieve the best move.
 */
class StockfishApiHandler {
public:
    /**
     * @brief Gets the best move from Stockfish for a given FEN and depth.
     * @param stockfishPath Path to the Stockfish executable.
     * @param fen The FEN string representing the board position.
     * @param depth The search depth for Stockfish.
     * @param bestmove Output parameter for the best move in UCI format.
     * @return True if successful, false otherwise.
     */
    static bool getBestMoveFromStockfish(const std::string& stockfishPath, const std::string& fen, int depth, std::string& bestmove);
};