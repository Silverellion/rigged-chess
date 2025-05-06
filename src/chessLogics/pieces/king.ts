import { Color, Coords, FEN } from "../interface";
import { Piece } from "./piece";

export class King extends Piece {
  protected override fen: FEN;
  protected override directions: Coords[] = [
    { x: 1, y: 1 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },

    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  constructor(color: Color) {
    super(color);
    color === Color.Black ? (this.fen = FEN.BlackKing) : (this.fen = FEN.WhiteKing);
  }

  public override getMoves(from: Coords, board: FEN[][]): Coords[] {
    return super.getMoves(from, board, false);
  }
}
