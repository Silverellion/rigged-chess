import Board from "./chessLogics/board";
import BoardHistory from "./chessLogics/boardHistory";

declare global {
  interface Window {
    printBoard: () => void;
  }
}

function printBoardCommands(board: Board, boardHistory: BoardHistory) {
  window.printBoard = (index?: number) => {
    if (!index) board.printBoard();
    else boardHistory.printHistory(index);
  };
}

export { printBoardCommands };
