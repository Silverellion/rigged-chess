#pragma once

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
