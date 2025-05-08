import { Color, Coords, FENChar } from "../interface";
import { Piece } from "./piece";

export class King extends Piece {
  protected override fen: FENChar;
  protected override movementDirections: Coords[] = [
    { x: 1, y: 1 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },

    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  protected override captureDirections: Coords[] = this.movementDirections;
  private hasMoved: boolean = false;
  private isInCheck: boolean = false;
  private canCastle: boolean = true;

  constructor(color: Color) {
    super(color);
    color === Color.Black ? (this.fen = FENChar.BlackKing) : (this.fen = FENChar.WhiteKing);
  }

  public override getMoves(from: Coords, board: (Piece | null)[][]): Coords[] {
    return super.getMoves(from, board, false);
  }

  public getHasMoved(): boolean {
    return this.hasMoved;
  }

  public setHasMoved(): void {
    this.hasMoved = true;
  }

  public getIsInCheck(): boolean {
    return this.isInCheck;
  }

  public setIsInCheck(isInCheck: boolean): void {
    this.isInCheck = isInCheck;
  }

  public getCanCastle(): boolean {
    return this.canCastle;
  }

  public setCanCastle(canCastle: boolean): void {
    this.canCastle = canCastle;
  }
}
