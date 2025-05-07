import Board from "./board";
import { Piece } from "./pieces/piece";

export default class BoardHistory {
  private boardHistory: Board[];

  constructor(board?: (Piece | null)[][]) {
    this.boardHistory = [];
    if (board) {
      const newBoard = new Board(board);
      this.boardHistory.push(newBoard);
    }
  }

  public addHistory(board: (Piece | null)[][]): boolean {
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
