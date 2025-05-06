import Board from "./chessLogics/board";
import BoardHistory from "./chessLogics/boardHistory";

declare global {
  interface Window {
    printBoard: () => void;
    printHistory: (index: number) => void;
  }
}

function printBoardCommands(board: Board, boardHistory: BoardHistory) {
  window.printBoard = () => board.printBoard();
  window.printHistory = (index: number) => boardHistory.printHistory(index);
}

export { printBoardCommands };
