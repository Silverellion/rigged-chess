import { Color, Coords, FEN } from "../interface";
import { Piece } from "./piece";

export class Pawn extends Piece {
  protected override fen: FEN;
  protected override directions: Coords[];

  constructor(color: Color) {
    super(color);
    if (color === Color.Black) {
      this.fen = FEN.BlackPawn;
      this.directions = [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ];
    } else {
      this.fen = FEN.WhitePawn;
      this.directions = [
        { x: -1, y: 0 },
        { x: -2, y: 0 },
      ];
    }
  }

  public override getMoves(from: Coords, board: FEN[][]): Coords[] {
    return super.getMoves(from, board, false);
  }
}
