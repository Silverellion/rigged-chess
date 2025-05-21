import React from "react";
import "./logbox.css";
import arrowLeft from "../../assets/images/icons/arrow_left.svg";
import arrowLeftDouble from "../../assets/images/icons/arrow_left_double.svg";
import arrowRight from "../../assets/images/icons/arrow_right.svg";
import arrowRightDouble from "../../assets/images/icons/arrow_right_double.svg";
import Game from "../../chessLogics/game";

interface LogboxProps {
  game: Game;
  onBoardUpdate: () => void;
}

const Logbox: React.FC<LogboxProps> = ({ game, onBoardUpdate }) => {
  const whiteMoves = game.getBoardHistory().getWhiteMoves();
  const blackMoves = game.getBoardHistory().getBlackMoves();
  const currentHistoryIndex = game.getBoardHistory().getCurrentHistoryIndex();

  // Index 0 is initial board state, indices 1+ are after moves
  const currentMoveIndex = currentHistoryIndex - 1;
  const currentTurnNumber = Math.floor(currentMoveIndex / 2);
  const isWhiteMove = currentMoveIndex % 2 === 0 && currentMoveIndex >= 0;
  const isBlackMove = currentMoveIndex % 2 === 1;

  const handleMoveClick = (turnIndex: number, isWhite: boolean) => {
    // Calculate history index (each turn has two moves, plus initial state)
    const moveIndex = turnIndex * 2 + (isWhite ? 0 : 1);
    game.setToHistoryPoint(moveIndex);
    onBoardUpdate();
  };

  const handleFirstMove = () => {
    game.goToStart();
    onBoardUpdate();
  };

  const handlePreviousMove = () => {
    game.goToPreviousMove();
    onBoardUpdate();
  };

  const handleNextMove = () => {
    game.goToNextMove();
    onBoardUpdate();
  };

  const handleLastMove = () => {
    game.goToEnd();
    onBoardUpdate();
  };

  const rows = [];
  // prettier-ignore
  for (let i = 0; i < whiteMoves.length || i < blackMoves.length; i++) {
    rows.push(
      <tr key={i}>
        <td>{i + 1}.</td>
        <td>{whiteMoves[i] && (<a href="#" onClick={(e) => {
                e.preventDefault();
                handleMoveClick(i, true);
              }}
              className={currentTurnNumber === i && isWhiteMove ? "selected-move" : ""}>
              {whiteMoves[i]}
            </a>)}
        </td>
        <td>{blackMoves[i] && (<a href="#" onClick={(e) => {
                e.preventDefault();
                handleMoveClick(i, false);
              }}
              className={currentTurnNumber === i && isBlackMove ? "selected-move" : ""}>
              {blackMoves[i]}
            </a>)}
        </td>
      </tr>
    );
  }

  return (
    // prettier-ignore
    <div className="grid grid-rows-[4fr_1fr]">
      <table className="log-table">
        <tbody>{rows}</tbody>
      </table>

      <div className="button-tray">
        <button onClick={handleFirstMove}><img src={arrowLeftDouble} alt="First Move" /></button>
        <button onClick={handlePreviousMove}><img src={arrowLeft} alt="Previous Move" /></button>
        <button onClick={handleNextMove}><img src={arrowRight} alt="Next Move" /></button>
        <button onClick={handleLastMove}><img src={arrowRightDouble} alt="Last Move" /></button>
      </div>
    </div>
  );
};

export default Logbox;
