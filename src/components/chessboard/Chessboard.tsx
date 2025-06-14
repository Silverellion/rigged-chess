import React from "react";
import SetPiece from "./SetPiece";
import PromotionBox from "./PromotionBox";
import { initiateConsoleCommands } from "../../consoleCommands";
import Game from "../../chessLogics/game";
import { Color, Coords, FENChar } from "../../chessLogics/interface";
import { King } from "../../chessLogics/pieces/king";
import Sound from "../../chessLogics/sound";
import { validateMove, getLegalMoves, getBoardState } from "../../api/moveValidator";

interface ChessboardProps {
  game: Game;
  onBoardUpdate: () => void;
}

const Chessboard: React.FC<ChessboardProps> = ({ game, onBoardUpdate }) => {
  const [currentBoard, setCurrentBoard] = React.useState(() => game.getBoard().getBoard());
  const [draggedPiece, setDraggedPiece] = React.useState<{
    row: number;
    col: number;
    pieceName: FENChar;
    mouseX: number;
    mouseY: number;
    squareSize: number;
  } | null>(null);
  const [legalMoves, setLegalMoves] = React.useState<Coords[]>([]);
  const [flashingKingPosition, setFlashingKingPos] = React.useState<Coords | null>(null);
  const [isFlashing, setIsFlashing] = React.useState(false);
  const [_, setHistoryIndex] = React.useState(0);
  const [showPromotion, setShowPromotion] = React.useState(false);
  const [promotionColor, setPromotionColor] = React.useState<Color>(Color.White);
  const [pendingPromotion, setPendingPromotion] = React.useState<{
    from: Coords;
    to: Coords;
  } | null>(null);
  const boardRef = React.useRef<HTMLDivElement>(null);

  // Load saved board state on initial render
  React.useEffect(() => {
    const loadBoardState = async () => {
      try {
        const isAtEnd =
          game.getBoardHistory().getCurrentHistoryIndex() ===
          game.getBoardHistory().getHistory().length - 1;
        if (isAtEnd) {
          const boardState = await getBoardState();
          if (boardState.fen) {
            game.loadFen(boardState.fen);
            setCurrentBoard(game.getBoard().getBoard());
          }
        } else {
          setCurrentBoard(game.getBoard().getBoard());
        }
      } catch (error) {
        console.error("Error loading board state:", error);
      }
    };
    loadBoardState();
  }, []);

  // Updates board UI when the history changes
  React.useEffect(() => {
    setCurrentBoard(game.getBoard().getBoard());
    setHistoryIndex(game.getBoardHistory().getCurrentHistoryIndex());
    setLegalMoves([]);
  }, [game.getBoardHistory().getCurrentHistoryIndex()]);

  // Check for pending promotion
  React.useEffect(() => {
    const pendingGamePromotion = game.getPendingPromotion();
    if (pendingGamePromotion || pendingPromotion) {
      const from = pendingGamePromotion?.from || pendingPromotion?.from;
      if (from) {
        const piece = currentBoard[from.x][from.y];
        if (piece) {
          setPromotionColor(piece.getColor());
          setShowPromotion(true);
        }
      }
    } else {
      setShowPromotion(false);
    }
  }, [game.getPendingPromotion(), pendingPromotion, currentBoard]);

  const updateBoard = () => {
    setCurrentBoard(game.getBoard().getBoard());
    onBoardUpdate();
  };

  React.useEffect(() => {
    initiateConsoleCommands(game);
  });

  React.useEffect(() => {
    if (!draggedPiece) return;

    // Get legal moves when a piece is picked up
    const fetchLegalMoves = async () => {
      try {
        const moves = await getLegalMoves({ x: draggedPiece.row, y: draggedPiece.col });
        setLegalMoves(moves);
      } catch (error) {
        console.error("Error fetching legal moves:", error);
        setLegalMoves([]);
      }
    };

    fetchLegalMoves();

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
      setLegalMoves([]);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

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

  function handleMouseDown(fromRow: number, fromCol: number, event: React.MouseEvent): void {
    // Don't allow moving pieces when viewing history or during promotion
    const historyIndex = game.getBoardHistory().getCurrentHistoryIndex();
    const historyLength = game.getBoardHistory().getHistory().length;

    if (historyIndex < historyLength - 1 || showPromotion) {
      return;
    }

    const piece = currentBoard[fromRow][fromCol];
    if (!piece || !boardRef.current) return;

    // Only allow moving pieces of the current turn
    if (piece.getColor() !== game.getCurrentTurn()) {
      return;
    }

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

  async function handleMouseUp(toRow: number, toCol: number): Promise<void> {
    if (!draggedPiece || showPromotion) return;

    // Don't allow moves when viewing history
    const historyIndex = game.getBoardHistory().getCurrentHistoryIndex();
    const historyLength = game.getBoardHistory().getHistory().length;

    if (historyIndex < historyLength - 1) {
      setDraggedPiece(null);
      return;
    }

    const from = { x: draggedPiece.row, y: draggedPiece.col };
    const to = { x: toRow, y: toCol };

    const isLocallyLegal = legalMoves.some((move) => move.x === to.x && move.y === to.y);
    if (isLocallyLegal) {
      const moveResult = game.handleMove(from, to);
      if (moveResult) {
        Sound.normalMove();
        updateBoard();
      }

      try {
        const validationResult = await validateMove(from, to, "", true);

        if (!validationResult.valid) {
          const boardState = await getBoardState();
          if (boardState.fen) {
            game.loadFen(boardState.fen);
            updateBoard();
          }
        } else if (validationResult.promotionPending) {
          // Handle promotion
          setPendingPromotion({ from, to });
        } else if (validationResult.stockfishMove) {
          console.log("Stockfish's move:", validationResult.stockfishMove);
        }
      } catch (error) {
        console.error("Error validating move:", error);
        const boardState = await getBoardState();
        if (boardState.fen) {
          game.loadFen(boardState.fen);
          updateBoard();
        }
      }
    } else {
      const piece = currentBoard[draggedPiece.row][draggedPiece.col];
      if (piece) {
        const pieceColor = piece.getColor();
        const kingPos = game
          .getBoard()
          .findFirstMatchingPiece((p) => p instanceof King && p.getColor() === pieceColor);

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
    setLegalMoves([]);
  }

  async function handlePromotion(piece: FENChar): Promise<void> {
    const promotionPiece = piece.toLowerCase();

    if (pendingPromotion) {
      const success = game.completePromotion(piece);
      if (success) {
        Sound.promote();
        updateBoard();
        setPendingPromotion(null);
        setShowPromotion(false);
      }

      try {
        const validationResult = await validateMove(
          pendingPromotion.from,
          pendingPromotion.to,
          promotionPiece,
          true
        );

        if (!validationResult.valid) {
          const boardState = await getBoardState();
          if (boardState.fen) {
            game.loadFen(boardState.fen);
            updateBoard();
          }
        } else if (validationResult.stockfishMove) {
          console.log("Stockfish's move:", validationResult.stockfishMove);
        }
      } catch (error) {
        console.error("Error completing promotion:", error);
        const boardState = await getBoardState();
        if (boardState.fen) {
          game.loadFen(boardState.fen);
          updateBoard();
        }
      }
    } else {
      // Handle regular game promotion
      const success = game.completePromotion(piece);
      if (success) {
        Sound.promote();
        updateBoard();
        setShowPromotion(false);
      }
    }
  }

  function isColoredSquare(row: number, col: number): boolean {
    return (row + col) % 2 === 1;
  }

  function getHoveredSquare(): [number, number] {
    if (!draggedPiece || !boardRef.current) return [-1, -1];
    const rect = boardRef.current.getBoundingClientRect();
    return [
      Math.floor((draggedPiece.mouseY - rect.top) / draggedPiece.squareSize),
      Math.floor((draggedPiece.mouseX - rect.left) / draggedPiece.squareSize),
    ];
  }

  function isLegalMove(row: number, col: number): boolean {
    return legalMoves.some((move) => move.x === row && move.y === col);
  }

  return (
    <div className="relative w-full h-full select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className="relative w-full h-full aspect-square">
        <div
          ref={boardRef}
          className="absolute inset-0
            grid grid-cols-8 grid-rows-8
            w-full h-full aspect-square
            bg-transparent shadow-[4px_12px_12px_rgba(0,0,0,0.2)]"
        >
          {currentBoard.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isPieceBeingDragged =
                draggedPiece && draggedPiece.row === rowIndex && draggedPiece.col === colIndex;
              const [hoveredRow, hoveredCol] = getHoveredSquare();
              const isHovered = draggedPiece && hoveredRow == rowIndex && hoveredCol == colIndex;
              const showRank = colIndex === 0;
              const showFile = rowIndex === 7;
              const isLegal = isLegalMove(rowIndex, colIndex);
              const isFlashingKing =
                flashingKingPosition &&
                flashingKingPosition.x === rowIndex &&
                flashingKingPosition.y === colIndex &&
                isFlashing;

              // Determine if we're viewing history to disable piece dragging
              const isViewingHistory =
                game.getBoardHistory().getCurrentHistoryIndex() <
                game.getBoardHistory().getHistory().length - 1;
              const pieceStyles =
                isViewingHistory || showPromotion ? "cursor-not-allowed opacity-95" : "";

              return (
                <div
                  key={rowIndex + "-" + colIndex}
                  onMouseUp={() => handleMouseUp(rowIndex, colIndex)}
                  className={`relative ${
                    isFlashingKing
                      ? "bg-[rgb(255,0,0)]"
                      : isColoredSquare(rowIndex, colIndex)
                      ? "bg-[rgba(200,80,80,0.8)]"
                      : "bg-[rgba(255,255,255,0.8)]"
                  }
                    ${isHovered ? "border-[7px] border-[rgb(200,40,40)]" : ""}
                    ${
                      isLegal
                        ? "after:content-[''] after:absolute after:w-[30%] after:h-[30%] after:rounded-full after:bg-[rgba(0,0,0,0.2)] after:left-[35%] after:top-[35%]"
                        : ""
                    }
                    aspect-square w-full h-full flex items-center justify-center`}
                >
                  {showRank && (
                    <span
                      className={`absolute left-[0.2vw] top-[-0.4vw] select-none pointer-events-none
                      ${
                        isColoredSquare(rowIndex, colIndex)
                          ? "text-[rgb(255,255,255)]"
                          : "text-[rgb(200,80,80)]"
                      }
                      text-[1.8vw]`}
                      style={{ fontFamily: "Montserrat" }}
                    >
                      {8 - rowIndex}
                    </span>
                  )}
                  {showFile && (
                    <span
                      className={`absolute right-[0.2vw] bottom-[-0.2vw] select-none pointer-events-none
                      ${
                        isColoredSquare(rowIndex, colIndex)
                          ? "text-[rgb(255,255,255)]"
                          : "text-[rgb(200,80,80)]"
                      }
                      text-[1.8vw]`}
                      style={{ fontFamily: "Montserrat" }}
                    >
                      {String.fromCharCode(97 + colIndex)}
                    </span>
                  )}
                  {piece !== null && !isPieceBeingDragged && (
                    <div
                      onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                      className={`w-[95%] h-[95%] flex justify-center items-center select-none 
                      ${pieceStyles}`}
                    >
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

        {showPromotion && (pendingPromotion || game.getPendingPromotion()) && (
          <>
            <div className="absolute inset-0 z-20 backdrop-blur-[3px] bg-transparent"></div>
            <div
              className="absolute z-30"
              style={{
                left: `${
                  pendingPromotion
                    ? pendingPromotion.to.y * 12.5
                    : game.getPendingPromotion()
                    ? game.getPendingPromotion()!.to.y * 12.5
                    : 0
                }%`,
                top: promotionColor === Color.White ? 0 : "auto",
                bottom: promotionColor === Color.Black ? 0 : "auto",
                width: "12.5%",
              }}
            >
              <div className="w-full">
                <PromotionBox color={promotionColor} onSelect={handlePromotion} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chessboard;
