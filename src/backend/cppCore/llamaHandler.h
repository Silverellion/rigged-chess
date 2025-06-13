#pragma once

#include <string>
#include <memory>

class LlamaHandler {
public:
    static bool initLlama(const std::string& llamaPath, const std::string& modelPath);
    static bool generateResponse(const std::string& prompt, std::string& response);
    static void shutdown();
};
