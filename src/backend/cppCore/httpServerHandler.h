#pragma once

#include <string>
#include <mutex>
#include "external/httplib.h"

/**
 * @brief Handles the HTTP server, CORS, and API endpoints for the chess backend.
 * This class sets up an HTTP server using cpp-httplib, manages CORS headers,
 * and provides GET/POST endpoints for FEN and best move communication.
 */
class HttpServerHandler {
public:
    /**
     * @brief Constructs the HTTP server handler.
     * @param stockfishPath Path to the Stockfish executable.
     */
    HttpServerHandler(const std::string& stockfishPath);

    /**
     * @brief Starts the HTTP server on the given address and port.
     * @param address The address to bind (e.g., "0.0.0.0").
     * @param port The port to listen on (e.g., 1337).
     */
    void start(const std::string& address, int port);

private:
    std::string stockfishPath_;
    std::string fen_;
    int depth_;
    std::string bestmove_;
    std::mutex mutex_;

    /**
     * @brief Adds CORS headers to the response.
     * @param res The HTTP response object.
     */
    static void add_cors_headers(httplib::Response& res);

    /**
     * @brief Handles POST requests to receive FEN and compute best move.
     */
    void handle_post(const httplib::Request& req, httplib::Response& res);

    /**
     * @brief Handles GET requests to return the best move.
     */
    void handle_get(const httplib::Request& req, httplib::Response& res);

    /**
     * @brief Handles OPTIONS requests for CORS preflight.
     */
    static void handle_options(const httplib::Request& req, httplib::Response& res);

    /**
     * @brief Computes the best move using Stockfish.
     */
    bool compute_bestmove(const std::string& fen, int depth, std::string& bestmove);
};