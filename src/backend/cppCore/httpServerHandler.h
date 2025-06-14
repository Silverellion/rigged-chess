#pragma once

#include <string>
#include <mutex>
#include "external/httplib.h"
#include "ChessValidator.h"

class HttpServerHandler {
public:
    HttpServerHandler(const std::string& stockfishPath, const std::string& llamaPath, const std::string& modelPath);
    void start(const std::string& address, int port);

private:
    std::string stockfishPath_;
    std::string llamaPath_;
    std::string modelPath_;
    std::string fen_;
    int depth_;
    std::string bestmove_;
    bool modelInitialized_;
    std::mutex mutex_;
    ChessValidator chessValidator_;

    static void add_cors_headers(httplib::Response& res);
    void handle_stockfish_post(const httplib::Request& req, httplib::Response& res);
    void handle_stockfish_get(const httplib::Request& req, httplib::Response& res);
    void handle_chat_post(const httplib::Request& req, httplib::Response& res);
    void handle_model_status(const httplib::Request& req, httplib::Response& res);
    void handle_validate_move(const httplib::Request& req, httplib::Response& res);
    void handle_board_state(const httplib::Request& req, httplib::Response& res);
    void handle_legal_moves(const httplib::Request& req, httplib::Response& res);
    static void handle_options(const httplib::Request& req, httplib::Response& res);
};