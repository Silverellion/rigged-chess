#include "stockfishApiHandler.h"
#include <iostream>
#include <sstream>
#include <cstdio>
#include "external/json.hpp" 

using json = nlohmann::json;

StockfishApiHandler::StockfishApiHandler(const std::string& getUrl, const std::string& postUrl, const std::string& stockfishPath)
    : getUrl_(getUrl), postUrl_(postUrl), stockfishPath_(stockfishPath) {
}

void StockfishApiHandler::Run() {
    std::string fen;
    int depth = 0;
    if (!GetFenAndDepth(fen, depth)) {
        std::cerr << "Failed to get FEN and depth from API." << std::endl;
        return;
    }

    std::string bestmove;
    if (!GetBestMoveFromStockfish(fen, depth, bestmove)) {
        std::cerr << "Failed to get bestmove from Stockfish." << std::endl;
        return;
    }

    if (!PostBestMove(bestmove)) {
        std::cerr << "Failed to post bestmove to API." << std::endl;
    }
}

bool StockfishApiHandler::GetFenAndDepth(std::string& fen, int& depth) {
    httplib::Client cli(getUrl_.c_str());
    auto res = cli.Get("/");
    if (!res || res->status != 200) return false;

    try {
        auto j = json::parse(res->body);
        fen = j.at("fen").get<std::string>();
        depth = j.at("depth").get<int>();
        return true;
    }
    catch (...) {
        return false;
    }
}

bool StockfishApiHandler::GetBestMoveFromStockfish(const std::string& fen, int depth, std::string& bestmove) {
    return SendCommandsToStockfish(fen, depth, bestmove);
}

bool StockfishApiHandler::SendCommandsToStockfish(const std::string& fen, int depth, std::string& bestmove) {
    std::string cmd = stockfishPath_ + " 2>&1";
    FILE* pipe = _popen(cmd.c_str(), "w+");
    if (!pipe) return false;

    std::string positionCmd = "position fen " + fen + "\n";
    std::string goCmd = "go depth " + std::to_string(depth) + "\n";

    fwrite(positionCmd.c_str(), 1, positionCmd.size(), pipe);
    fwrite(goCmd.c_str(), 1, goCmd.size(), pipe);
    fflush(pipe);

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

bool StockfishApiHandler::PostBestMove(const std::string& bestmove) {
    httplib::Client cli(postUrl_.c_str());
    json j;
    j["bestmove"] = bestmove;
    auto res = cli.Post("/", j.dump(), "application/json");
    return res && res->status == 200;
}