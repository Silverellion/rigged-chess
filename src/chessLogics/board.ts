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

  public getLegalMoves(row: number, col: number): Coords[] {
    const piece: Piece | null = this.board[row][col];
    if (piece instanceof Pawn || piece instanceof Knight || piece instanceof Bishop || piece instanceof Rook || piece instanceof King || piece instanceof Queen) {
      return piece.getMoves({ x: row, y: col }, this.board);
    }
    return [];
  }

  public printBoard(): void {
    this.board.forEach((row) => {
      console.log(row);
    });
  }
}
