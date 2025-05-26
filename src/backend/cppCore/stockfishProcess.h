#pragma once
#include <string>
#include <mutex>
#include <windows.h>

/**
 * @brief Manages a persistent Stockfish engine process with bidirectional pipes (Windows only).
 *
 * This class launches Stockfish as a child process and communicates with it
 * via stdin/stdout pipes. It is thread-safe and allows sending UCI commands
 * and reading responses. The process is started once and only closed on destruction.
 *
 * Usage:
 *   StockfishProcess stockfish("C:\\path\\to\\stockfish.exe");
 *   stockfish.sendCommand("uci\n");
 *   std::string line;
 *   stockfish.readUntil("uciok", line);
 */
class StockfishProcess {
public:
    /**
     * @brief Constructs and launches the Stockfish process.
     * @param stockfishPath Path to the Stockfish executable.
     */
    explicit StockfishProcess(const std::string& stockfishPath);

    /**
     * @brief Destructor. Terminates the Stockfish process and closes all handles.
     */
    ~StockfishProcess();

    /**
     * @brief Sends a UCI command to Stockfish and reads output until a line containing the given keyword.
     * @param command The command to send (e.g. "position fen ...").
     * @param waitFor The keyword to wait for in output (e.g. "bestmove").
     * @param resultLine The line containing the keyword will be stored here.
     * @return true on success, false on error.
     */
    bool sendCommandAndWait(const std::string& command, const std::string& waitFor, std::string& resultLine);

    /**
     * @brief Sends a command to Stockfish.
     * @param command The command to send.
     * @return true on success.
     */
    bool sendCommand(const std::string& command);

    /**
     * @brief Reads lines from Stockfish until a line containing the given keyword.
     * @param waitFor The keyword to wait for.
     * @param resultLine The line containing the keyword will be stored here.
     * @return true if found, false otherwise.
     */
    bool readUntil(const std::string& waitFor, std::string& resultLine);

private:
    HANDLE hProcess_;         ///< Handle to the Stockfish process.
    HANDLE hThread_;          ///< Handle to the Stockfish main thread.
    HANDLE hChildStdinWr_;    ///< Write handle to Stockfish's stdin.
    HANDLE hChildStdoutRd_;   ///< Read handle from Stockfish's stdout.
    std::mutex mtx_;          ///< Mutex for thread safety.

    /**
     * @brief Starts the Stockfish process and sets up pipes.
     * @param stockfishPath Path to the Stockfish executable.
     * @return true on success, false on failure.
     */
    bool startProcess(const std::string& stockfishPath);

    /**
     * @brief Terminates the Stockfish process and closes all handles.
     */
    void stopProcess();
};