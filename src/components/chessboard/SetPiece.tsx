import React from "react";
import { FENChar } from "../../chessLogics/interface";
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
  [FENChar.BlackPawn]: blackPawn,
  [FENChar.BlackKnight]: blackKnight,
  [FENChar.BlackBishop]: blackBishop,
  [FENChar.BlackRook]: blackRook,
  [FENChar.BlackQueen]: blackQueen,
  [FENChar.BlackKing]: blackKing,

  [FENChar.WhitePawn]: whitePawn,
  [FENChar.WhiteKnight]: whiteKnight,
  [FENChar.WhiteBishop]: whiteBishop,
  [FENChar.WhiteRook]: whiteRook,
  [FENChar.WhiteQueen]: whiteQueen,
  [FENChar.WhiteKing]: whiteKing,
};

const SetPiece: React.FC<{ pieceName: FENChar }> = ({ pieceName }) => {
  const piece = pieceMap[pieceName];
  if (pieceName === FENChar.empty) return null;
  return <img src={piece} className="w-[90%] h-[90%] cursor-pointer" />;
};

export default SetPiece;
