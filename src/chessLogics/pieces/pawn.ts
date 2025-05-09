import { Color, Coords, FENChar } from "../interface";
import { Piece } from "./piece";

export class Pawn extends Piece {
  protected override fen: FENChar;
  protected override movementDirections: Coords[];
  protected override captureDirections: Coords[];
  private hasMoved: boolean = false;

  constructor(color: Color) {
    super(color);
    color === Color.Black ? (this.fen = FENChar.BlackPawn) : (this.fen = FENChar.WhitePawn);
    this.movementDirections = [
      { x: -1, y: 0 },
      { x: -2, y: 0 },
    ];
    this.captureDirections = [
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];

    if (color === Color.Black) {
      this.movementDirections = this.movementDirections.map(({ x, y }) => ({ x: -1 * x, y }));
      this.captureDirections = this.captureDirections.map(({ x, y }) => ({ x: -1 * x, y }));
    }
  }

  public override getMoves(from: Coords, board: (Piece | null)[][]): Coords[] {
    const movementMoves = super.getMoves(from, board, false);
    const captureMoves: Coords[] = [];
    for (const direction of this.captureDirections) {
      const targetX = from.x + direction.x;
      const targetY = from.y + direction.y;

      if (targetX >= 0 && targetX < 8 && targetY >= 0 && targetY < 8) {
        const targetSquare = board[targetX][targetY];
        if (targetSquare !== null && targetSquare.getColor() !== this.getColor()) {
          captureMoves.push({ x: targetX, y: targetY });
        }
      }
    }

    return [...movementMoves, ...captureMoves];
  }

  public getHasMoved(): boolean {
    return this.hasMoved;
  }

  public setHasMoved(): void {
    this.hasMoved = true;
    if (this.getColor() === Color.White) {
      this.movementDirections = [{ x: -1, y: 0 }];
    } else {
      this.movementDirections = [{ x: 1, y: 0 }];
    }
  }
}
