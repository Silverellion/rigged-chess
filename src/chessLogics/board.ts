import { FEN } from "./interface";

export default class Board {
  private board: FEN[][];
  private static defaultBoard: FEN[][] = [
    [
      FEN.BlackRook,
      FEN.BlackKnight,
      FEN.BlackBishop,
      FEN.BlackKing,
      FEN.BlackQueen,
      FEN.BlackBishop,
      FEN.BlackKnight,
      FEN.BlackRook,
    ],
    [
      FEN.BlackPawn,
      FEN.BlackPawn,
      FEN.BlackPawn,
      FEN.BlackPawn,
      FEN.BlackPawn,
      FEN.BlackPawn,
      FEN.BlackPawn,
      FEN.BlackPawn,
    ],
    [
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
    ],
    [
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
    ],
    [
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
    ],
    [
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
      FEN.empty,
    ],
    [
      FEN.WhitePawn,
      FEN.WhitePawn,
      FEN.WhitePawn,
      FEN.WhitePawn,
      FEN.WhitePawn,
      FEN.WhitePawn,
      FEN.WhitePawn,
      FEN.WhitePawn,
    ],
    [
      FEN.WhiteRook,
      FEN.WhiteKnight,
      FEN.WhiteBishop,
      FEN.WhiteKing,
      FEN.WhiteQueen,
      FEN.WhiteBishop,
      FEN.WhiteKnight,
      FEN.WhiteRook,
    ],
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

  public printBoard(): void {
    console.log(this.board);
  }
}
