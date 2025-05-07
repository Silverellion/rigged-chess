import { Color, Coords, FEN } from "../interface";
import { Piece } from "./piece";

export class Pawn extends Piece {
  protected override fen: FEN;
  protected override movementDirections: Coords[];
  protected override captureDirections: Coords[];

  constructor(color: Color) {
    super(color);
    color === Color.Black ? (this.fen = FEN.BlackPawn) : (this.fen = FEN.WhitePawn);
    this.movementDirections = [{ x: -1, y: 0 }];
    this.captureDirections = [
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];

    if (color === Color.Black) {
      this.movementDirections = this.movementDirections.map(({ x, y }) => ({ x: -1 * x, y }));
      this.captureDirections = this.captureDirections.map(({ x, y }) => ({ x: -1 * x, y }));
    }
  }

  public override getMoves(from: Coords, board: FEN[][]): Coords[] {
    return super.getMoves(from, board, false);
  }
}
