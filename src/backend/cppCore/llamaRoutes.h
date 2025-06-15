#pragma once

#include <string>
#include <mutex>
#include "external/httplib.h"

class LlamaRoutes {
public:
    LlamaRoutes(const std::string& llamaPath, const std::string& modelPath);

    void registerRoutes(httplib::Server& svr);
    void handle_chat_post(const httplib::Request& req, httplib::Response& res);
    void handle_model_status(const httplib::Request& req, httplib::Response& res);

private:
    std::string llamaPath_;
    std::string modelPath_;
    bool modelInitialized_;
    std::mutex mutex_;

    static void add_cors_headers(httplib::Response& res);
};