import { Color, Coords, FENChar } from "../interface";
import { Piece } from "./piece";

export class Knight extends Piece {
  protected override fen: FENChar;
  protected override movementDirections: Coords[] = [
    { x: 1, y: 2 },
    { x: -1, y: -2 },
    { x: -1, y: 2 },
    { x: 1, y: -2 },

    { x: 2, y: 1 },
    { x: -2, y: -1 },
    { x: -2, y: 1 },
    { x: 2, y: -1 },
  ];
  protected override captureDirections: Coords[] = this.movementDirections;

  constructor(color: Color) {
    super(color);
    color === Color.Black ? (this.fen = FENChar.BlackKnight) : (this.fen = FENChar.WhiteKnight);
  }

  public override getMoves(from: Coords, board: (Piece | null)[][]): Coords[] {
    return super.getMoves(from, board, false);
  }
}
