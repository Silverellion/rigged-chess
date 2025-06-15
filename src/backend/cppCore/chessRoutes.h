#pragma once

#include <string>
#include <mutex>
#include "external/httplib.h"
#include "ChessValidator.h"

class ChessRoutes {
public:
    ChessRoutes(const std::string& stockfishPath);

    void registerRoutes(httplib::Server& svr);
    void handle_validate_move(const httplib::Request& req, httplib::Response& res);
    void handle_board_state(const httplib::Request& req, httplib::Response& res);
    void handle_legal_moves(const httplib::Request& req, httplib::Response& res);
    void handle_stockfish_post(const httplib::Request& req, httplib::Response& res);
    void handle_stockfish_get(const httplib::Request& req, httplib::Response& res);

private:
    std::string stockfishPath_;
    std::string fen_;
    int depth_;
    std::string bestmove_;
    std::mutex mutex_;
    ChessValidator chessValidator_;

    static void add_cors_headers(httplib::Response& res);
};