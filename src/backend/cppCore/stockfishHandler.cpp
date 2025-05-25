#include "stockfishHandler.h"
#include <iostream>
#include <sstream>
#include <regex>

StockfishHandler::StockfishHandler() : hStdinWrite(NULL), hStdoutRead(NULL) {
    ZeroMemory(&pi, sizeof(pi));
}

StockfishHandler::~StockfishHandler() {
    if (pi.hProcess) {
        // Send quit command to Stockfish
        writeCommand("quit");

        // Wait for process to exit
        WaitForSingleObject(pi.hProcess, 1000);

        // Close handles
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
        CloseHandle(hStdinWrite);
        CloseHandle(hStdoutRead);
    }
}

bool StockfishHandler::initialize() {
    SECURITY_ATTRIBUTES sa;
    sa.nLength = sizeof(SECURITY_ATTRIBUTES);
    sa.bInheritHandle = TRUE;
    sa.lpSecurityDescriptor = NULL;

    HANDLE hStdoutWrite, hStdinRead;

    // Create pipes for stdin and stdout
    if (!CreatePipe(&hStdinRead, &hStdinWrite, &sa, 0) ||
        !CreatePipe(&hStdoutRead, &hStdoutWrite, &sa, 0)) {
        std::cerr << "Failed to create pipes" << std::endl;
        return false;
    }

    SetHandleInformation(hStdinWrite, HANDLE_FLAG_INHERIT, 0);
    SetHandleInformation(hStdoutRead, HANDLE_FLAG_INHERIT, 0);

    STARTUPINFOW si;
    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    si.hStdError = hStdoutWrite;
    si.hStdOutput = hStdoutWrite;
    si.hStdInput = hStdinRead;
    si.dwFlags |= STARTF_USESTDHANDLES;

    std::wstring stockfishPath = L"C:\\stockfish\\stockfish-windows-x86-64-avx2.exe";

    if (!CreateProcessW(
        NULL,                          // Application name
        const_cast<LPWSTR>(stockfishPath.c_str()), // Command line
        NULL,                          // Process security attributes
        NULL,                          // Thread security attributes
        TRUE,                          // Inherit handles
        0,                             // Creation flags
        NULL,                          // Environment
        NULL,                          // Current directory
        &si,                           // Startup info
        &pi                            // Process info
    )) {
        std::cerr << "Failed to start Stockfish. Error: " << GetLastError() << std::endl;
        CloseHandle(hStdinRead);
        CloseHandle(hStdinWrite);
        CloseHandle(hStdoutRead);
        CloseHandle(hStdoutWrite);
        return false;
    }

    // Close unneeded handles
    CloseHandle(hStdinRead);
    CloseHandle(hStdoutWrite);

    // Wait for Stockfish to initialize
    std::this_thread::sleep_for(std::chrono::milliseconds(500));

    // Set some Stockfish options
    writeCommand("uci");
    writeCommand("setoption name Hash value 128");
    writeCommand("setoption name Threads value 4");
    writeCommand("isready");

    // Read until "readyok"
    std::string output = readOutput();
    if (output.find("readyok") == std::string::npos) {
        std::cerr << "Stockfish initialization failed" << std::endl;
        return false;
    }

    return true;
}

std::string StockfishHandler::analyzeFEN(const std::string& fen, int depth) {
    // Create the position command
    std::string positionCmd = "position fen " + fen;

    // Send commands to Stockfish
    writeCommand(positionCmd);
    writeCommand("go depth " + std::to_string(depth));

    // Read output until we get a bestmove
    std::string output = readOutput(true);

    // Extract best move using regex
    std::regex bestMoveRegex("bestmove (\\S+)");
    std::smatch match;

    if (std::regex_search(output, match, bestMoveRegex) && match.size() > 1) {
        std::lock_guard<std::mutex> lock(bestMoveMutex);
        lastBestMove = match[1].str();
        return lastBestMove;
    }

    return "";
}

std::string StockfishHandler::getLastBestMove() const {
    std::lock_guard<std::mutex> lock(bestMoveMutex);
    return lastBestMove;
}

bool StockfishHandler::writeCommand(const std::string& command) {
    std::string cmd = command + "\n";
    DWORD bytesWritten;

    if (!WriteFile(hStdinWrite, cmd.c_str(), static_cast<DWORD>(cmd.length()), &bytesWritten, NULL)) {
        std::cerr << "Failed to write to Stockfish. Error: " << GetLastError() << std::endl;
        return false;
    }

    return true;
}

std::string StockfishHandler::readOutput(bool waitForBestMove) {
    std::string result;
    char buffer[4096];
    DWORD bytesRead;
    DWORD totalBytesAvail;

    // Wait for best move
    while (true) {
        if (!PeekNamedPipe(hStdoutRead, NULL, 0, NULL, &totalBytesAvail, NULL)) {
            std::cerr << "Failed to peek pipe. Error: " << GetLastError() << std::endl;
            break;
        }

        if (totalBytesAvail == 0) {
            // No data available yet
            if (waitForBestMove && result.find("bestmove") == std::string::npos) {
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
                continue;
            }
            else {
                break;
            }
        }

        // Read available data
        if (!ReadFile(hStdoutRead, buffer, sizeof(buffer) - 1, &bytesRead, NULL)) {
            std::cerr << "Failed to read from Stockfish. Error: " << GetLastError() << std::endl;
            break;
        }

        if (bytesRead > 0) {
            buffer[bytesRead] = '\0';
            result += buffer;
            if (waitForBestMove && result.find("bestmove") != std::string::npos) {
                break;
            }
        }
    }

    return result;
}