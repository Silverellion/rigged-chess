import React from "react";
import { printBoard } from "../../chess/chessboard";

const Chessboard: React.FC = () => {
  return (
    <>
      <div
        className="
          bg-transparent shadow-[4px_12px_12px_rgba(0,0,0,0.2)]"
      >
        <button
          className="bg-rgb[200,60,60], text-black, cursor-pointer"
          onClick={printBoard}
        >
          test
        </button>
      </div>
    </>
  );
};

export default Chessboard;
