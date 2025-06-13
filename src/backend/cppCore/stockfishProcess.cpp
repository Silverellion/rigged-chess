#include "StockfishProcess.h"
#include <windows.h>
#include <string>
#include <mutex>
#include <vector>
#include <iostream>

StockfishProcess::StockfishProcess(const std::string& stockfishPath)
    : hProcess_(NULL), hThread_(NULL), hChildStdinWr_(NULL), hChildStdoutRd_(NULL) {
    startProcess(stockfishPath);
    std::string dummy;
    sendCommand("uci\n");
    readUntil("uciok", dummy);
}

StockfishProcess::~StockfishProcess() {
    stopProcess();
}

bool StockfishProcess::startProcess(const std::string& stockfishPath) {
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

    std::string cmdLine = "\"" + stockfishPath + "\"";
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

    if (!result) return false;

    hProcess_ = pi.hProcess;
    hThread_ = pi.hThread;
    return true;
}

void StockfishProcess::stopProcess() {
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

bool StockfishProcess::sendCommand(const std::string& command) {
    std::lock_guard<std::mutex> lock(mtx_);
    if (!hChildStdinWr_) return false;
    DWORD written = 0;
    BOOL bSuccess = WriteFile(hChildStdinWr_, command.c_str(), (DWORD)command.size(), &written, NULL);
    return bSuccess && written == command.size();
}

bool StockfishProcess::readUntil(const std::string& waitFor, std::string& resultLine) {
    std::lock_guard<std::mutex> lock(mtx_);
    if (!hChildStdoutRd_) return false;
    std::string buffer;
    char chBuf[256];
    DWORD dwRead;
    while (true) {
        BOOL bSuccess = ReadFile(hChildStdoutRd_, chBuf, sizeof(chBuf) - 1, &dwRead, NULL);
        if (!bSuccess || dwRead == 0) break;
        chBuf[dwRead] = '\0';
        buffer += chBuf;
        size_t pos = buffer.find('\n');
        while (pos != std::string::npos) {
            std::string line = buffer.substr(0, pos);
            if (line.find(waitFor) != std::string::npos) {
                resultLine = line;
                return true;
            }
            buffer = buffer.substr(pos + 1);
            pos = buffer.find('\n');
        }
    }
    return false;
}

bool StockfishProcess::sendCommandAndWait(const std::string& command, const std::string& waitFor, std::string& resultLine) {
    if (!sendCommand(command)) return false;
    return readUntil(waitFor, resultLine);
}