import React from "react";
import SetPiece from "./SetPiece";
import { isBlack } from "./ChessboardUtils";
import { printBoardCommands } from "../../consoleCommands";
import Game from "../../chessLogics/game";
import { FENChar } from "../../chessLogics/interface";

const Chessboard: React.FC = () => {
  const [game] = React.useState(() => new Game());
  const [currentBoard, setCurrentBoard] = React.useState(() => game.getBoard().getBoard());
  const [draggedPiece, setDraggedPiece] = React.useState<{
    row: number;
    col: number;
    pieceName: FENChar;
    mouseX: number;
    mouseY: number;
    squareSize: number;
  } | null>(null);
  const boardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    printBoardCommands(game.getBoard(), game.getBoardHistory());
  });

  React.useEffect(() => {
    if (!draggedPiece) return;
    function handleMouseMove(e: MouseEvent) {
      if (!draggedPiece) return;
      setDraggedPiece({
        row: draggedPiece.row,
        col: draggedPiece.col,
        pieceName: draggedPiece.pieceName,
        mouseX: e.clientX,
        mouseY: e.clientY,
        squareSize: draggedPiece.squareSize,
      });
    }
    function handleMouseUp() {
      setDraggedPiece(null);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // clean event listeners when component unmounts.
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedPiece]);

  /**
   *
   * @param fromRow - The row of the piece being dragged.
   * @param fromCol - The column of the piece being dragged.
   * @param event - Mouse event containing cursor position information.
   */
  function handleMouseDown(fromRow: number, fromCol: number, event: React.MouseEvent): void {
    const piece = currentBoard[fromRow][fromCol];
    if (!piece || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    setDraggedPiece({
      row: fromRow,
      col: fromCol,
      pieceName: piece.getPieceName(),
      mouseX: event.clientX,
      mouseY: event.clientY,
      squareSize: boardRect.width / 8,
    });
  }
  /**
   *
   * @param toRow - The row on the board the piece being dropped on.
   * @param toCol - The column on the board the piece being dropped on.
   */
  function handleMouseUp(toRow: number, toCol: number): void {
    if (!draggedPiece) return;

    const moveSuccessful = game.handleMove({ x: draggedPiece.row, y: draggedPiece.col }, { x: toRow, y: toCol });
    if (moveSuccessful) setCurrentBoard(game.getBoard().getBoard());
    setDraggedPiece(null);
  }

  return (
    <div className="position relative w-full h-full">
      <div
        ref={boardRef}
        className="
          bg-transparent shadow-[4px_12px_12px_rgba(0,0,0,0.2)]
          w-full h-full
          grid grid-cols-8 aspect-square
        "
      >
        {currentBoard.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isPieceBeingDragged = draggedPiece && draggedPiece.row === rowIndex && draggedPiece.col === colIndex;
            // Get the squares where the pieces are being hovered over.
            let hoveredRow = null;
            let hoveredCol = null;
            if (draggedPiece && boardRef.current) {
              const rect = boardRef.current.getBoundingClientRect();
              hoveredRow = Math.floor((draggedPiece.mouseY - rect.top) / draggedPiece.squareSize);
              hoveredCol = Math.floor((draggedPiece.mouseX - rect.left) / draggedPiece.squareSize);
            }

            return (
              <div
                key={rowIndex + "-" + colIndex}
                onMouseUp={() => handleMouseUp(rowIndex, colIndex)}
                className={`
                    ${isBlack(rowIndex, colIndex) ? "bg-[rgba(200,80,80,0.4)]" : "bg-[rgba(255,255,255,0.4)]"}
                    ${draggedPiece && hoveredRow === rowIndex && hoveredCol === colIndex ? "border-[5px] border-white" : ""} 
                    position relative aspect-square w-full flex items-center justify-center`}
              >
                {piece !== null && !isPieceBeingDragged && (
                  <>
                    <div onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)} className="w-[95%] h-[95%] display flex justify-items-center justify-center">
                      <SetPiece pieceName={piece.getPieceName()} />
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
      {draggedPiece && (
        <div
          style={{
            pointerEvents: "none",
            position: "fixed",
            left: draggedPiece.mouseX,
            top: draggedPiece.mouseY,
            width: draggedPiece.squareSize * 0.95,
            height: draggedPiece.squareSize * 0.95,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <SetPiece pieceName={draggedPiece.pieceName} />
        </div>
      )}
    </div>
  );
};

export default Chessboard;
