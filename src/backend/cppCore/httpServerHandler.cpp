#include "HttpServerHandler.h"
#include "stockfishHandler.h"
#include "external/json.hpp"
#include <iostream>

using json = nlohmann::json;

HttpServerHandler::HttpServerHandler(const std::string& stockfishPath)
    : stockfishPath_(stockfishPath), depth_(12) {
}

void HttpServerHandler::add_cors_headers(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
}

void HttpServerHandler::handle_post(const httplib::Request& req, httplib::Response& res) {
    add_cors_headers(res);
    std::lock_guard<std::mutex> lock(mutex_);
    try {
        auto j = json::parse(req.body);
        fen_ = j.at("fen").get<std::string>();
        depth_ = j.value("depth", 12);

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

void HttpServerHandler::handle_get(const httplib::Request&, httplib::Response& res) {
    add_cors_headers(res);
    std::lock_guard<std::mutex> lock(mutex_);
    json j;
    j["bestmove"] = bestmove_;
    res.set_content(j.dump(), "application/json");
}

void HttpServerHandler::handle_options(const httplib::Request&, httplib::Response& res) {
    add_cors_headers(res);
    res.status = 204;
}

void HttpServerHandler::start(const std::string& address, int port) {
    httplib::Server svr;

    svr.Options("/", handle_options);

    svr.Post("/", [this](const httplib::Request& req, httplib::Response& res) {
        handle_post(req, res);
        });

    svr.Get("/", [this](const httplib::Request& req, httplib::Response& res) {
        handle_get(req, res);
        });

    std::cout << "Cpp backend HTTP server running on http://" << address << ":" << port << std::endl;
    svr.listen(address.c_str(), port);
}