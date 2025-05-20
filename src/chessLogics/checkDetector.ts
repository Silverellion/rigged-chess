import { Color, Coords } from "./interface";
import Board from "./board";
import { King } from "./pieces/king";
import { Pawn } from "./pieces/pawn";
import { Knight } from "./pieces/knight";
import { Bishop } from "./pieces/bishop";
import { Rook } from "./pieces/rook";
import { Queen } from "./pieces/queen";

export default class CheckDetector {
  /**
   * Determines if the specified king is in check on the current board.
   *
   * @param board - Current chess board.
   * @param kingColor - Color of the king to check.
   * @returns True if the king is in check, false otherwise.
   */
  public static isKingInCheck(board: Board, kingColor: Color): boolean {
    const kingPosition = board.findFirstMatchingPiece((piece) => piece instanceof King && piece.getColor() === kingColor);
    if (!kingPosition) return false;
    return this.isSquareAttacked(board, kingPosition, kingColor);
  }

  /**
   * Determines if moving a piece would leave or put the player's king in check.
   *
   * @param board - Current chess board.
   * @param from - Starting coordinates of the piece to move.
   * @param to - Destination coordinates for the piece.
   * @returns True if the move would leave the player's king in check, false otherwise.
   */
  public static wouldMoveLeaveKingInCheck(board: Board, from: Coords, to: Coords): boolean {
    const boardState = board.getBoard();
    const movingPiece = boardState[from.x][from.y];

    if (!movingPiece) return false;

    const pieceColor = movingPiece.getColor();

    const tempBoardState = boardState.map((row) => [...row]);
    tempBoardState[to.x][to.y] = movingPiece;
    tempBoardState[from.x][from.y] = null;

    const tempBoard = new Board(tempBoardState);
    const inCheck = this.isKingInCheck(tempBoard, pieceColor);

    return inCheck;
  }

  /**
   * Filters a list of possible moves to exclude those that would leave the king in check.
   *
   * @param board - Current chess board.
   * @param from - Starting position of the piece.
   * @param possibleMoves - List of candidate destination coordinates.
   * @returns Array of legal moves that don't leave the king in check.
   */
  public static filterLegalMoves(board: Board, from: Coords, possibleMoves: Coords[]): Coords[] {
    return possibleMoves.filter((to) => !this.wouldMoveLeaveKingInCheck(board, from, to));
  }

  /**
   * Determines if a particular square is under attack by any opponent piece.
   *
   * @param board - Current chess board.
   * @param position - The coordinates to check.
   * @param defenderColor - Color of the defending side.
   * @returns True if the square is attacked, false otherwise.
   */
  public static isSquareAttacked(board: Board, position: Coords, defenderColor: Color): boolean {
    const boardState = board.getBoard();
    const attackerColor = defenderColor === Color.White ? Color.Black : Color.White;
    const opposingPieces = board.findAllMatchingPieces((piece) => piece !== null && piece.getColor() === attackerColor);

    for (const piecePosition of opposingPieces) {
      const piece = boardState[piecePosition.x][piecePosition.y];
      if (!piece) continue;

      // prettier-ignore
      if (piece instanceof Pawn || piece instanceof Knight || piece instanceof Bishop || 
          piece instanceof Rook || piece instanceof Queen || piece instanceof King) {
        const moves = piece.getMoves({ x: piecePosition.x, y: piecePosition.y }, boardState);
        if (moves.some((move) => move.x === position.x && move.y === position.y)) {
          return true;
        }
      }
    }

    return false;
  }
}
