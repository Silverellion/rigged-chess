#include "processLauncher.h"
#include "stockfishApiHandler.h"
#include "external/httplib.h"
#include "external/json.hpp"
#include <iostream>
#include <fstream>
#include <mutex>
#include <string>

using json = nlohmann::json;

std::string g_fen;
int g_depth = 12;
std::string g_bestmove;
std::mutex g_mutex;

std::string stockfishPath = "C:\\stockfish\\stockfish-windows-x86-64-avx2.exe";

bool getBestMoveFromStockfish(const std::string& fen, int depth, std::string& bestmove) {
    // Write commands to a temporary file
    std::string tmpFile = "stockfish_input.txt";
    std::ofstream ofs(tmpFile);
    ofs << "position fen " << fen << "\n";
    ofs << "go depth " << depth << "\n";
    ofs.close();

    // Run Stockfish, redirecting input from the file
    std::string cmd = stockfishPath + " < " + tmpFile;
    FILE* pipe = _popen(cmd.c_str(), "r");
    if (!pipe) return false;

    char buffer[256];
    std::string output;
    while (fgets(buffer, sizeof(buffer), pipe)) {
        output += buffer;
        if (std::string(buffer).find("bestmove") != std::string::npos) {
            break;
        }
    }
    _pclose(pipe);

    std::istringstream iss(output);
    std::string line;
    while (std::getline(iss, line)) {
        if (line.find("bestmove") == 0) {
            std::istringstream lss(line);
            std::string tag, move;
            lss >> tag >> move;
            bestmove = move;
            return true;
        }
    }
    return false;
}

void add_cors_headers(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
}

int main() {
    ProcessLauncher::LaunchEngines();

    httplib::Server svr;

    // Handle OPTIONS (CORS preflight)
    svr.Options("/", [](const httplib::Request&, httplib::Response& res) {
        add_cors_headers(res);
        res.status = 204;
        });

    // POST / : receive FEN and depth, compute best move
    svr.Post("/", [](const httplib::Request& req, httplib::Response& res) {
        add_cors_headers(res);
        std::lock_guard<std::mutex> lock(g_mutex);
        try {
            auto j = json::parse(req.body);
            g_fen = j.at("fen").get<std::string>();
            g_depth = j.value("depth", 12);

            std::string bestmove;
            if (getBestMoveFromStockfish(g_fen, g_depth, bestmove)) {
                g_bestmove = bestmove;
                res.set_content("{\"status\":\"ok\"}", "application/json");
            }
            else {
                res.status = 500;
                res.set_content("{\"error\":\"Stockfish failed\"}", "application/json");
            }
        }
        catch (...) {
            res.status = 400;
            res.set_content("{\"error\":\"Bad request\"}", "application/json");
        }
        });

    // GET / : return best move
    svr.Get("/", [](const httplib::Request&, httplib::Response& res) {
        add_cors_headers(res);
        json j;
        j["bestmove"] = g_bestmove;
        res.set_content(j.dump(), "application/json");
        });

    std::cout << "Cpp backend HTTP server running on http://localhost:1337\n";
    svr.listen("0.0.0.0", 1337);

    return 0;
}