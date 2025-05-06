import React from "react";
import { FEN } from "../../chessLogics/pieces/interface";
import blackPawn from "../../assets/images/pieces/black/pawn.png";
import blackKnight from "../../assets/images/pieces/black/knight.png";
import blackBishop from "../../assets/images/pieces/black/bishop.png";
import blackRook from "../../assets/images/pieces/black/rook.png";
import blackQueen from "../../assets/images/pieces/black/queen.png";
import blackKing from "../../assets/images/pieces/black/king.png";

import whitePawn from "../../assets/images/pieces/white/pawn.png";
import whiteKnight from "../../assets/images/pieces/white/knight.png";
import whiteBishop from "../../assets/images/pieces/white/bishop.png";
import whiteRook from "../../assets/images/pieces/white/rook.png";
import whiteQueen from "../../assets/images/pieces/white/queen.png";
import whiteKing from "../../assets/images/pieces/white/king.png";

const pieceMap: Record<string, string> = {
  [FEN.BlackPawn]: blackPawn,
  [FEN.BlackKnight]: blackKnight,
  [FEN.BlackBishop]: blackBishop,
  [FEN.blackRook]: blackRook,
  [FEN.blackQueen]: blackQueen,
  [FEN.blackKing]: blackKing,

  [FEN.WhitePawn]: whitePawn,
  [FEN.WhiteKnight]: whiteKnight,
  [FEN.WhiteBishop]: whiteBishop,
  [FEN.WhiteRook]: whiteRook,
  [FEN.WhiteQueen]: whiteQueen,
  [FEN.WhiteKing]: whiteKing,
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
