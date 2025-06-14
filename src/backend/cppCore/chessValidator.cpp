#include "ChessValidator.h"
#include <sstream>
#include <algorithm>
#include <cctype>
#include <iostream>

Piece::Piece(PieceType type, Color color) : type_(type), color_(color) {}

ChessValidator::ChessValidator() : currentTurn_(Color::White) {
    initializeBoard();
}

ChessValidator::~ChessValidator() = default;

void ChessValidator::initializeBoard() {
    board_.clear();
    board_.resize(8, std::vector<std::shared_ptr<Piece>>(8, nullptr));

    board_[0][0] = createPiece(PieceType::Rook, Color::Black);
    board_[0][1] = createPiece(PieceType::Knight, Color::Black);
    board_[0][2] = createPiece(PieceType::Bishop, Color::Black);
    board_[0][3] = createPiece(PieceType::Queen, Color::Black);
    board_[0][4] = createPiece(PieceType::King, Color::Black);
    board_[0][5] = createPiece(PieceType::Bishop, Color::Black);
    board_[0][6] = createPiece(PieceType::Knight, Color::Black);
    board_[0][7] = createPiece(PieceType::Rook, Color::Black);

    for (int col = 0; col < 8; col++) {
        board_[1][col] = createPiece(PieceType::Pawn, Color::Black);
    }

    for (int col = 0; col < 8; col++) {
        board_[6][col] = createPiece(PieceType::Pawn, Color::White);
    }

    board_[7][0] = createPiece(PieceType::Rook, Color::White);
    board_[7][1] = createPiece(PieceType::Knight, Color::White);
    board_[7][2] = createPiece(PieceType::Bishop, Color::White);
    board_[7][3] = createPiece(PieceType::Queen, Color::White);
    board_[7][4] = createPiece(PieceType::King, Color::White);
    board_[7][5] = createPiece(PieceType::Bishop, Color::White);
    board_[7][6] = createPiece(PieceType::Knight, Color::White);
    board_[7][7] = createPiece(PieceType::Rook, Color::White);

    currentTurn_ = Color::White;
    promotionPending_ = false;
}

bool ChessValidator::isValidPosition(const Coords& coords) const {
    return coords.x >= 0 && coords.x < 8 && coords.y >= 0 && coords.y < 8;
}

bool ChessValidator::isPieceAtPosition(const Coords& coords) const {
    if (!isValidPosition(coords)) return false;
    return board_[coords.x][coords.y] != nullptr;
}

std::shared_ptr<Piece> ChessValidator::createPiece(PieceType type, Color color) {
    return std::make_shared<Piece>(type, color);
}

bool ChessValidator::validateMove(const Coords& from, const Coords& to, const std::string& promotionPiece) {
    if (!isValidPosition(from) || !isValidPosition(to)) {
        return false;
    }

    auto piece = board_[from.x][from.y];
    if (!piece) {
        return false;
    }

    if (piece->getColor() != currentTurn_) {
        return false;
    }

    if (promotionPending_) {
        if (from == pendingPromotionFrom_ && to == pendingPromotionTo_ && !promotionPiece.empty()) {
            return true;
        }
        return false;
    }

    auto legalMoves = getLegalMoves(from);
    if (std::find(legalMoves.begin(), legalMoves.end(), to) == legalMoves.end()) {
        return false;
    }

    if (isPromotion(from, to) && promotionPiece.empty()) {
        promotionPending_ = true;
        pendingPromotionFrom_ = from;
        pendingPromotionTo_ = to;
        return true; 
    }

    return true;
}

bool ChessValidator::makeMove(const Coords& from, const Coords& to, const std::string& promotionPiece) {
    if (!validateMove(from, to, promotionPiece)) {
        return false;
    }

    auto piece = board_[from.x][from.y];

    if (promotionPending_) {
        if (promotionPiece.empty()) {
            return false; 
        }

        PieceType promotionType;
        if (promotionPiece == "q" || promotionPiece == "Q") {
            promotionType = PieceType::Queen;
        }
        else if (promotionPiece == "r" || promotionPiece == "R") {
            promotionType = PieceType::Rook;
        }
        else if (promotionPiece == "b" || promotionPiece == "B") {
            promotionType = PieceType::Bishop;
        }
        else if (promotionPiece == "n" || promotionPiece == "N") {
            promotionType = PieceType::Knight;
        }
        else {
            return false;
        }

        board_[to.x][to.y] = createPiece(promotionType, currentTurn_);
        board_[from.x][from.y] = nullptr;

        promotionPending_ = false;
    }

    else if (piece->getType() == PieceType::King && std::abs(to.y - from.y) == 2) {
        // Move the king
        board_[to.x][to.y] = piece;
        board_[from.x][from.y] = nullptr;
        piece->setHasMoved();

        // Move the rook
        int rookFromY = (to.y > from.y) ? 7 : 0;
        int rookToY = (to.y > from.y) ? from.y + 1 : from.y - 1;

        auto rook = board_[from.x][rookFromY];
        board_[from.x][rookToY] = rook;
        board_[from.x][rookFromY] = nullptr;
        if (rook) rook->setHasMoved();
    }
    // Handle en passant
    else if (piece->getType() == PieceType::Pawn &&
        from.y != to.y &&
        !board_[to.x][to.y]) {
        board_[to.x][to.y] = piece;
        board_[from.x][from.y] = nullptr;
        board_[from.x][to.y] = nullptr;
    }
    // Regular move
    else {
        if (piece->getType() == PieceType::Pawn ||
            piece->getType() == PieceType::Rook ||
            piece->getType() == PieceType::King) {
            piece->setHasMoved();
        }

        board_[to.x][to.y] = piece;
        board_[from.x][from.y] = nullptr;
    }

    lastMove_ = std::make_pair(from, to);
    currentTurn_ = (currentTurn_ == Color::White) ? Color::Black : Color::White;

    return true;
}

std::vector<Coords> ChessValidator::getLegalMoves(const Coords& position) {
    if (!isValidPosition(position) || !board_[position.x][position.y]) {
        return {};
    }

    auto piece = board_[position.x][position.y];

    switch (piece->getType()) {
    case PieceType::Pawn:
        return getPawnMoves(position, true);
    case PieceType::Knight:
        return getKnightMoves(position, true);
    case PieceType::Bishop:
        return getBishopMoves(position, true);
    case PieceType::Rook:
        return getRookMoves(position, true);
    case PieceType::Queen:
        return getQueenMoves(position, true);
    case PieceType::King:
        return getKingMoves(position, true);
    default:
        return {};
    }
}

std::vector<Coords> ChessValidator::getPieceMoves(const Coords& from, bool checkForCheck) {
    auto piece = board_[from.x][from.y];
    if (!piece) return {};

    std::vector<Coords> moves;

    switch (piece->getType()) {
    case PieceType::Pawn:
        moves = getPawnMoves(from, false);
        break;
    case PieceType::Knight:
        moves = getKnightMoves(from, false);
        break;
    case PieceType::Bishop:
        moves = getBishopMoves(from, false);
        break;
    case PieceType::Rook:
        moves = getRookMoves(from, false);
        break;
    case PieceType::Queen:
        moves = getQueenMoves(from, false);
        break;
    case PieceType::King:
        moves = getKingMoves(from, false);
        break;
    default:
        return {};
    }

    if (checkForCheck) {
        std::vector<Coords> legalMoves;
        for (const auto& to : moves) {
            if (!wouldMoveLeaveKingInCheck(from, to)) {
                legalMoves.push_back(to);
            }
        }
        return legalMoves;
    }

    return moves;
}

std::vector<Coords> ChessValidator::getPawnMoves(const Coords& from, bool checkForCheck) {
    std::vector<Coords> moves;
    auto piece = board_[from.x][from.y];
    if (!piece || piece->getType() != PieceType::Pawn) return moves;

    const int direction = (piece->getColor() == Color::White) ? -1 : 1;
    const int startRow = (piece->getColor() == Color::White) ? 6 : 1;
    const int promotionRow = (piece->getColor() == Color::White) ? 0 : 7;

    // Forward movement
    Coords oneStep = { from.x + direction, from.y };
    if (isValidPosition(oneStep) && !board_[oneStep.x][oneStep.y]) {
        moves.push_back(oneStep);
        if (from.x == startRow) {
            Coords twoStep = { from.x + 2 * direction, from.y };
            if (isValidPosition(twoStep) && !board_[twoStep.x][twoStep.y]) {
                moves.push_back(twoStep);
            }
        }
    }

    // Capturing moves
    for (int dy = -1; dy <= 1; dy += 2) {
        Coords capture = { from.x + direction, from.y + dy };
        if (isValidPosition(capture)) {
            auto targetPiece = board_[capture.x][capture.y];
            if (targetPiece && targetPiece->getColor() != piece->getColor()) {
                moves.push_back(capture);
            }

            // En passant capture
            if (!targetPiece &&
                lastMove_.first.x != -1 &&
                isEnPassant(from, capture)) {
                moves.push_back(capture);
            }
        }
    }

    if (checkForCheck) {
        std::vector<Coords> legalMoves;
        for (const auto& to : moves) {
            if (!wouldMoveLeaveKingInCheck(from, to)) {
                legalMoves.push_back(to);
            }
        }
        return legalMoves;
    }

    return moves;
}

std::vector<Coords> ChessValidator::getKnightMoves(const Coords& from, bool checkForCheck) {
    std::vector<Coords> moves;
    auto piece = board_[from.x][from.y];
    if (!piece || piece->getType() != PieceType::Knight) return moves;

    const std::vector<Coords> knightOffsets = {
        {-2, -1}, {-2, 1}, {-1, -2}, {-1, 2},
        {1, -2}, {1, 2}, {2, -1}, {2, 1}
    };

    for (const auto& offset : knightOffsets) {
        Coords to = { from.x + offset.x, from.y + offset.y };
        if (isValidPosition(to)) {
            auto targetPiece = board_[to.x][to.y];
            if (!targetPiece || targetPiece->getColor() != piece->getColor()) {
                moves.push_back(to);
            }
        }
    }

    if (checkForCheck) {
        std::vector<Coords> legalMoves;
        for (const auto& to : moves) {
            if (!wouldMoveLeaveKingInCheck(from, to)) {
                legalMoves.push_back(to);
            }
        }
        return legalMoves;
    }

    return moves;
}

std::vector<Coords> ChessValidator::getBishopMoves(const Coords& from, bool checkForCheck) {
    std::vector<Coords> moves;
    auto piece = board_[from.x][from.y];
    if (!piece || piece->getType() != PieceType::Bishop) return moves;

    const std::vector<Coords> directions = {
        {-1, -1}, {-1, 1}, {1, -1}, {1, 1}
    };

    for (const auto& dir : directions) {
        for (int i = 1; i < 8; i++) {
            Coords to = { from.x + i * dir.x, from.y + i * dir.y };
            if (!isValidPosition(to)) break;

            auto targetPiece = board_[to.x][to.y];
            if (!targetPiece) {
                moves.push_back(to);
            }
            else {
                if (targetPiece->getColor() != piece->getColor()) {
                    moves.push_back(to);
                }
                break;
            }
        }
    }

    if (checkForCheck) {
        std::vector<Coords> legalMoves;
        for (const auto& to : moves) {
            if (!wouldMoveLeaveKingInCheck(from, to)) {
                legalMoves.push_back(to);
            }
        }
        return legalMoves;
    }

    return moves;
}

std::vector<Coords> ChessValidator::getRookMoves(const Coords& from, bool checkForCheck) {
    std::vector<Coords> moves;
    auto piece = board_[from.x][from.y];
    if (!piece || piece->getType() != PieceType::Rook) return moves;

    const std::vector<Coords> directions = {
        {-1, 0}, {1, 0}, {0, -1}, {0, 1}
    };

    for (const auto& dir : directions) {
        for (int i = 1; i < 8; i++) {
            Coords to = { from.x + i * dir.x, from.y + i * dir.y };
            if (!isValidPosition(to)) break;

            auto targetPiece = board_[to.x][to.y];
            if (!targetPiece) {
                moves.push_back(to);
            }
            else {
                if (targetPiece->getColor() != piece->getColor()) {
                    moves.push_back(to);
                }
                break;
            }
        }
    }

    if (checkForCheck) {
        std::vector<Coords> legalMoves;
        for (const auto& to : moves) {
            if (!wouldMoveLeaveKingInCheck(from, to)) {
                legalMoves.push_back(to);
            }
        }
        return legalMoves;
    }

    return moves;
}

std::vector<Coords> ChessValidator::getQueenMoves(const Coords& from, bool checkForCheck) {
    std::vector<Coords> moves;
    auto piece = board_[from.x][from.y];
    if (!piece || piece->getType() != PieceType::Queen)
        return moves;

    const std::vector<Coords> directions = {
        {-1, -1}, {-1, 0}, {-1, 1},
        { 0, -1},          { 0, 1},
        { 1, -1}, { 1, 0}, { 1, 1}
    };

    for (const auto& dir : directions) {
        int x = from.x;
        int y = from.y;

        while (true) {
            x += dir.x;
            y += dir.y;
            Coords to = { x, y };
            if (!isValidPosition(to)) break;

            if (board_[x][y]) {
                if (board_[x][y]->getColor() != piece->getColor()) {
                    moves.push_back(to);
                }
                break; 
            }
            moves.push_back(to);
        }
    }

    if (checkForCheck) {
        moves.erase(
            std::remove_if(moves.begin(), moves.end(),
                [this, from](const Coords& to) {
                    return wouldMoveLeaveKingInCheck(from, to);
                }),
            moves.end()
        );
    }

    return moves;
}

std::vector<Coords> ChessValidator::getKingMoves(const Coords& from, bool checkForCheck) {
    std::vector<Coords> moves;
    auto piece = board_[from.x][from.y];
    if (!piece || piece->getType() != PieceType::King) return moves;

    for (int dx = -1; dx <= 1; dx++) {
        for (int dy = -1; dy <= 1; dy++) {
            if (dx == 0 && dy == 0) continue;

            Coords to = { from.x + dx, from.y + dy };
            if (isValidPosition(to)) {
                auto targetPiece = board_[to.x][to.y];
                if (!targetPiece || targetPiece->getColor() != piece->getColor()) {
                    if (!checkForCheck || !isSquareAttacked(to, piece->getColor())) {
                        moves.push_back(to);
                    }
                }
            }
        }
    }

    if (!piece->getHasMoved() && !isKingInCheck(piece->getColor())) {
        std::vector<Coords> castlingMoves = getCastlingMoves(from);
        moves.insert(moves.end(), castlingMoves.begin(), castlingMoves.end());
    }

    return moves;
}

std::vector<Coords> ChessValidator::getCastlingMoves(const Coords& from) {
    std::vector<Coords> moves;
    auto king = board_[from.x][from.y];
    if (!king || king->getType() != PieceType::King || king->getHasMoved()) {
        return moves;
    }

    Color color = king->getColor();
    int row = (color == Color::White) ? 7 : 0;

    // Kingside castling
    auto kingsideRook = board_[row][7];
    if (kingsideRook && kingsideRook->getType() == PieceType::Rook &&
        kingsideRook->getColor() == color && !kingsideRook->getHasMoved()) {

        bool pathClear = true;
        for (int col = from.y + 1; col < 7; col++) {
            if (board_[row][col] || isSquareAttacked({ row, col }, color)) {
                pathClear = false;
                break;
            }
        }

        if (pathClear) {
            moves.push_back({ row, from.y + 2 });
        }
    }

    // Queenside castling
    auto queensideRook = board_[row][0];
    if (queensideRook && queensideRook->getType() == PieceType::Rook &&
        queensideRook->getColor() == color && !queensideRook->getHasMoved()) {

        bool pathClear = true;
        for (int col = from.y - 1; col > 0; col--) {
            if (board_[row][col] || (col > 1 && isSquareAttacked({ row, col }, color))) {
                pathClear = false;
                break;
            }
        }

        if (pathClear) {
            moves.push_back({ row, from.y - 2 });
        }
    }

    return moves;
}

Coords ChessValidator::findKing(Color kingColor) {
    for (int row = 0; row < 8; row++) {
        for (int col = 0; col < 8; col++) {
            auto piece = board_[row][col];
            if (piece && piece->getType() == PieceType::King && piece->getColor() == kingColor) {
                return { row, col };
            }
        }
    }
    return { -1, -1 }; 
}

bool ChessValidator::isKingInCheck(Color kingColor) {
    Coords kingPos = findKing(kingColor);
    if (kingPos.x == -1) return false; 

    return isSquareAttacked(kingPos, kingColor);
}

bool ChessValidator::isSquareAttacked(const Coords& position, Color defendingColor) {
    Color attackingColor = (defendingColor == Color::White) ? Color::Black : Color::White;

    // Check pawn attacks
    int pawnDirection = (defendingColor == Color::White) ? 1 : -1;
    std::vector<Coords> pawnCaptures = {
        {position.x + pawnDirection, position.y - 1},
        {position.x + pawnDirection, position.y + 1}
    };

    for (const auto& capture : pawnCaptures) {
        if (isValidPosition(capture)) {
            auto piece = board_[capture.x][capture.y];
            if (piece && piece->getType() == PieceType::Pawn && piece->getColor() == attackingColor) {
                return true;
            }
        }
    }

    // Check knight attacks
    const std::vector<Coords> knightOffsets = {
        {-2, -1}, {-2, 1}, {-1, -2}, {-1, 2},
        {1, -2}, {1, 2}, {2, -1}, {2, 1}
    };

    for (const auto& offset : knightOffsets) {
        Coords knightPos = { position.x + offset.x, position.y + offset.y };
        if (isValidPosition(knightPos)) {
            auto piece = board_[knightPos.x][knightPos.y];
            if (piece && piece->getType() == PieceType::Knight && piece->getColor() == attackingColor) {
                return true;
            }
        }
    }

    // Check diagonal attacks (bishop, queen)
    const std::vector<Coords> diagonalDirections = {
        {-1, -1}, {-1, 1}, {1, -1}, {1, 1}
    };

    for (const auto& dir : diagonalDirections) {
        for (int i = 1; i < 8; i++) {
            Coords checkPos = { position.x + i * dir.x, position.y + i * dir.y };
            if (!isValidPosition(checkPos)) break;

            auto piece = board_[checkPos.x][checkPos.y];
            if (piece) {
                if (piece->getColor() == attackingColor &&
                    (piece->getType() == PieceType::Bishop || piece->getType() == PieceType::Queen)) {
                    return true;
                }
                break; // Blocked by another piece
            }
        }
    }

    // Check horizontal/vertical attacks (rook, queen)
    const std::vector<Coords> straightDirections = {
        {-1, 0}, {1, 0}, {0, -1}, {0, 1}
    };

    for (const auto& dir : straightDirections) {
        for (int i = 1; i < 8; i++) {
            Coords checkPos = { position.x + i * dir.x, position.y + i * dir.y };
            if (!isValidPosition(checkPos)) break;

            auto piece = board_[checkPos.x][checkPos.y];
            if (piece) {
                if (piece->getColor() == attackingColor &&
                    (piece->getType() == PieceType::Rook || piece->getType() == PieceType::Queen)) {
                    return true;
                }
                break; // Blocked by another piece
            }
        }
    }

    // Check king attacks
    for (int dx = -1; dx <= 1; dx++) {
        for (int dy = -1; dy <= 1; dy++) {
            if (dx == 0 && dy == 0) continue;

            Coords kingPos = { position.x + dx, position.y + dy };
            if (isValidPosition(kingPos)) {
                auto piece = board_[kingPos.x][kingPos.y];
                if (piece && piece->getType() == PieceType::King && piece->getColor() == attackingColor) {
                    return true;
                }
            }
        }
    }

    return false;
}

bool ChessValidator::wouldMoveLeaveKingInCheck(const Coords& from, const Coords& to) {
    auto originalPiece = board_[from.x][from.y];
    auto capturedPiece = board_[to.x][to.y];

    board_[to.x][to.y] = originalPiece;
    board_[from.x][from.y] = nullptr;

    bool isEnPassantCapture = false;
    std::shared_ptr<Piece> enPassantCapturedPiece = nullptr;
    Coords enPassantCapturePos;

    if (originalPiece && originalPiece->getType() == PieceType::Pawn &&
        from.y != to.y && !capturedPiece) {
        enPassantCapturePos = { from.x, to.y };
        enPassantCapturedPiece = board_[enPassantCapturePos.x][enPassantCapturePos.y];
        board_[enPassantCapturePos.x][enPassantCapturePos.y] = nullptr;
        isEnPassantCapture = true;
    }

    bool kingInCheck = false;
    if (originalPiece) {
        kingInCheck = isKingInCheck(originalPiece->getColor());
    }

    board_[from.x][from.y] = originalPiece;
    board_[to.x][to.y] = capturedPiece;

    if (isEnPassantCapture) {
        board_[enPassantCapturePos.x][enPassantCapturePos.y] = enPassantCapturedPiece;
    }

    return kingInCheck;
}

bool ChessValidator::isPromotion(const Coords& from, const Coords& to) {
    auto piece = board_[from.x][from.y];
    if (!piece || piece->getType() != PieceType::Pawn) return false;

    return (piece->getColor() == Color::White && to.x == 0) ||
        (piece->getColor() == Color::Black && to.x == 7);
}

bool ChessValidator::isEnPassant(const Coords& from, const Coords& to) {
    auto piece = board_[from.x][from.y];
    if (!piece || piece->getType() != PieceType::Pawn) return false;
    if (from.y == to.y) return false; 
    if (board_[to.x][to.y]) return false;  
    if (lastMove_.first.x == -1) return false;  

    auto lastPiece = board_[lastMove_.second.x][lastMove_.second.y];
    if (!lastPiece || lastPiece->getType() != PieceType::Pawn) return false;
    if (lastPiece->getColor() == piece->getColor()) return false;

    if (std::abs(lastMove_.first.x - lastMove_.second.x) != 2) return false;
    if (lastMove_.second.y != to.y) return false;
    if (lastMove_.second.x != from.x) return false;

    return true;
}

bool ChessValidator::canCastle(const Coords& from, const Coords& to) {
    auto king = board_[from.x][from.y];
    if (!king || king->getType() != PieceType::King || king->getHasMoved()) return false;
    if (from.x != to.x || std::abs(from.y - to.y) != 2) return false;

    int row = from.x;
    int rookCol = (to.y > from.y) ? 7 : 0;
    auto rook = board_[row][rookCol];
    if (!rook || rook->getType() != PieceType::Rook || rook->getHasMoved()) return false;

    int step = (to.y > from.y) ? 1 : -1;
    for (int col = from.y + step; col != rookCol; col += step) {
        if (board_[row][col]) return false;
    }

    if (isKingInCheck(king->getColor())) return false;

    for (int col = from.y; col != to.y; col += step) {
        if (isSquareAttacked({ row, col }, king->getColor())) return false;
    }

    return true;
}

std::string ChessValidator::getBoardAsFen() const {
    std::stringstream fen;

    for (int row = 0; row < 8; row++) {
        int emptyCount = 0;

        for (int col = 0; col < 8; col++) {
            auto piece = board_[row][col];

            if (piece) {
                if (emptyCount > 0) {
                    fen << emptyCount;
                    emptyCount = 0;
                }

                char pieceChar;
                switch (piece->getType()) {
                case PieceType::Pawn: pieceChar = 'p'; break;
                case PieceType::Knight: pieceChar = 'n'; break;
                case PieceType::Bishop: pieceChar = 'b'; break;
                case PieceType::Rook: pieceChar = 'r'; break;
                case PieceType::Queen: pieceChar = 'q'; break;
                case PieceType::King: pieceChar = 'k'; break;
                default: pieceChar = '?';
                }

                if (piece->getColor() == Color::White) {
                    pieceChar = std::toupper(pieceChar);
                }

                fen << pieceChar;
            }
            else {
                emptyCount++;
            }
        }

        if (emptyCount > 0) {
            fen << emptyCount;
        }

        if (row < 7) {
            fen << '/';
        }
    }

    fen << ' ' << (currentTurn_ == Color::White ? 'w' : 'b');

    std::string castling;
    auto whiteKing = board_[7][4];
    auto whiteKingsideRook = board_[7][7];
    if (whiteKing && whiteKing->getType() == PieceType::King && !whiteKing->getHasMoved() &&
        whiteKingsideRook && whiteKingsideRook->getType() == PieceType::Rook && !whiteKingsideRook->getHasMoved()) {
        castling += 'K';
    }

    // White queenside
    auto whiteQueensideRook = board_[7][0];
    if (whiteKing && whiteKing->getType() == PieceType::King && !whiteKing->getHasMoved() &&
        whiteQueensideRook && whiteQueensideRook->getType() == PieceType::Rook && !whiteQueensideRook->getHasMoved()) {
        castling += 'Q';
    }

    // Black kingside
    auto blackKing = board_[0][4];
    auto blackKingsideRook = board_[0][7];
    if (blackKing && blackKing->getType() == PieceType::King && !blackKing->getHasMoved() &&
        blackKingsideRook && blackKingsideRook->getType() == PieceType::Rook && !blackKingsideRook->getHasMoved()) {
        castling += 'k';
    }

    // Black queenside
    auto blackQueensideRook = board_[0][0];
    if (blackKing && blackKing->getType() == PieceType::King && !blackKing->getHasMoved() &&
        blackQueensideRook && blackQueensideRook->getType() == PieceType::Rook && !blackQueensideRook->getHasMoved()) {
        castling += 'q';
    }

    if (castling.empty()) {
        castling = "-";
    }

    fen << ' ' << castling;

    // En passant target square
    std::string enPassantTarget = "-";
    if (lastMove_.first.x != -1) {
        auto lastMovedPiece = board_[lastMove_.second.x][lastMove_.second.y];
        if (lastMovedPiece && lastMovedPiece->getType() == PieceType::Pawn) {
            if (std::abs(lastMove_.first.x - lastMove_.second.x) == 2) {
                int epRow = (lastMove_.first.x + lastMove_.second.x) / 2;
                char file = 'a' + lastMove_.second.y;
                char rank = '8' - epRow;
                enPassantTarget = std::string(1, file) + std::string(1, rank);
            }
        }
    }

    fen << ' ' << enPassantTarget;
    fen << " 0 1";

    return fen.str();
}

bool ChessValidator::setBoardFromFen(const std::string& fen) {
    for (auto& row : board_) {
        for (auto& cell : row) {
            cell = nullptr;
        }
    }

    std::istringstream ss(fen);
    std::string boardPos, activeColor, castling, enPassant, halfMove, fullMove;

    if (!(ss >> boardPos)) return false;

    int row = 0, col = 0;
    for (char c : boardPos) {
        if (c == '/') {
            row++;
            col = 0;
        }
        else if (std::isdigit(c)) {
            col += c - '0';
        }
        else {
            Color color = std::isupper(c) ? Color::White : Color::Black;
            PieceType type;

            switch (std::tolower(c)) {
            case 'p': type = PieceType::Pawn; break;
            case 'n': type = PieceType::Knight; break;
            case 'b': type = PieceType::Bishop; break;
            case 'r': type = PieceType::Rook; break;
            case 'q': type = PieceType::Queen; break;
            case 'k': type = PieceType::King; break;
            default: return false; // Invalid piece
            }

            board_[row][col] = createPiece(type, color);
            col++;
        }
    }

    // Parse active color
    if (!(ss >> activeColor)) return false;
    currentTurn_ = (activeColor == "w") ? Color::White : Color::Black;

    // Parse castling availability
    if (!(ss >> castling)) return false;
    for (char c : castling) {
        if (c == 'K') {
            if (board_[7][4] && board_[7][7]) {
                board_[7][4]->setHasMoved();
                board_[7][7]->setHasMoved();
            }
        }
        else if (c == 'Q') {
            if (board_[7][4] && board_[7][0]) {
                board_[7][4]->setHasMoved();
                board_[7][0]->setHasMoved();
            }
        }
        else if (c == 'k') {
            if (board_[0][4] && board_[0][7]) {
                board_[0][4]->setHasMoved();
                board_[0][7]->setHasMoved();
            }
        }
        else if (c == 'q') {
            if (board_[0][4] && board_[0][0]) {
                board_[0][4]->setHasMoved();
                board_[0][0]->setHasMoved();
            }
        }
    }

    // Parse en passant target square
    if (!(ss >> enPassant)) return false;
    if (enPassant != "-") {
        int epCol = enPassant[0] - 'a';
        int epRow = '8' - enPassant[1];

        // We need to infer the last move based on the en passant square
        int pawnRow = (epRow == 2) ? 3 : 4;
        lastMove_.first = { (epRow == 2) ? 1 : 6, epCol };
        lastMove_.second = { pawnRow, epCol };
    }
    else {
        lastMove_.first = { -1, -1 };
        lastMove_.second = { -1, -1 };
    }

    // Parse halfmove clock and fullmove number
    ss >> halfMove >> fullMove;

    return true;
}