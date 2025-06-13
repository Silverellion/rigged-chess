#pragma once

#include <string>
#include <mutex>
#include <windows.h>

class LlamaProcess {
public:
    LlamaProcess(const std::string& llamaPath, const std::string& modelPath);
    ~LlamaProcess();

    bool sendPrompt(const std::string& prompt, std::string& response);
    bool isRunning() const;

private:
    bool startProcess(const std::string& llamaPath, const std::string& modelPath);
    void stopProcess();
    bool writeToProcess(const std::string& data);
    bool readFromProcess(std::string& output, bool waitForCompletion = true);

    HANDLE hProcess_;
    HANDLE hThread_;
    HANDLE hChildStdinWr_;
    HANDLE hChildStdoutRd_;
    std::mutex mtx_;
};