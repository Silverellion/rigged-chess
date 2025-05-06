import { FEN, Color, Coords } from "./interface";

export abstract class Piece {
  protected abstract pieceName: FEN;
  protected abstract directions: Coords[];

  public getPieceName(): FEN {
    return this.pieceName;
  }

  public getColor(): Color {
    return this.color;
  }

  public getDirections(): Coords[] {
    return this.directions;
  }

  constructor(protected color: Color) {}
}
