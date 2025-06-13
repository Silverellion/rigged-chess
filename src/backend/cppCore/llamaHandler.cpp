#include "LlamaHandler.h"
#include "LlamaProcess.h"
#include <memory>
#include <mutex>
#include <iostream>

static std::unique_ptr<LlamaProcess> g_llama;
static std::once_flag g_llama_once;
static std::mutex g_llama_mutex;

bool LlamaHandler::initLlama(const std::string& llamaPath, const std::string& modelPath) {
    std::lock_guard<std::mutex> lock(g_llama_mutex);

    try {
        g_llama = std::make_unique<LlamaProcess>(llamaPath, modelPath);
        if (!g_llama->isRunning()) {
            g_llama.reset();
            return false;
        }
        return true;
    }
    catch (const std::exception& e) {
        std::cerr << "Error initializing llama.cpp: " << e.what() << std::endl;
        g_llama.reset();
        return false;
    }
}

bool LlamaHandler::generateResponse(const std::string& prompt, std::string& response) {
    std::lock_guard<std::mutex> lock(g_llama_mutex);

    if (!g_llama || !g_llama->isRunning()) {
        return false;
    }

    return g_llama->sendPrompt(prompt, response);
}

void LlamaHandler::shutdown() {
    std::lock_guard<std::mutex> lock(g_llama_mutex);
    g_llama.reset();
}