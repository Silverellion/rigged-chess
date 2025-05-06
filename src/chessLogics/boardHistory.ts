import Board from "./board";
import { FEN } from "./interface";

export default class BoardHistory {
  private boardHistory: Board[];

  constructor(board?: FEN[][]) {
    this.boardHistory = [];
    if (board) {
      const newBoard = new Board(board);
      this.boardHistory.push(newBoard);
    }
  }

  public addHistory(board: FEN[][]): boolean {
    const newBoard = new Board(board);
    this.boardHistory.push(newBoard);
    return true;
  }

  public getHistory(): Board[] {
    return this.boardHistory;
  }

  public printHistory(index: number): void {
    const board = this.boardHistory[index];
    board.printBoard();
  }
}
