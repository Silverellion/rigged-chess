#pragma once

#include <string>
#include <windows.h>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <queue>

class StockfishHandler {
public:
    StockfishHandler();
    ~StockfishHandler();

    bool initialize();
    std::string analyzeFEN(const std::string& fen, int depth);
    std::string getLastBestMove() const;

private:
    HANDLE hStdinWrite;
    HANDLE hStdoutRead;
    PROCESS_INFORMATION pi;

    std::string lastBestMove;
    mutable std::mutex bestMoveMutex;

    bool writeCommand(const std::string& command);
    std::string readOutput(bool waitForBestMove = false);
}