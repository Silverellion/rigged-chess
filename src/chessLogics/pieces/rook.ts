import { Color, Coords, FEN } from "./interface";
import { Piece } from "./piece";

export class Rook extends Piece {
  protected override pieceName: FEN;
  protected override directions: Coords[] = [
    { x: 1, y: 1 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
  ];
  constructor(color: Color) {
    super(color);
    color === Color.Black
      ? (this.pieceName = FEN.blackRook)
      : (this.pieceName = FEN.WhiteRook);
  }
}
