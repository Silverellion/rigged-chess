import { Color, Coords } from "./interface";
import { Piece } from "./pieces/piece";
import { Pawn } from "./pieces/pawn";
import { Knight } from "./pieces/knight";
import { Bishop } from "./pieces/bishop";
import { Rook } from "./pieces/rook";
import { Queen } from "./pieces/queen";
import { King } from "./pieces/king";

export default class Board {
  private board: (Piece | null)[][];
  private static defaultBoard: (Piece | null)[][] = [
    [new Rook(Color.Black), new Knight(Color.Black), new Bishop(Color.Black), new Queen(Color.Black), new King(Color.Black), new Bishop(Color.Black), new Knight(Color.Black), new Rook(Color.Black)],
    [new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black)],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White)],
    [new Rook(Color.White), new Knight(Color.White), new Bishop(Color.White), new Queen(Color.White), new King(Color.White), new Bishop(Color.White), new Knight(Color.White), new Rook(Color.White)],
  ];

  constructor(board?: (Piece | null)[][]) {
    this.board = board || Board.defaultBoard;
  }

  public getBoard(): (Piece | null)[][] {
    return this.board;
  }

  public setBoard(board: (Piece | null)[][]): void {
    this.board = board;
  }

  /**
   * Retrieves all legal moves for a piece at the specified position on the board.
   *
   * This method examines the piece at the given row and column coordinates and
   * calculates all valid moves according to that piece's movement rules. The method
   * handles all chess piece types (Pawn, Knight, Bishop, Rook, Queen, and King)
   * and their specific movement patterns.
   *
   * @param row - The row index (0-7) of the piece on the chess board
   * @param col - The column index (0-7) of the piece on the chess board
   * @returns An array of Coords objects representing all legal destination squares
   *          for the piece, or an empty array if the square is empty or contains an invalid piece
   *
   * @example
   * // Get all legal moves for the piece at position (3,4)
   * const moves = board.getLegalMoves(3, 4);
   * console.log(moves); // [{x: 2, y: 3}, {x: 4, y: 5}, ...]
   */
  public getLegalMoves(row: number, col: number): Coords[] {
    const piece: Piece | null = this.board[row][col];
    if (piece instanceof Pawn || piece instanceof Knight || piece instanceof Bishop || piece instanceof Rook || piece instanceof King || piece instanceof Queen) {
      return piece.getMoves({ x: row, y: col }, this.board);
    }
    return [];
  }

  private isKingInCheck(color: Color): boolean {
    let kingPosition: Coords | null = null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece instanceof King && piece.getColor() === color) {
          kingPosition = { x: row, y: col };
          break;
        }
      }
      if (kingPosition) break;
    }
    if (!kingPosition) return false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        // Get the opponent's pieces by checking if the color is opposite.
        if (piece && piece.getColor() !== color) {
          const moves = this.getLegalMoves(row, col);
          if (moves.some((move) => move.x === kingPosition.x && move.y === kingPosition.y)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public updateCheckStatus(): void {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece instanceof King) {
          piece.setIsInCheck(this.isKingInCheck(piece.getColor()));
        }
      }
    }
  }

  public printBoard(): void {
    let result: string = "";
    this.board.forEach((row) => {
      row.forEach((piece) => {
        if (piece === null) result += "　";
        else {
          if (piece instanceof Pawn) piece.getColor() === Color.Black ? (result += "♟") : (result += "♙");
          if (piece instanceof Knight) piece.getColor() === Color.Black ? (result += "♞") : (result += "♘");
          if (piece instanceof Bishop) piece.getColor() === Color.Black ? (result += "♝") : (result += "♗");
          if (piece instanceof Rook) piece.getColor() === Color.Black ? (result += "♜") : (result += "♖");
          if (piece instanceof Queen) piece.getColor() === Color.Black ? (result += "♛") : (result += "♕");
          if (piece instanceof King) piece.getColor() === Color.Black ? (result += "♚") : (result += "♔");
        }
      });
      result += "\n";
    });
    console.log(result);
  }
}
