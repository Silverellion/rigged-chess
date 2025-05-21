import React from "react";
import SetPiece from "./SetPiece";
import { printBoardCommands } from "../../consoleCommands";
import Game from "../../chessLogics/game";
import { Coords, FENChar } from "../../chessLogics/interface";
import { King } from "../../chessLogics/pieces/king";
import Sound from "../../chessLogics/sound";

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
  const [flashingKingPosition, setFlashingKingPos] = React.useState<Coords | null>(null);
  const [isFlashing, setIsFlashing] = React.useState(false);
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

  React.useEffect(() => {
    if (flashingKingPosition) {
      let flashCount = 0;
      setIsFlashing(true);

      const flashInterval = setInterval(() => {
        setIsFlashing((prev) => !prev);
        flashCount++;

        if (flashCount >= 5) {
          clearInterval(flashInterval);
          setFlashingKingPos(null);
        }
      }, 175);

      return () => clearInterval(flashInterval);
    }
  }, [flashingKingPosition]);

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
    if (moveSuccessful) {
      setCurrentBoard(game.getBoard().getBoard());
    } else {
      // Check if king is in check and this was an illegal move
      const piece = currentBoard[draggedPiece.row][draggedPiece.col];
      if (piece) {
        const pieceColor = piece.getColor();
        const kingPos = game.getBoard().findFirstMatchingPiece((p) => p instanceof King && p.getColor() === pieceColor);
        if (kingPos) {
          const king = currentBoard[kingPos.x][kingPos.y] as King;
          if (king.getIsInCheck()) {
            Sound.checkWarning();
            setFlashingKingPos(kingPos);
            setIsFlashing(true);
          }
        }
      }
    }
    setDraggedPiece(null);
  }

  function isColoredSquare(row: number, col: number): boolean {
    return (row + col) % 2 === 1;
  }

  function getHoveredSquare(): [number, number] {
    if (!draggedPiece || !boardRef.current) return [-1, -1];
    const rect = boardRef.current.getBoundingClientRect();
    return [Math.floor((draggedPiece.mouseY - rect.top) / draggedPiece.squareSize), Math.floor((draggedPiece.mouseX - rect.left) / draggedPiece.squareSize)];
  }

  return (
    // prettier-ignore
    // select-none is put here so that the pieces cannot be selected like text by accident.
    <div className="relative w-full h-full select-none">
      <div className="relative w-full h-full aspect-square">
        <div
          ref={boardRef}
          className=" absolute inset-0
            grid grid-cols-8 grid-rows-8
            w-full h-full aspect-square
            bg-transparent shadow-[4px_12px_12px_rgba(0,0,0,0.2)]"
        >
          {currentBoard.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isPieceBeingDragged = draggedPiece 
              && draggedPiece.row === rowIndex 
              && draggedPiece.col === colIndex;
              const [hoveredRow, hoveredCol] = getHoveredSquare();
              const isHovered = draggedPiece
              && hoveredRow == rowIndex 
              && hoveredCol == colIndex;
              const showRank = colIndex === 0;
              const showFile = rowIndex === 7;
              const isFlashingKing = flashingKingPosition
              && flashingKingPosition.x === rowIndex 
              && flashingKingPosition.y === colIndex 
              && isFlashing;
              return (
                <div
                  key={rowIndex + "-" + colIndex}
                  onMouseUp={() => handleMouseUp(rowIndex, colIndex)}
                  className={`relative ${isFlashingKing ? "bg-[rgb(255,0,0)]" 
                      : isColoredSquare(rowIndex, colIndex) 
                        ? "bg-[rgba(200,80,80,0.7)]" 
                        : "bg-[rgba(255,255,255,0.7)]"}
                    ${isHovered ? "border-[7px] border-[rgb(200,40,40)]" : ""}
                    aspect-square w-full h-full flex items-center justify-center`}
                >
                  {showRank && <span className={`absolute left-[0.2vw] top-[-0.4vw] select-none pointer-events-none
                    ${isColoredSquare(rowIndex, colIndex) ? "text-[rgb(255,255,255)]" : "text-[rgb(200,80,80)]"}
                    text-[1.8vw]`} style={{fontFamily: "Montserrat"}}>
                      {8 - rowIndex}
                  </span>}
                  {showFile && <span className={`absolute right-[0.2vw] bottom-[-0.2vw] select-none pointer-events-none
                    ${isColoredSquare(rowIndex, colIndex) ? "text-[rgb(255,255,255)]" : "text-[rgb(200,80,80)]"}
                    text-[1.8vw]`} style={{fontFamily: "Montserrat"}}>
                      {String.fromCharCode(97 + colIndex)}
                  </span>}
                  {piece !== null && !isPieceBeingDragged && (
                    <div onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)} className="w-[95%] h-[95%] flex justify-center items-center">
                      <SetPiece pieceName={piece.getPieceName()} />
                    </div>
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
    </div>
  );
};

export default Chessboard;
