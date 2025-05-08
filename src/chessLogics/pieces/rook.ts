import { Color, Coords, FENChar } from "../interface";
import { Piece } from "./piece";

export class Rook extends Piece {
  protected override fen: FENChar;
  protected override movementDirections: Coords[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  protected override captureDirections: Coords[] = this.movementDirections;
  private hasMoved: boolean = false;

  constructor(color: Color) {
    super(color);
    color === Color.Black ? (this.fen = FENChar.BlackRook) : (this.fen = FENChar.WhiteRook);
  }

  public override getMoves(from: Coords, board: (Piece | null)[][]): Coords[] {
    return super.getMoves(from, board, true);
  }

  public getHasMoved(): boolean {
    return this.hasMoved;
  }

  public setHasMoved(): void {
    this.hasMoved = true;
  }
}
