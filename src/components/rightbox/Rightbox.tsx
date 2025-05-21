import React from "react";
import Logbox from "./Logbox";
import Chatbox from "./Chatbox";
import Game from "../../chessLogics/game";

interface RightboxProps {
  game: Game;
  onBoardUpdate: () => void;
}

const Rightbox: React.FC<RightboxProps> = ({ game, onBoardUpdate }) => {
  return (
    <>
      <div
        className="bg-transparent shadow-[4px_12px_12px_rgba(0,0,0,0.2)] 
        grid grid-rows-[3fr_5fr]"
      >
        <Logbox game={game} onBoardUpdate={onBoardUpdate} />
        <Chatbox />
      </div>
    </>
  );
};

export default Rightbox;
