import Board from "./board";

export default class BoardHistory {
  private boardHistory: Board[];

  constructor() {
    this.boardHistory = [];
  }

  public addHistory(board: string[][]): boolean {
    const newBoard = new Board(board);
    this.boardHistory.push(newBoard);
    return true;
  }

  public getHistory(): Board[] {
    return this.boardHistory;
  }
}
