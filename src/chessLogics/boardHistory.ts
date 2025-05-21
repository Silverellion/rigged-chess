import Board from "./board";
import { Piece } from "./pieces/piece";
import { Coords, FENChar } from "./interface";

export default class BoardHistory {
  private boardHistory: Board[];
  private currentTurnCycle: number = 0; // When currentTurnCycle reaches 1, it resets to 0 and increase turn count by 1.
  private currentTurnCount: number = 1;
  private moveLog: string[] = [];

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

  public getMoveLog(): string[] {
    return this.moveLog;
  }

  public logMove(toCoords: Coords, pieceName: FENChar, board: Board): void {
    const toNotation = board.getNotation(toCoords);

    let pieceSymbol = "";
    switch (pieceName) {
      case FENChar.WhiteKnight:
      case FENChar.BlackKnight:
        pieceSymbol = "N";
        break;
      case FENChar.WhiteBishop:
      case FENChar.BlackBishop:
        pieceSymbol = "B";
        break;
      case FENChar.WhiteRook:
      case FENChar.BlackRook:
        pieceSymbol = "R";
        break;
      case FENChar.WhiteQueen:
      case FENChar.BlackQueen:
        pieceSymbol = "Q";
        break;
      case FENChar.WhiteKing:
      case FENChar.BlackKing:
        pieceSymbol = "K";
        break;
    }

    const moveNotation = `${pieceSymbol}${toNotation}`;
    if (this.currentTurnCycle === 0) {
      this.moveLog.push(`${this.currentTurnCount}. ${moveNotation}`);
      this.currentTurnCycle = 1;
    } else {
      const lastIndex = this.moveLog.length - 1;
      this.moveLog[lastIndex] = `${this.moveLog[lastIndex]} ${moveNotation}`;
      this.currentTurnCycle = 0;
      this.currentTurnCount++;
    }

    console.log(this.moveLog[this.moveLog.length - 1]);
  }

  public printHistory(index: number): void {
    const board = this.boardHistory[index];
    board.printBoard();
  }
}
