#pragma once

#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <string>

class ProcessLauncher {
public:
    static void LaunchEngines();

private:
    // Gets the Ollama executable path for the current user
    static std::wstring GetOllamaPath();
    static bool LaunchProcess(const std::wstring& exePath);
};
