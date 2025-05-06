import { FEN, Color, Coords } from "./interface";
import { Pawn } from "./pieces/pawn";
import { Knight } from "./pieces/knight";
import { Bishop } from "./pieces/bishop";
import { Rook } from "./pieces/rook";
import { Queen } from "./pieces/queen";
import { King } from "./pieces/king";

export default class Board {
  private board: FEN[][];
  private static defaultBoard: FEN[][] = [
    [FEN.BlackRook, FEN.BlackKnight, FEN.BlackBishop, FEN.BlackKing, FEN.BlackQueen, FEN.BlackBishop, FEN.BlackKnight, FEN.BlackRook],
    [FEN.BlackPawn, FEN.BlackPawn, FEN.BlackPawn, FEN.BlackPawn, FEN.BlackPawn, FEN.BlackPawn, FEN.BlackPawn, FEN.BlackPawn],
    [FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty],
    [FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty],
    [FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty],
    [FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty, FEN.empty],
    [FEN.WhitePawn, FEN.WhitePawn, FEN.WhitePawn, FEN.WhitePawn, FEN.WhitePawn, FEN.WhitePawn, FEN.WhitePawn, FEN.WhitePawn],
    [FEN.WhiteRook, FEN.WhiteKnight, FEN.WhiteBishop, FEN.WhiteKing, FEN.WhiteQueen, FEN.WhiteBishop, FEN.WhiteKnight, FEN.WhiteRook],
  ];

  constructor(board?: FEN[][]) {
    this.board = board || Board.defaultBoard;
  }

  public getBoard(): FEN[][] {
    return this.board;
  }

  public setBoard(board: FEN[][]): void {
    this.board = board;
  }

  public getLegalMoves(row: number, col: number, fen: FEN): Coords[] {
    const piece = this.board[row][col];
    if (fen === FEN.BlackPawn || fen === FEN.WhitePawn) {
      const color = piece === FEN.BlackPawn ? Color.Black : Color.White;
      return new Pawn(color).getMoves({ x: row, y: col }, this.board);
    }
    if (fen === FEN.BlackKnight || fen === FEN.WhiteKnight) {
      const color = piece === FEN.BlackKnight ? Color.Black : Color.White;
      return new Knight(color).getMoves({ x: row, y: col }, this.board);
    }
    if (fen === FEN.BlackBishop || fen === FEN.WhiteBishop) {
      const color = piece === FEN.BlackBishop ? Color.Black : Color.White;
      return new Bishop(color).getMoves({ x: row, y: col }, this.board);
    }
    if (fen === FEN.BlackRook || fen === FEN.WhiteRook) {
      const color = piece === FEN.BlackRook ? Color.Black : Color.White;
      return new Rook(color).getMoves({ x: row, y: col }, this.board);
    }
    if (fen === FEN.BlackQueen || fen === FEN.WhiteQueen) {
      const color = piece === FEN.BlackQueen ? Color.Black : Color.White;
      return new Queen(color).getMoves({ x: row, y: col }, this.board);
    }
    if (fen === FEN.BlackKing || fen === FEN.WhiteKing) {
      const color = piece === FEN.BlackKing ? Color.Black : Color.White;
      return new King(color).getMoves({ x: row, y: col }, this.board);
    }
    return [];
  }

  public printBoard(): void {
    this.board.forEach((row) => {
      console.log(row);
    });
  }
}
