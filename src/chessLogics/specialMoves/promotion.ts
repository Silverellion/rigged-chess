import { Color, Coords, FENChar } from "../interface";
import Board from "../board";
import { Pawn } from "../pieces/pawn";
import { Knight } from "../pieces/knight";
import { Bishop } from "../pieces/bishop";
import { Rook } from "../pieces/rook";
import { Queen } from "../pieces/queen";

export default class Promotion {
  /**
   * Checks if a pawn can be promoted.
   *
   * @param fromCoords - The current position of the pawn
   * @param toCoords - The destination position of the pawn
   * @param board - The current chess board
   * @returns True if the pawn can be promoted after this move
   */
  public static canPromote(fromCoords: Coords, toCoords: Coords, board: Board): boolean {
    const boardState = board.getBoard();
    const piece = boardState[fromCoords.x][fromCoords.y];

    if (!(piece instanceof Pawn)) return false;
    const targetRank = toCoords.x;
    return (piece.getColor() === Color.White && targetRank === 0) || (piece.getColor() === Color.Black && targetRank === 7);
  }

  /**
   * Performs the promotion of a pawn.
   *
   * @param fromCoords - The current position of the pawn
   * @param toCoords - The destination position of the pawn
   * @param board - The current chess board
   * @param promoteTo - The piece to promote to (Q, R, B, N)
   * @returns A new board with the promotion applied
   */
  public static performPromotion(fromCoords: Coords, toCoords: Coords, board: Board, promoteTo: FENChar): Board | null {
    const boardState = board.getBoard();
    const piece = boardState[fromCoords.x][fromCoords.y];

    if (!(piece instanceof Pawn)) return null;

    const color = piece.getColor();
    const newBoardState = boardState.map((row) => [...row]);

    newBoardState[toCoords.x][toCoords.y] = null;
    newBoardState[fromCoords.x][fromCoords.y] = null;

    let promotedPiece;
    switch (promoteTo) {
      case FENChar.WhiteQueen:
      case FENChar.BlackQueen:
        promotedPiece = new Queen(color);
        break;
      case FENChar.WhiteRook:
      case FENChar.BlackRook:
        promotedPiece = new Rook(color);
        break;
      case FENChar.WhiteBishop:
      case FENChar.BlackBishop:
        promotedPiece = new Bishop(color);
        break;
      case FENChar.WhiteKnight:
      case FENChar.BlackKnight:
        promotedPiece = new Knight(color);
        break;
      default:
        promotedPiece = new Queen(color); // Default to queen
    }

    newBoardState[toCoords.x][toCoords.y] = promotedPiece;
    return new Board(newBoardState);
  }
}
