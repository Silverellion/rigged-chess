import React from "react";
import { Color, FENChar } from "../../chessLogics/interface";
import SetPiece from "./SetPiece";

const whitePieces: FENChar[] = [FENChar.WhiteQueen, FENChar.WhiteRook, FENChar.WhiteBishop, FENChar.WhiteKnight];
const blackPieces: FENChar[] = [FENChar.BlackQueen, FENChar.BlackRook, FENChar.BlackBishop, FENChar.BlackKnight];

interface PromotionBoxProps {
  color: Color;
  onSelect: (piece: FENChar) => void;
}

const PromotionBox: React.FC<PromotionBoxProps> = ({ color, onSelect }) => {
  const pieces = color === Color.White ? whitePieces : blackPieces;

  return (
    <div className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-lg flex flex-col">
      {pieces.map((piece, index) => (
        <button
          key={piece}
          className={`w-16 h-16 flex items-center justify-center
            ${index % 2 === 0 ? "bg-[rgba(200,80,80,0.8)]" : "bg-[rgba(255,255,255,0.8)]"}
            hover:scale-105 transition-transform`}
          onClick={() => onSelect(piece)}
        >
          <SetPiece pieceName={piece} />
        </button>
      ))}
    </div>
  );
};

export default PromotionBox;
