import React, { useRef } from "react";
import "./logbox.css";
import arrowLeft from "../../assets/images/icons/arrow_left.svg";
import arrowLeftDouble from "../../assets/images/icons/arrow_left_double.svg";
import arrowRight from "../../assets/images/icons/arrow_right.svg";
import arrowRightDouble from "../../assets/images/icons/arrow_right_double.svg";
import Game from "../../chessLogics/game";
import Sound from "../../chessLogics/sound";

interface LogboxProps {
  game: Game;
  onBoardUpdate: () => void;
}

const Logbox: React.FC<LogboxProps> = ({ game, onBoardUpdate }) => {
  const whiteMoves = game.getBoardHistory().getWhiteMoves();
  const blackMoves = game.getBoardHistory().getBlackMoves();
  const moveHistory = game.getBoardHistory().getMoveHistory();
  const currentHistoryIndex = game.getBoardHistory().getCurrentHistoryIndex();
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);
  // Index 0 is initial board state, indices 1+ are after moves
  const currentMoveIndex = currentHistoryIndex - 1;
  const currentTurnNumber = Math.floor(currentMoveIndex / 2);
  const isWhiteMove = currentMoveIndex % 2 === 0 && currentMoveIndex >= 0;
  const isBlackMove = currentMoveIndex % 2 === 1;

  const playSoundForMove = (moveIndex: number) => {
    if (moveIndex >= 0 && moveIndex < moveHistory.length) {
      Sound.playMoveSoundByType(moveHistory[moveIndex].type);
    }
  };

  const handleMoveClick = (turnIndex: number, isWhite: boolean) => {
    // Calculate history index (each turn has two moves, plus initial state)
    const moveIndex = turnIndex * 2 + (isWhite ? 0 : 1);
    game.setToHistoryPoint(moveIndex);
    onBoardUpdate();
    playSoundForMove(moveIndex);
  };

  const handleFirstMove = () => {
    game.goToStart();
    onBoardUpdate();
  };

  const handlePreviousMove = () => {
    const idx = game.getBoardHistory().getCurrentHistoryIndex() - 2;
    game.goToPreviousMove();
    onBoardUpdate();
    playSoundForMove(idx);
  };

  const handleNextMove = () => {
    const idx = game.getBoardHistory().getCurrentHistoryIndex();
    game.goToNextMove();
    onBoardUpdate();
    playSoundForMove(idx - 1);
  };

  const handleLastMove = () => {
    game.goToEnd();
    onBoardUpdate();
    const idx = game.getBoardHistory().getCurrentHistoryIndex() - 1;
    playSoundForMove(idx);
  };

  React.useEffect(() => {
    if (tbodyRef.current) {
      tbodyRef.current.scrollTo({
        top: tbodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [currentHistoryIndex]);

  const rows = [];
  // prettier-ignore
  for (let i = 0; i < whiteMoves.length || i < blackMoves.length; i++) {
    rows.push(
      <tr key={i}>
        <td>{i + 1}.</td>
        <td>
          {
            whiteMoves[i] && (<button onClick={(e) => {
                e.preventDefault();
                handleMoveClick(i, true);
            }}
              className={currentTurnNumber === i && isWhiteMove ? "selected-move" : ""}>
              {whiteMoves[i]}
            </button>
          )}
        </td>
        <td>
          {
            blackMoves[i] && (<button onClick={(e) => {
                e.preventDefault();
                handleMoveClick(i, false);
            }}
              className={currentTurnNumber === i && isBlackMove ? "selected-move" : ""}>
              {blackMoves[i]}
            </button>
          )}
        </td>
      </tr>
    );
  }

  return (
    // prettier-ignore
    <div className="bg-transparent shadow-[4px_12px_12px_rgba(0,0,0,0.2)]">
      <div>
        <table className="log-table">
          <tbody ref={tbodyRef}>{rows}</tbody>
        </table>

        <div className="button-tray bg-[rgba(240,240,240,0.8)]">
          <button onClick={handleFirstMove}><img src={arrowLeftDouble} alt="First Move" /></button>
          <button onClick={handlePreviousMove}><img src={arrowLeft} alt="Previous Move" /></button>
          <button onClick={handleNextMove}><img src={arrowRight} alt="Next Move" /></button>
          <button onClick={handleLastMove}><img src={arrowRightDouble} alt="Last Move" /></button>
        </div>
      </div>
    </div>
  );
};

export default Logbox;
