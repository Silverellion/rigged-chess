import Game from "./chessLogics/game";

declare global {
  interface Window {
    printBoard: (index?: number) => void;
    printFEN: (index?: number) => string;
  }
}

function initiateConsoleCommands(game: Game) {
  printBoardCommands(game);
  printFENCommands(game);
}

function printFENCommands(game: Game) {
  const boardHistory = game.getBoardHistory();

  window.printFEN = (index?: number) => {
    const history = boardHistory.getHistory();

    if (index !== undefined) {
      if (index >= 0 && index < history.length) {
        const currentIndex = boardHistory.getCurrentHistoryIndex();
        boardHistory.setCurrentHistoryIndex(index);
        const fen = boardHistory.toFEN(index > 0 ? game.getLastMove() : null);
        boardHistory.setCurrentHistoryIndex(currentIndex);
        return fen;
      } else {
        console.warn(`Invalid history index: ${index}. Valid range: 0-${history.length - 1}`);
        return "";
      }
    }

    return boardHistory.toFEN(game.getLastMove());
  };
}

function printBoardCommands(game: Game) {
  const boardHistory = game.getBoardHistory();

  window.printBoard = (index?: number) => {
    if (index === undefined) {
      const currentIndex = boardHistory.getCurrentHistoryIndex();
      boardHistory.printHistory(currentIndex);
    } else {
      if (index >= 0 && index < boardHistory.getHistory().length) {
        boardHistory.printHistory(index);
      } else {
        console.warn(
          `Invalid history index: ${index}. 
           Valid range: 0-${boardHistory.getHistory().length - 1}`
        );
      }
    }
  };
}

export { initiateConsoleCommands };
