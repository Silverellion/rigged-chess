#include "LlamaRoutes.h"
#include "LlamaHandler.h"
#include "external/json.hpp"
#include <iostream>

using json = nlohmann::json;

LlamaRoutes::LlamaRoutes(const std::string& llamaPath, const std::string& modelPath)
    : llamaPath_(llamaPath),
    modelPath_(modelPath),
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

void LlamaRoutes::add_cors_headers(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
}

void LlamaRoutes::registerRoutes(httplib::Server& svr) {
    svr.Post("/chat", [this](const httplib::Request& req, httplib::Response& res) {
        handle_chat_post(req, res);
        });

    svr.Get("/model-status", [this](const httplib::Request& req, httplib::Response& res) {
        handle_model_status(req, res);
        });

    svr.Options("/chat", [](const httplib::Request&, httplib::Response& res) {
        add_cors_headers(res);
        res.status = 204;
        });

    svr.Options("/model-status", [](const httplib::Request&, httplib::Response& res) {
        add_cors_headers(res);
        res.status = 204;
        });
}

void LlamaRoutes::handle_chat_post(const httplib::Request& req, httplib::Response& res) {
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

void LlamaRoutes::handle_model_status(const httplib::Request&, httplib::Response& res) {
    add_cors_headers(res);

    json statusJson;
    statusJson["initialized"] = modelInitialized_;
    statusJson["model"] = modelPath_;

    res.set_content(statusJson.dump(), "application/json");
}