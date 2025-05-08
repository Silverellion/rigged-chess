import { Color, Coords } from "../interface";
import { King } from "../pieces/king";
import { Rook } from "../pieces/rook";
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

    if (!(king instanceof King) || king.getHasMoved()) return castlingMoves;
    if (board.isKingInCheck(color)) return castlingMoves;

    const kingsideRookPos = board.findFirstMatchingPiece((piece) => piece instanceof Rook && piece.getColor() === color && !piece.getHasMoved() && (color === Color.White ? piece === boardState[7][7] : piece === boardState[0][7]));

    if (kingsideRookPos && this.canCastleKingside(board, kingPosition, kingsideRookPos, color)) {
      castlingMoves.push({ x: kingPosition.x, y: kingPosition.y + 2 });
    }

    const queensideRookPos = board.findFirstMatchingPiece((piece) => piece instanceof Rook && piece.getColor() === color && !piece.getHasMoved() && (color === Color.White ? piece === boardState[7][0] : piece === boardState[0][0]));

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

    const color = king.getColor();
    const isKingside = targetPosition.y > kingPosition.y;

    const rookPosition = board.findFirstMatchingPiece((piece) => piece instanceof Rook && piece.getColor() === color && !piece.getHasMoved() && (isKingside ? (color === Color.White ? piece === boardState[7][7] : piece === boardState[0][7]) : color === Color.White ? piece === boardState[7][0] : piece === boardState[0][0]));

    if (!rookPosition) return null;

    const newBoardState = boardState.map((row) => [...row]);

    // Move the king
    newBoardState[targetPosition.x][targetPosition.y] = king;
    newBoardState[kingPosition.x][kingPosition.y] = null;
    (king as King).setHasMoved();

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
    return board
      .findAllMatchingPieces((piece) => piece !== null && piece.getColor() !== kingColor)
      .some((attckingPiecePosition) => {
        const moves = board.getLegalMoves(attckingPiecePosition.x, attckingPiecePosition.y);
        return moves.some((move) => move.x === position.x && move.y === position.y);
      });
  }
}
