import React from "react";
import { getBoard, printBoard } from "../../chess/chessboard";
import { isBlack } from "../../chess/chessboardUtil";

const Chessboard: React.FC = () => {
  const board = getBoard();
  return (
    <>
      <div
        className="
          bg-transparent shadow-[4px_12px_12px_rgba(0,0,0,0.2)]
          grid grid-cols-8 aspect-square
        "
      >
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => {
            return (
              <>
                <div
                  className={`
                    ${
                      isBlack(rowIndex, colIndex)
                        ? "bg-[rgb(200,80,80)]"
                        : "bg-[rgb(255,255,255)]"
                    }
                    aspect-square w-full flex items-center justify-center
                  `}
                ></div>
              </>
            );
          })
        )}
      </div>
    </>
  );
};

export default Chessboard;
