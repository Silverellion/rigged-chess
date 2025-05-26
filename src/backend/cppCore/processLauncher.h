#pragma once

#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <string>

/**
 * @brief Provides a simple to launch both Ollama and Stockfish.
 */
class ProcessLauncher {
public:
    /**
     * @brief Launches Ollama and Stockfish.
     */
    static void LaunchEngines();

private:
    // Gets the Ollama executable path for the current user
    static std::wstring GetOllamaPath();
    static bool LaunchProcess(const std::wstring& exePath);
};
