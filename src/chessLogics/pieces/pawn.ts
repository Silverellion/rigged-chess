import { Color, Coords, FEN } from "../interface";
import { Piece } from "./piece";

export class Pawn extends Piece {
  protected override fen: FEN;
  protected override directions: Coords[] = [
    { x: 0, y: 1 },
    { x: 0, y: 2 },
  ];

  constructor(color: Color) {
    super(color);
    color === Color.Black ? (this.fen = FEN.BlackPawn) : (this.fen = FEN.WhitePawn);
  }

  protected override getMoves(from: Coords, board: FEN[][]): Coords[] {
    return super.getMoves(from, board, false);
  }
}
