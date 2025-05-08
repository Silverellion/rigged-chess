import { Color, Coords } from "../interface";
import { Pawn } from "../pieces/pawn";
import { Knight } from "../pieces/knight";
import { Bishop } from "../pieces/bishop";
import { Rook } from "../pieces/rook";
import { Queen } from "../pieces/queen";
import { King } from "../pieces/king";
import Board from "../board";

export default class Castling {
  /**
   * Checks if castling is possible for the given King.
   *
   * @param board - Current chess board.
   * @param kingPosition - Position of the King.
   * @param color - Color of the King.
   * @returns Array of coordinates where the King can castle to.
   *
   * @example
   * // Get castling moves for the White King:
   * const kingPosition = board.findFirstMatchingPiece(p => p instanceof King && p.getColor() === Color.White);
   * const castlingMoves = Castling.getPossibleCastlingMoves(board, kingPosition, Color.White);
   */
  public static getPossibleCastlingMoves(board: Board, kingPosition: Coords, color: Color): Coords[] {
    const castlingMoves: Coords[] = [];
    const boardState = board.getBoard();
    const king = boardState[kingPosition.x][kingPosition.y];

    if (!(king instanceof King)) return castlingMoves;
    if (king.getHasMoved()) return castlingMoves;
    if (this.isSquareAttacked(board, kingPosition, color)) {
      king.setIsInCheck(true);
      return castlingMoves;
    }

    const rank = color === Color.White ? 7 : 0;
    const kingsideRookSquare = boardState[rank][7];
    const queensideRookSquare = boardState[rank][0];

    const kingsideRookPos = board.findFirstMatchingPiece((piece) => piece instanceof Rook && piece.getColor() === color && !piece.getHasMoved() && piece === kingsideRookSquare);
    if (kingsideRookPos && this.canCastleKingside(board, kingPosition, kingsideRookPos, color)) {
      castlingMoves.push({ x: kingPosition.x, y: kingPosition.y + 2 });
    }

    const queensideRookPos = board.findFirstMatchingPiece((piece) => piece instanceof Rook && piece.getColor() === color && !piece.getHasMoved() && piece === queensideRookSquare);
    if (queensideRookPos && this.canCastleQueenside(board, kingPosition, queensideRookPos, color)) {
      castlingMoves.push({ x: kingPosition.x, y: kingPosition.y - 2 });
    }

    return castlingMoves;
  }

  /**
   * Performs the castling move on the board.
   *
   * @param board - Current chess board.
   * @param kingPosition - Current position of the King.
   * @param targetPosition - Position where the King will move to.
   * @returns A new board with the castling move applied, or null if invalid.
   *
   * @example
   * // Perform castling for the White King:
   * const kingPosition = {x: 7, y: 4};
   * const castlePosition = {x: 7, y: 6}; // Kingside castling
   * const newBoard = Castling.performCastling(board, kingPosition, castlePosition);
   */
  public static performCastling(board: Board, kingPosition: Coords, targetPosition: Coords): Board | null {
    const boardState = board.getBoard();
    const king = boardState[kingPosition.x][kingPosition.y];

    if (!(king instanceof King)) return null;
    if (king.getHasMoved()) return null;

    const color = king.getColor();
    const isKingside = targetPosition.y > kingPosition.y;

    if (Math.abs(targetPosition.y - kingPosition.y) !== 2) return null;
    if (this.isSquareAttacked(board, kingPosition, color)) return null;

    // Find the corresponding rook
    const rank = color === Color.White ? 7 : 0;
    const file = isKingside ? 7 : 0;
    const targetRook = boardState[rank][file];
    const rookPosition = board.findFirstMatchingPiece((piece) => piece instanceof Rook && piece.getColor() === color && !piece.getHasMoved() && piece === targetRook);
    if (!rookPosition) return null;

    // Verify the path is clear
    if (isKingside) {
      if (!this.canCastleKingside(board, kingPosition, rookPosition, color)) return null;
    } else {
      if (!this.canCastleQueenside(board, kingPosition, rookPosition, color)) return null;
    }

    // Create new board state
    const newBoardState = boardState.map((row) => [...row]);

    // Move the king
    newBoardState[targetPosition.x][targetPosition.y] = king;
    newBoardState[kingPosition.x][kingPosition.y] = null;
    king.setHasMoved();

    // Move the rook
    const rook = newBoardState[rookPosition.x][rookPosition.y];
    const rookTargetY = isKingside ? kingPosition.y + 1 : kingPosition.y - 1;
    newBoardState[kingPosition.x][rookTargetY] = rook;
    newBoardState[rookPosition.x][rookPosition.y] = null;
    if (rook instanceof Rook) rook.setHasMoved();

    return new Board(newBoardState);
  }

  private static canCastleKingside(board: Board, kingPosition: Coords, rookPosition: Coords, color: Color): boolean {
    const boardState = board.getBoard();
    const { x: row, y: kingCol } = kingPosition;

    for (let col = kingCol + 1; col < rookPosition.y; col++) {
      if (boardState[row][col] !== null) {
        return false;
      }
    }

    const tempBoard = new Board(boardState);
    if (this.isSquareAttacked(tempBoard, { x: row, y: kingCol + 1 }, color) || this.isSquareAttacked(tempBoard, { x: row, y: kingCol + 2 }, color)) {
      return false;
    }
    return true;
  }

  private static canCastleQueenside(board: Board, kingPosition: Coords, rookPosition: Coords, color: Color): boolean {
    const boardState = board.getBoard();
    const { x: row, y: kingCol } = kingPosition;

    // Check if squares between king and rook are empty
    for (let col = rookPosition.y + 1; col < kingCol; col++) {
      if (boardState[row][col] !== null) {
        return false;
      }
    }

    // Check if king passes through check
    const tempBoard = new Board(boardState);
    if (this.isSquareAttacked(tempBoard, { x: row, y: kingCol - 1 }, color) || this.isSquareAttacked(tempBoard, { x: row, y: kingCol - 2 }, color)) {
      return false;
    }
    return true;
  }

  private static isSquareAttacked(board: Board, position: Coords, kingColor: Color): boolean {
    const boardState = board.getBoard();

    // Find all opposing pieces
    const opposingPieces = board.findAllMatchingPieces((piece) => piece !== null && piece.getColor() !== kingColor);
    for (const piecePos of opposingPieces) {
      const piece = boardState[piecePos.x][piecePos.y];
      if (!piece) continue;

      if (piece instanceof Pawn) {
        const direction = piece.getColor() === Color.White ? -1 : 1;
        if (piecePos.x + direction === position.x && (piecePos.y + 1 === position.y || piecePos.y - 1 === position.y)) {
          return true;
        }
        continue;
      }

      if (piece instanceof Knight || piece instanceof Bishop || piece instanceof Rook || piece instanceof Queen || piece instanceof King) {
        const basicMoves = piece.getMoves({ x: piecePos.x, y: piecePos.y }, boardState);
        if (basicMoves.some((move) => move.x === position.x && move.y === position.y)) {
          return true;
        }
      }
    }

    return false;
  }
}
