import { Color, Coords, FENChar } from "../interface";
import { Piece } from "./piece";

export class Queen extends Piece {
  protected override fen: FENChar;
  protected override movementDirections: Coords[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },

    { x: 1, y: 1 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
  ];
  protected override captureDirections: Coords[] = this.movementDirections;

  constructor(color: Color) {
    super(color);
    color === Color.Black ? (this.fen = FENChar.BlackQueen) : (this.fen = FENChar.WhiteQueen);
  }

  public override getMoves(from: Coords, board: (Piece | null)[][]): Coords[] {
    return super.getMoves(from, board, true);
  }
}
