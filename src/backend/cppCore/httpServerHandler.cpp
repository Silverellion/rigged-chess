#include "HttpServerHandler.h"
#include "stockfishHandler.h"
#include "LlamaHandler.h"
#include "external/json.hpp"
#include <iostream>

using json = nlohmann::json;

HttpServerHandler::HttpServerHandler(
    const std::string& stockfishPath,
    const std::string& llamaPath,
    const std::string& modelPath)
    : stockfishPath_(stockfishPath),
    llamaPath_(llamaPath),
    modelPath_(modelPath),
    depth_(12),
    modelInitialized_(false) {

    std::cout << "Starting llama.cpp initialization..." << std::endl;
    modelInitialized_ = LlamaHandler::initLlama(llamaPath_, modelPath_);

    if (modelInitialized_) {
        std::cout << "Successfully initialized llama.cpp with model: " << modelPath_ << std::endl;
    }
    else {
        std::cerr << "Failed to initialize llama.cpp. Chat functionality may not work." << std::endl;
    }

    chessValidator_ = ChessValidator();
    fen_ = chessValidator_.getBoardAsFen();
}

void HttpServerHandler::add_cors_headers(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
}

void HttpServerHandler::handle_stockfish_post(const httplib::Request& req, httplib::Response& res) {
    add_cors_headers(res);
    std::lock_guard<std::mutex> lock(mutex_);
    try {
        auto j = json::parse(req.body);
        fen_ = j.at("fen").get<std::string>();
        depth_ = j.value("depth", 16);

        std::string bestmove;
        if (StockfishApiHandler::getBestMoveFromStockfish(stockfishPath_, fen_, depth_, bestmove)) {
            bestmove_ = bestmove;
            res.set_content("{\"status\":\"ok\"}", "application/json");
        }
        else {
            res.status = 500;
            res.set_content("{\"error\":\"Stockfish failed\"}", "application/json");
        }
    }
    catch (...) {
        res.status = 400;
        res.set_content("{\"error\":\"Bad request\"}", "application/json");
    }
}

void HttpServerHandler::handle_stockfish_get(const httplib::Request&, httplib::Response& res) {
    add_cors_headers(res);
    std::lock_guard<std::mutex> lock(mutex_);
    json j;

    std::string bestmove;
    if (StockfishApiHandler::getBestMoveFromStockfish(stockfishPath_, fen_, depth_, bestmove)) {
        bestmove_ = bestmove;
        j["bestmove"] = bestmove_;
        res.set_content(j.dump(), "application/json");
    }
    else {
        res.status = 500;
        res.set_content("{\"error\":\"Stockfish failed\"}", "application/json");
    }
}

void HttpServerHandler::handle_validate_move(const httplib::Request& req, httplib::Response& res) {
    add_cors_headers(res);
    std::lock_guard<std::mutex> lock(mutex_);

    try {
        auto j = json::parse(req.body);

        int fromX = j.at("fromX").get<int>();
        int fromY = j.at("fromY").get<int>();
        int toX = j.at("toX").get<int>();
        int toY = j.at("toY").get<int>();

        std::string promotionPiece = j.value("promotionPiece", "");

        Coords from{ fromX, fromY };
        Coords to{ toX, toY };

        auto legalMoves = chessValidator_.getLegalMoves(from);
        bool isValid = chessValidator_.validateMove(from, to, promotionPiece);

        json response;
        response["valid"] = isValid;

        json legalMovesJson = json::array();
        for (const auto& move : legalMoves) {
            legalMovesJson.push_back({
                {"x", move.x},
                {"y", move.y}
                });
        }
        response["legalMoves"] = legalMovesJson;

        if (isValid) {
            // If valid and no promotion is pending, make the move
            if (!chessValidator_.isPromotionPending() || !promotionPiece.empty()) {
                chessValidator_.makeMove(from, to, promotionPiece);

                // Update FEN for Stockfish
                fen_ = chessValidator_.getBoardAsFen();

                // Get Stockfish's response if requested
                if (j.value("getStockfishMove", false)) {
                    std::string bestmove;
                    if (StockfishApiHandler::getBestMoveFromStockfish(stockfishPath_, fen_, depth_, bestmove)) {
                        bestmove_ = bestmove;
                        response["stockfishMove"] = bestmove_;
                    }
                }
            }

            response["promotionPending"] = chessValidator_.isPromotionPending();
            response["boardFen"] = chessValidator_.getBoardAsFen();
            response["turn"] = (chessValidator_.getCurrentTurn() == Color::White) ? "white" : "black";
        }

        res.set_content(response.dump(), "application/json");
    }
    catch (const std::exception& e) {
        res.status = 400;
        json error;
        error["error"] = std::string("Bad request: ") + e.what();
        res.set_content(error.dump(), "application/json");
    }
}

void HttpServerHandler::handle_board_state(const httplib::Request&, httplib::Response& res) {
    add_cors_headers(res);
    std::lock_guard<std::mutex> lock(mutex_);

    json response;
    response["fen"] = chessValidator_.getBoardAsFen();
    response["turn"] = (chessValidator_.getCurrentTurn() == Color::White) ? "white" : "black";
    response["promotionPending"] = chessValidator_.isPromotionPending();

    res.set_content(response.dump(), "application/json");
}

void HttpServerHandler::handle_legal_moves(const httplib::Request& req, httplib::Response& res) {
    add_cors_headers(res);
    std::lock_guard<std::mutex> lock(mutex_);

    try {
        int x = -1, y = -1;
        if (req.has_param("x") && req.has_param("y")) {
            x = std::stoi(req.get_param_value("x"));
            y = std::stoi(req.get_param_value("y"));
        }
        else {
            throw std::runtime_error("Missing x or y coordinates");
        }

        auto legalMoves = chessValidator_.getLegalMoves({ x, y });

        json response;
        json movesArray = json::array();

        for (const auto& move : legalMoves) {
            movesArray.push_back({
                {"x", move.x},
                {"y", move.y}
                });
        }

        response["moves"] = movesArray;
        response["count"] = legalMoves.size();

        res.set_content(response.dump(), "application/json");
    }
    catch (const std::exception& e) {
        res.status = 400;
        json error;
        error["error"] = std::string("Bad request: ") + e.what();
        res.set_content(error.dump(), "application/json");
    }
}

void HttpServerHandler::handle_chat_post(const httplib::Request& req, httplib::Response& res) {
    add_cors_headers(res);

    if (!modelInitialized_) {
        res.status = 503;  // Service Unavailable
        res.set_content("{\"error\":\"Model not initialized yet. Please try again later.\"}", "application/json");
        return;
    }

    try {
        auto j = json::parse(req.body);

        if (!j.contains("prompt")) {
            res.status = 400;
            res.set_content("{\"error\":\"Missing 'prompt' field\"}", "application/json");
            return;
        }

        std::string prompt = j.at("prompt").get<std::string>();
        std::string response;

        if (LlamaHandler::generateResponse(prompt, response)) {
            json responseJson;
            responseJson["response"] = response;
            res.set_content(responseJson.dump(), "application/json");
        }
        else {
            res.status = 500;
            res.set_content("{\"error\":\"Failed to generate response\"}", "application/json");
        }
    }
    catch (const std::exception& e) {
        res.status = 400;
        res.set_content("{\"error\":\"" + std::string(e.what()) + "\"}", "application/json");
    }
}

void HttpServerHandler::handle_model_status(const httplib::Request&, httplib::Response& res) {
    add_cors_headers(res);

    json statusJson;
    statusJson["initialized"] = modelInitialized_;
    statusJson["model"] = modelPath_;

    res.set_content(statusJson.dump(), "application/json");
}

void HttpServerHandler::handle_options(const httplib::Request&, httplib::Response& res) {
    add_cors_headers(res);
    res.status = 204;
}

void HttpServerHandler::start(const std::string& address, int port) {
    httplib::Server svr;

    svr.Options("/", handle_options);
    svr.Options("/chat", handle_options);
    svr.Options("/model-status", handle_options);
    svr.Options("/validate-move", handle_options);
    svr.Options("/board", handle_options);
    svr.Options("/legal-moves", handle_options);

    // Stockfish endpoints
    svr.Post("/", [this](const httplib::Request& req, httplib::Response& res) {
        handle_stockfish_post(req, res);
        });
    svr.Get("/", [this](const httplib::Request& req, httplib::Response& res) {
        handle_stockfish_get(req, res);
        });

    // Chat endpoint
    svr.Post("/chat", [this](const httplib::Request& req, httplib::Response& res) {
        handle_chat_post(req, res);
        });

    // Model status endpoint
    svr.Get("/model-status", [this](const httplib::Request& req, httplib::Response& res) {
        handle_model_status(req, res);
        });

    // Chess validation endpoints
    svr.Post("/validate-move", [this](const httplib::Request& req, httplib::Response& res) {
        handle_validate_move(req, res);
        });
    svr.Get("/board", [this](const httplib::Request& req, httplib::Response& res) {
        handle_board_state(req, res);
        });
    svr.Get("/legal-moves", [this](const httplib::Request& req, httplib::Response& res) {
        handle_legal_moves(req, res);
        });

    std::cout << "Cpp backend HTTP server running on http://" << address << ":" << port << std::endl;
    svr.listen(address.c_str(), port);
}