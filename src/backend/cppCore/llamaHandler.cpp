#include "LlamaHandler.h"
#include "LlamaProcess.h"
#include <memory>
#include <mutex>
#include <iostream>
#include <chrono>
#include <thread>

static std::unique_ptr<LlamaProcess> g_llama;
static std::mutex g_llama_mutex;
static bool g_initialization_attempted = false;

bool LlamaHandler::initLlama(const std::string& llamaPath, const std::string& modelPath) {
    std::lock_guard<std::mutex> lock(g_llama_mutex);

    if (g_initialization_attempted) {
        return g_llama != nullptr && g_llama->isRunning();
    }

    g_initialization_attempted = true;

    try {
        std::cout << "Initializing llama.cpp with model: " << modelPath << std::endl;
        std::cout << "Using binary: " << llamaPath << std::endl;

        g_llama = std::make_unique<LlamaProcess>(llamaPath, modelPath);

        if (!g_llama->isRunning()) {
            std::cerr << "Failed to start llama.cpp process" << std::endl;
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
    g_initialization_attempted = false;
}