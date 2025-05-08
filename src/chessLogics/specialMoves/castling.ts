import { Color, Coords } from "../interface";
import { Piece } from "../pieces/piece";
import { King } from "../pieces/king";
import { Rook } from "../pieces/rook";
import Board from "../board";

export default class Castling {
  /**
   * Retrieves all possible castling moves for a king at the specified position
   *
   * @param from - The current position of the king
   * @param board - The current state of the chess board
   * @returns Valid Coords[] of where the king can move to castle
   */
  public static getCastlingMoves(from: Coords, board: (Piece | null)[][]): Coords[] {
    const castlingMoves: Coords[] = [];
    const piece = board[from.x][from.y];

    if (!(piece instanceof King) || piece.getHasMoved() || piece.getIsInCheck() || !piece.getCanCastle()) {
      return [];
    }

    const color = piece.getColor();
    const row = color === Color.White ? 7 : 0;
    const boardInstance = new Board(board);

    if (this.canCastleKingside(board, row, color, boardInstance)) {
      castlingMoves.push({ x: 6, y: row });
    }

    if (this.canCastleQueenside(board, row, color, boardInstance)) {
      castlingMoves.push({ x: 2, y: row });
    }

    return castlingMoves;
  }

  private static canCastleKingside(board: (Piece | null)[][], row: number, color: Color, boardInstance: Board): boolean {
    if (board[5][row] !== null || board[6][row] !== null) return false;
    const rook = board[7][row];
    if (!(rook instanceof Rook) || rook.getHasMoved()) return false;
    return !this.isPathUnderAttack(boardInstance, [4, 5, 6], row, color);
  }

  private static canCastleQueenside(board: (Piece | null)[][], row: number, color: Color, boardInstance: Board): boolean {
    if (board[1][row] !== null || board[2][row] !== null || board[3][row] !== null) return false;
    const rook = board[0][row];
    if (!(rook instanceof Rook) || rook.getHasMoved()) return false;
    return !this.isPathUnderAttack(boardInstance, [4, 3, 2], row, color);
  }

  private static isPathUnderAttack(boardInstance: Board, cols: number[], row: number, kingColor: Color): boolean {
    const oppositeColor = kingColor === Color.White ? Color.Black : Color.White;

    for (const col of cols) {
      const attackingPieces = boardInstance.findAllMatchingPieces((piece) => piece !== null && piece.getColor() === oppositeColor);

      for (const piecePosition of attackingPieces) {
        const moves = boardInstance.getLegalMoves(piecePosition.x, piecePosition.y);
        if (moves.some((move) => move.x === col && move.y === row)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Executes castling, relocating both the king and rook to their appropriate positions
   *
   * @param board - The current state of the chess board
   * @param kingPosition - The current position of the king before castling
   * @param kingTargetPosition - The target position where the king will move during castling
   * @returns A new board state after the castling move has been performed
   */
  public static performCastling(board: (Piece | null)[][], kingPosition: Coords, kingTargetPosition: Coords): (Piece | null)[][] {
    const newBoard = board.map((row) => [...row]);
    const king = newBoard[kingPosition.x][kingPosition.y];
    const row = kingPosition.y;

    // Move the king
    newBoard[kingTargetPosition.x][kingTargetPosition.y] = king;
    newBoard[kingPosition.x][kingPosition.y] = null;

    // Move the rook
    if (kingTargetPosition.x === 6) {
      const rook = newBoard[7][row];
      newBoard[5][row] = rook;
      newBoard[7][row] = null;
    } else if (kingTargetPosition.x === 2) {
      const rook = newBoard[0][row];
      newBoard[3][row] = rook;
      newBoard[0][row] = null;
    }

    return newBoard;
  }
}
