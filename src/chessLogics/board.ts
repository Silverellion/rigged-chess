export default class Board {
  private board: string[][];
  private static defaultBoard: string[][] = [
    ["r", "n", "b", "k", "q", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " "],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "K", "Q", "B", "N", "R"],
  ];

  constructor(board?: string[][]) {
    this.board = board || Board.defaultBoard;
  }

  public getBoard(): string[][] {
    return this.board;
  }

  public setBoard(board: string[][]): void {
    this.board = board;
  }

  public printBoard(): void {
    console.log(this.board);
  }
}
