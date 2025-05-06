import React from "react";
import blackRook from "../../assets/images/pieces/black/rook.png";
import blackKnight from "../../assets/images/pieces/black/knight.png";
import blackBishop from "../../assets/images/pieces/black/bishop.png";
import blackKing from "../../assets/images/pieces/black/king.png";
import blackQueen from "../../assets/images/pieces/black/queen.png";
import blackPawn from "../../assets/images/pieces/black/pawn.png";

import whiteRook from "../../assets/images/pieces/white/rook.png";
import whiteKnight from "../../assets/images/pieces/white/knight.png";
import whiteBishop from "../../assets/images/pieces/white/bishop.png";
import whiteKing from "../../assets/images/pieces/white/king.png";
import whiteQueen from "../../assets/images/pieces/white/queen.png";
import whitePawn from "../../assets/images/pieces/white/pawn.png";

const pieceMap: Record<string, string> = {
  r: blackRook,
  n: blackKnight,
  b: blackBishop,
  k: blackKing,
  q: blackQueen,
  p: blackPawn,

  R: whiteRook,
  N: whiteKnight,
  B: whiteBishop,
  K: whiteKing,
  Q: whiteQueen,
  P: whitePawn,
};

const SetPiece: React.FC<{
  pieceName: string;
  draggable?: boolean;
  onDragStart?: React.DragEventHandler;
}> = ({ pieceName, draggable, onDragStart }) => {
  const piece = pieceMap[pieceName];
  if (pieceName === " ") return null;
  return (
    <img
      src={piece}
      draggable={draggable}
      onDragStart={onDragStart}
      className="w-[90%] h-[90%] cursor-pointer"
    />
  );
};

export default SetPiece;
