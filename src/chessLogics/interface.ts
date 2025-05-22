export enum FENChar {
  BlackPawn = "p",
  BlackKnight = "n",
  BlackBishop = "b",
  BlackRook = "r",
  BlackQueen = "q",
  BlackKing = "k",

  WhitePawn = "P",
  WhiteKnight = "N",
  WhiteBishop = "B",
  WhiteRook = "R",
  WhiteQueen = "Q",
  WhiteKing = "K",

  empty = " ",
}

export enum Color {
  White = "white",
  Black = "black",
}

export interface Coords {
  x: number;
  y: number;
}

export enum ActionType {
  GameStart = "gameStart",
  GameEnd = "gameEnd",
  Normal = "normalMove",
  Capture = "capture",
  Castle = "castle",
  Check = "check",
  CheckWarning = "checkWarning",
  Promote = "promote",
  Premove = "premove",
  LowOnTime = "lowOnTime",
  EnPassant = "enPassant",
}
