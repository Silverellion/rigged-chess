#include "LlamaProcess.h"
#include <iostream>
#include <sstream>
#include <thread>
#include <chrono>

LlamaProcess::LlamaProcess(const std::string& llamaPath, const std::string& modelPath)
    : hProcess_(NULL), hThread_(NULL), hChildStdinWr_(NULL), hChildStdoutRd_(NULL) {
    startProcess(llamaPath, modelPath);
}

LlamaProcess::~LlamaProcess() {
    stopProcess();
}

bool LlamaProcess::startProcess(const std::string& llamaPath, const std::string& modelPath) {
    SECURITY_ATTRIBUTES saAttr{};
    saAttr.nLength = sizeof(SECURITY_ATTRIBUTES);
    saAttr.bInheritHandle = TRUE;
    saAttr.lpSecurityDescriptor = NULL;

    HANDLE hChildStdinRd = NULL;
    HANDLE hChildStdoutWr = NULL;

    // Create pipes for STDIN and STDOUT
    if (!CreatePipe(&hChildStdoutRd_, &hChildStdoutWr, &saAttr, 0)) return false;
    if (!SetHandleInformation(hChildStdoutRd_, HANDLE_FLAG_INHERIT, 0)) return false;
    if (!CreatePipe(&hChildStdinRd, &hChildStdinWr_, &saAttr, 0)) return false;
    if (!SetHandleInformation(hChildStdinWr_, HANDLE_FLAG_INHERIT, 0)) return false;

    PROCESS_INFORMATION pi{};
    STARTUPINFOA si{};
    si.cb = sizeof(STARTUPINFOA);
    si.hStdError = hChildStdoutWr;
    si.hStdOutput = hChildStdoutWr;
    si.hStdInput = hChildStdinRd;
    si.dwFlags |= STARTF_USESTDHANDLES;

    std::string cmdLine = "\"" + llamaPath + "\" -m \"" + modelPath + "\" --gpu-layers 100 -i";
    BOOL result = CreateProcessA(
        NULL,           // Application name
        &cmdLine[0],    // Command line
        NULL,           // Process security attributes
        NULL,           // Thread security attributes
        TRUE,           // Inherit handles
        0,              // Creation flags
        NULL,           // Environment
        NULL,           // Current directory
        &si,            // Startup info
        &pi             // Process information
    );

    CloseHandle(hChildStdoutWr);
    CloseHandle(hChildStdinRd);

    if (!result) {
        std::cerr << "Failed to start llama.cpp process. Error: " << GetLastError() << std::endl;
        return false;
    }

    hProcess_ = pi.hProcess;
    hThread_ = pi.hThread;

    std::cout << "Waiting for llama.cpp model to initialize..." << std::endl;
    return waitForModelInitialization();
}

bool LlamaProcess::waitForModelInitialization() {
    std::string initOutput;

    const int maxAttempts = 60; 
    int attempt = 0;

    while (attempt < maxAttempts) {
        std::string buffer;
        if (readFromProcess(buffer, false) && !buffer.empty()) {
            initOutput += buffer;

            std::cout << buffer;

            if (buffer.find("> ") != std::string::npos ||
                initOutput.find("> ") != std::string::npos) {
                std::cout << "\nModel initialization complete!" << std::endl;
                return true;
            }
        }

        std::this_thread::sleep_for(std::chrono::seconds(1));
        attempt++;
    }

    std::cerr << "Timed out waiting for model initialization" << std::endl;
    return false;
}

void LlamaProcess::stopProcess() {
    std::lock_guard<std::mutex> lock(mtx_);
    if (hProcess_) {
        TerminateProcess(hProcess_, 0);
        CloseHandle(hProcess_);
        hProcess_ = NULL;
    }
    if (hThread_) {
        CloseHandle(hThread_);
        hThread_ = NULL;
    }
    if (hChildStdinWr_) {
        CloseHandle(hChildStdinWr_);
        hChildStdinWr_ = NULL;
    }
    if (hChildStdoutRd_) {
        CloseHandle(hChildStdoutRd_);
        hChildStdoutRd_ = NULL;
    }
}

bool LlamaProcess::isRunning() const {
    if (!hProcess_) return false;
    DWORD exitCode;
    if (GetExitCodeProcess(hProcess_, &exitCode)) {
        return exitCode == STILL_ACTIVE;
    }
    return false;
}

bool LlamaProcess::writeToProcess(const std::string& data) {
    if (!hChildStdinWr_) return false;
    DWORD written = 0;
    BOOL success = WriteFile(hChildStdinWr_, data.c_str(), (DWORD)data.size(), &written, NULL);
    return success && written == data.size();
}

bool LlamaProcess::readFromProcess(std::string& output, bool waitForCompletion) {
    if (!hChildStdoutRd_) return false;

    output.clear();
    char buffer[4096];
    DWORD bytesRead;
    DWORD totalAvailable = 0;

    if (!PeekNamedPipe(hChildStdoutRd_, NULL, 0, NULL, &totalAvailable, NULL) || totalAvailable == 0) {
        if (!waitForCompletion) return true; 
    }

    bool complete = false;

    while (!complete) {
        if (!ReadFile(hChildStdoutRd_, buffer, sizeof(buffer) - 1, &bytesRead, NULL) || bytesRead == 0) {
            break;
        }

        buffer[bytesRead] = '\0';
        output += buffer;

        if (!waitForCompletion || output.find("\n> ") != std::string::npos) {
            complete = true;
        }

        if (!PeekNamedPipe(hChildStdoutRd_, NULL, 0, NULL, &totalAvailable, NULL) || totalAvailable == 0) {
            if (waitForCompletion) {
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
                if (!PeekNamedPipe(hChildStdoutRd_, NULL, 0, NULL, &totalAvailable, NULL) || totalAvailable == 0) {
                    complete = true;
                }
            }
            else {
                complete = true;
            }
        }
    }

    return !output.empty();
}

bool LlamaProcess::sendPrompt(const std::string& prompt, std::string& response) {
    std::lock_guard<std::mutex> lock(mtx_);

    std::string dummy;
    readFromProcess(dummy, false);

    std::string fullPrompt = prompt + "\n";
    if (!writeToProcess(fullPrompt)) {
        return false;
    }

    if (!readFromProcess(response, true)) {
        return false;
    }

    // Extract the model's reply
    size_t promptPos = response.find(prompt);
    if (promptPos != std::string::npos) {
        response = response.substr(promptPos + prompt.length());
    }

    size_t endPos = response.find("\n> ");
    if (endPos != std::string::npos) {
        response = response.substr(0, endPos);
    }

    while (!response.empty() && (response.front() == '\n' || response.front() == '\r')) {
        response.erase(0, 1);
    }
    while (!response.empty() && (response.back() == '\n' || response.back() == '\r')) {
        response.pop_back();
    }

    return true;
}