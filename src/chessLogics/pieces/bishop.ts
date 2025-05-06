import { FEN, Color, Coords } from "../interface";
import { Piece } from "./piece";

export class Bishop extends Piece {
  protected override fen: FEN;
  protected override directions: Coords[] = [
    { x: 1, y: 1 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
  ];

  constructor(color: Color) {
    super(color);
    color === Color.Black ? (this.fen = FEN.BlackBishop) : (this.fen = FEN.WhiteBishop);
  }

  public override getMoves(from: Coords, board: FEN[][]): Coords[] {
    return super.getMoves(from, board, true);
  }
}
