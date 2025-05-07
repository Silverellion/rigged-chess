import { Color, Coords, FEN } from "../interface";
import { Piece } from "./piece";

export class Knight extends Piece {
  protected override fen: FEN;
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
    color === Color.Black ? (this.fen = FEN.BlackKnight) : (this.fen = FEN.WhiteKnight);
  }

  public override getMoves(from: Coords, board: FEN[][]): Coords[] {
    return super.getMoves(from, board, false);
  }
}
