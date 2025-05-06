import { Color, Coords, FEN } from "../interface";
import { Piece } from "./piece";

export class Rook extends Piece {
  protected override fen: FEN;
  protected override directions: Coords[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  constructor(color: Color) {
    super(color);
    color === Color.Black ? (this.fen = FEN.BlackRook) : (this.fen = FEN.WhiteRook);
  }

  public override getMoves(from: Coords, board: FEN[][]): Coords[] {
    return super.getMoves(from, board, true);
  }
}
