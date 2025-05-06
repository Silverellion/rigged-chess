import { FEN, Color, Coords } from "./interface";
import { Rook } from "./pieces/rook";

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
    if (fen === FEN.BlackRook || fen === FEN.WhiteRook) return this.getLegalRookMoves(row, col);
    return [];
  }

  private getLegalRookMoves(row: number, col: number): Coords[] {
    const piece = this.board[row][col];
    const color = piece === "r" ? Color.Black : Color.White;
    const rook = new Rook(color);
    return rook.getSlidingMoves({ x: row, y: col }, this.board);
  }

  public printBoard(): void {
    this.board.forEach((row) => {
      console.log(row);
    });
  }
}
