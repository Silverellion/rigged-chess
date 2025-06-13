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

    std::cout << "Cpp backend HTTP server running on http://" << address << ":" << port << std::endl;
    svr.listen(address.c_str(), port);
}