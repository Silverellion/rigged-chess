#pragma once

#include <string>
#include <thread>
#include <mutex>
#include <condition_variable>
#include "external/httplib.h"

/**
 * @brief Handles communication between a Stockfish engine and remote API endpoints.
 *
 * This class fetches a FEN and search depth from a GET API endpoint, runs Stockfish
 * to compute the best move, and posts the result to a POST API endpoint.
 */
class StockfishApiHandler {
public:
    /**
     * @brief Constructs the handler.
     * @param getUrl The base URL for the GET endpoint (e.g., "http://localhost:8080").
     * @param postUrl The base URL for the POST endpoint (e.g., "http://localhost:8080").
     * @param stockfishPath The path to the Stockfish executable.
     */
    StockfishApiHandler(const std::string& getUrl, const std::string& postUrl, const std::string& stockfishPath);

    /**
     * @brief Runs the full API-to-Stockfish-to-API workflow.
     *
     * - GETs FEN and depth from the API.
     * - Runs Stockfish to compute the best move.
     * - POSTs the best move back to the API.
     */
    void Run();

private:
    std::string getUrl_;
    std::string postUrl_;
    std::string stockfishPath_;

    /**
     * @brief Fetches FEN and depth from the GET API endpoint.
     * @param[out] fen The FEN string received.
     * @param[out] depth The search depth received.
     * @return true on success, false on failure.
     */
    bool GetFenAndDepth(std::string& fen, int& depth);

    /**
     * @brief Runs Stockfish with the given FEN and depth, and extracts the best move.
     * @param fen The FEN string.
     * @param depth The search depth.
     * @param[out] bestmove The best move string (e.g., "e2e4").
     * @return true on success, false on failure.
     */
    bool GetBestMoveFromStockfish(const std::string& fen, int depth, std::string& bestmove);

    /**
     * @brief Posts the best move to the POST API endpoint.
     * @param bestmove The best move string.
     * @return true on success, false on failure.
     */
    bool PostBestMove(const std::string& bestmove);

    /**
     * @brief Helper to launch and communicate with Stockfish CLI.
     * @param fen The FEN string.
     * @param depth The search depth.
     * @param[out] bestmove The best move string.
     * @return true on success, false on failure.
     */
    bool SendCommandsToStockfish(const std::string& fen, int depth, std::string& bestmove);
};