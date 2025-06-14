#pragma once

#include <vector>
#include <string>
#include <memory>

enum class PieceType {
    Pawn, Knight, Bishop, Rook, Queen, King, None
};

enum class Color {
    White, Black, None
};

struct Coords {
    int x;
    int y;

    bool operator==(const Coords& other) const {
        return x == other.x && y == other.y;
    }
};

class Piece {
public:
    Piece(PieceType type, Color color);
    virtual ~Piece() = default;

    PieceType getType() const { return type_; }
    Color getColor() const { return color_; }
    bool getHasMoved() const { return hasMoved_; }
    void setHasMoved() { hasMoved_ = true; }

private:
    PieceType type_;
    Color color_;
    bool hasMoved_ = false;
};

class ChessValidator {
public:
    ChessValidator();
    ~ChessValidator();

    void initializeBoard();
    bool setBoardFromFen(const std::string& fen);
    std::string getBoardAsFen() const;

    bool validateMove(const Coords& from, const Coords& to, const std::string& promotionPiece = "");
    bool makeMove(const Coords& from, const Coords& to, const std::string& promotionPiece = "");

    Color getCurrentTurn() const { return currentTurn_; }
    bool isPromotionPending() const { return promotionPending_; }

    std::vector<Coords> getLegalMoves(const Coords& position);

private:
    std::vector<std::vector<std::shared_ptr<Piece>>> board_;
    Color currentTurn_;
    std::pair<Coords, Coords> lastMove_;
    bool promotionPending_ = false;
    Coords pendingPromotionFrom_;
    Coords pendingPromotionTo_;

    bool isValidPosition(const Coords& coords) const;
    bool isPieceAtPosition(const Coords& coords) const;
    bool isSquareAttacked(const Coords& position, Color defendingColor);
    bool isKingInCheck(Color kingColor);
    Coords findKing(Color kingColor);
    std::vector<Coords> getPieceMoves(const Coords& from, bool checkForCheck);
    std::vector<Coords> getPawnMoves(const Coords& from, bool checkForCheck);
    std::vector<Coords> getKnightMoves(const Coords& from, bool checkForCheck);
    std::vector<Coords> getBishopMoves(const Coords& from, bool checkForCheck);
    std::vector<Coords> getRookMoves(const Coords& from, bool checkForCheck);
    std::vector<Coords> getQueenMoves(const Coords& from, bool checkForCheck);
    std::vector<Coords> getKingMoves(const Coords& from, bool checkForCheck);
    std::vector<Coords> getCastlingMoves(const Coords& from);
    bool canCastle(const Coords& from, const Coords& to);
    bool isEnPassant(const Coords& from, const Coords& to);
    bool isPromotion(const Coords& from, const Coords& to);
    std::shared_ptr<Piece> createPiece(PieceType type, Color color);
    bool wouldMoveLeaveKingInCheck(const Coords& from, const Coords& to);
};