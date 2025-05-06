import React from "react";
import Board from "../../chessLogics/board";
import SetPiece from "./SetPiece";
import { isBlack } from "./ChessboardUtils";

const Chessboard: React.FC = () => {
  const [currentBoard, setCurrentBoard] = React.useState(() =>
    new Board().getBoard()
  );
  const [draggedPiece, setDraggedPiece] = React.useState<{
    row: number;
    col: number;
  } | null>(null);

  function handleDrop(toRow: number, toCol: number) {
    if (!draggedPiece) return;
    const newBoard = currentBoard.map((oldBoard) => [...oldBoard]);
    newBoard[toRow][toCol] = currentBoard[draggedPiece.row][draggedPiece.col];
    newBoard[draggedPiece.row][draggedPiece.col] = " ";
    setCurrentBoard(newBoard);
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
                    ${
                      isBlack(rowIndex, colIndex)
                        ? "bg-[rgba(200,80,80,0.4)]"
                        : "bg-[rgba(255,255,255,0.4)]"
                    }
                    aspect-square w-full flex items-center justify-center`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(rowIndex, colIndex)}
              >
                <SetPiece
                  pieceName={piece}
                  draggable={piece !== " "}
                  onDragStart={() =>
                    setDraggedPiece({ row: rowIndex, col: colIndex })
                  }
                />
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default Chessboard;
