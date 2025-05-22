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
  const direction = color === Color.White ? "flex-col-reverse" : "flex-col";

  return (
    // prettier-ignore
    <div className={`${direction}`}>
      {pieces.map((piece, index) => (
        <button
          key={piece}
          className={`w-full aspect-square flex items-center justify-center
            ${index % 2 === 0 ? 
            "bg-[rgba(200,80,80,0.8)] hover:bg-[rgba(200,0,0,0.9)] transition-all" : 
            "bg-[rgba(255,255,255,0.8)] hover:bg-[rgba(200,200,200,0.9)] transition-all"}
        `}
          onClick={() => onSelect(piece)}
        >
          <div className="w-[95%] h-[95%] flex justify-center items-center select-none 
            hover:scale-[110%] transition-transform ">
                <SetPiece pieceName={piece} />
          </div>
        </button>
      ))}
    </div>
  );
};

export default PromotionBox;
