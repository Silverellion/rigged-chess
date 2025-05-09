import { Color, Coords } from "../interface";
import { Pawn } from "../pieces/pawn";
import Board from "../board";

export default class EnPassant {
  /**
   * Checks if en passant capture is possible for a pawn.
   *
   * @param board - Current chess board.
   * @param pawnPosition - Position of the pawn.
   * @param color - Color of the pawn.
   * @param lastMove - The last move made on the board.
   * @returns Array of coordinates where the pawn can move via en passant.
   */
  public static getMoves(board: Board, pawnPosition: Coords, color: Color, lastMove: [Coords, Coords] | null): Coords[] {
    const enPassantMoves: Coords[] = [];
    if (!lastMove) return enPassantMoves;

    const boardState = board.getBoard();
    const pawn = boardState[pawnPosition.x][pawnPosition.y];

    if (!(pawn instanceof Pawn)) return enPassantMoves;

    const [fromPosition, toPosition] = lastMove;
    const lastMovedPiece = boardState[toPosition.x][toPosition.y];

    // Check if last move was a pawn moving two squares
    if (!(lastMovedPiece instanceof Pawn)) return enPassantMoves;
    if (lastMovedPiece.getColor() === color) return enPassantMoves;
    if (Math.abs(fromPosition.x - toPosition.x) !== 2) return enPassantMoves;

    // Check if our pawn is adjacent to the enemy pawn
    if (pawnPosition.x !== toPosition.x) return enPassantMoves;
    if (Math.abs(pawnPosition.y - toPosition.y) !== 1) return enPassantMoves;

    // Determine the en passant capture square
    const direction = color === Color.White ? -1 : 1;
    enPassantMoves.push({ x: pawnPosition.x + direction, y: toPosition.y });

    return enPassantMoves;
  }

  /**
   * Performs the en passant capture on the board.
   *
   * @param board - Current chess board.
   * @param fromPosition - Current position of the pawn.
   * @param toPosition - Position where the pawn will move to.
   * @returns A new board with the en passant capture applied, or null if invalid.
   */
  public static performEnPassant(board: Board, fromPosition: Coords, toPosition: Coords): Board | null {
    const boardState = board.getBoard();
    const pawn = boardState[fromPosition.x][fromPosition.y];

    if (!(pawn instanceof Pawn)) return null;

    const newBoardState = boardState.map((row) => [...row]);
    // Move the pawn
    newBoardState[toPosition.x][toPosition.y] = pawn;
    newBoardState[fromPosition.x][fromPosition.y] = null;
    // Remove the captured pawn
    newBoardState[fromPosition.x][toPosition.y] = null;

    return new Board(newBoardState);
  }

  /**
   * Checks if a move is an en passant capture.
   *
   * @param fromPosition - Starting position of the pawn.
   * @param toPosition - Target position for the pawn.
   * @param board - The current chess board.
   * @returns True if the move is an en passant capture.
   */
  public static isEnPassantCapture(fromPosition: Coords, toPosition: Coords, board: Board): boolean {
    const boardState = board.getBoard();
    const piece = boardState[fromPosition.x][fromPosition.y];

    if (!(piece instanceof Pawn)) return false;

    // Check if pawn is moving diagonally to an empty square
    if (Math.abs(fromPosition.y - toPosition.y) !== 1) return false;
    const direction = piece.getColor() === Color.White ? -1 : 1;
    if (toPosition.x - fromPosition.x !== direction) return false;
    if (boardState[toPosition.x][toPosition.y] !== null) return false;

    // Check if there's a pawn to capture
    const capturedPawnPos = { x: fromPosition.x, y: toPosition.y };
    const capturedPiece = boardState[capturedPawnPos.x][capturedPawnPos.y];

    return capturedPiece instanceof Pawn && capturedPiece.getColor() !== piece.getColor();
  }
}
