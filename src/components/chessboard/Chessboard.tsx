import React from "react";
import Board from "../../chessLogics/board";
import BoardHistory from "../../chessLogics/boardHistory";
import SetPiece from "./SetPiece";
import { isBlack } from "./ChessboardUtils";
import { printBoardCommands } from "../../consoleCommands";

const Chessboard: React.FC = () => {
  let _board = new Board().getBoard();
  const [boardHistory] = React.useState(() => new BoardHistory(_board));
  const [currentBoard, setCurrentBoard] = React.useState(() => _board);
  const [draggedPiece, setDraggedPiece] = React.useState<{ row: number; col: number } | null>(null);

  React.useEffect(() => {
    const _currentBoard = new Board(currentBoard);
    printBoardCommands(_currentBoard, boardHistory);
  });

  function handleDrop(toRow: number, toCol: number) {
    if (!draggedPiece) return;
    const fromRow = draggedPiece.row;
    const fromCol = draggedPiece.col;

    const tempBoard = new Board(currentBoard);
    const updatedBoard = tempBoard.handleMove({ x: fromRow, y: fromCol }, { x: toRow, y: toCol });
    if (!updatedBoard) return;

    const newBoardState = updatedBoard.getBoard();

    boardHistory.addHistory(newBoardState);
    setCurrentBoard(newBoardState);
    setDraggedPiece(null);
  }

  return (
    <>
      <div
        className="
          bg-transparent shadow-[4px_12px_12px_rgba(0,0,0,0.2)]
          grid grid-cols-8 aspect-square
        "
      >
        {currentBoard.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            return (
              <div
                key={rowIndex + "-" + colIndex}
                className={`
                    ${isBlack(rowIndex, colIndex) ? "bg-[rgba(200,80,80,0.4)]" : "bg-[rgba(255,255,255,0.4)]"}
                    aspect-square w-full flex items-center justify-center`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(rowIndex, colIndex)}
              >
                {piece !== null && <SetPiece pieceName={piece.getPieceName()} draggable={piece !== null} onDragStart={() => setDraggedPiece({ row: rowIndex, col: colIndex })} />}
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default Chessboard;
