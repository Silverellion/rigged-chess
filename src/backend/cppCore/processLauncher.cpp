#include "processLauncher.h"

#include <shlobj.h>
#include <iostream>


void ProcessLauncher::LaunchEngines() {
    std::wstring stockfishPath = L"C:\\stockfish\\stockfish-windows-x86-64-avx2.exe";
    std::wstring ollamaPath = GetOllamaPath();

    if (!LaunchProcess(stockfishPath)) {
        std::wcerr << L"Failed to launch Stockfish." << std::endl;
    }
    if (!LaunchProcess(ollamaPath)) {
        std::wcerr << L"Failed to launch Ollama." << std::endl;
    }
}

// Gets the Ollama executable path for the current user
std::wstring ProcessLauncher::GetOllamaPath() {
    wchar_t* userProfile = nullptr;
    if (SHGetKnownFolderPath(FOLDERID_Profile, 0, NULL, &userProfile) != S_OK) {
        return L"";
    }
    std::wstring path(userProfile);
    CoTaskMemFree(userProfile);
    path += L"\\AppData\\Local\\Programs\\Ollama\\Ollama app.exe";
    return path;
}

bool ProcessLauncher::LaunchProcess(const std::wstring& exePath) {
    STARTUPINFOW si = { sizeof(si) };
    PROCESS_INFORMATION pi;
    std::wstring cmdLine = L"\"" + exePath + L"\"";

    BOOL result = CreateProcessW(
        NULL,
        &cmdLine[0],
        NULL,
        NULL,
        FALSE,
        0,
        NULL,
        NULL,
        &si,
        &pi
    );

    if (result) {
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
        return true;
    }
    return false;
}