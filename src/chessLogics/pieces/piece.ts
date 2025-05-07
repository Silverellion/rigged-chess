import { FEN, Color, Coords } from "../interface";

export abstract class Piece {
  protected abstract fen: FEN;
  protected abstract movementDirections: Coords[];
  protected abstract captureDirections: Coords[];

  public getPieceName(): FEN {
    return this.fen;
  }

  public getColor(): Color {
    return this.color;
  }

  public getDirections(): Coords[] {
    return this.movementDirections;
  }

  constructor(protected color: Color) {}

  protected isOutOfBound(pos: Coords): boolean {
    if (pos.x > 7 || pos.y > 7 || pos.x < 0 || pos.y < 0) return true;
    return false;
  }

  protected canCapture(target: FEN) {
    if (target === FEN.empty) return false;
    if (this.color === Color.Black) {
      return target === target.toUpperCase(); // target === white
    }
    if (this.color === Color.White) {
      return target === target.toLowerCase(); // target === black
    }
  }

  protected getMoves(from: Coords, board: FEN[][], sliding: boolean): Coords[] {
    const moves: Coords[] = [];

    for (const direction of this.movementDirections) {
      let x = from.x;
      let y = from.y;

      do {
        x += direction.x;
        y += direction.y;
        if (this.isOutOfBound({ x, y })) break;

        const target = board[x][y];
        if (target === FEN.empty) {
          moves.push({ x, y });
        } else {
          if (this.canCapture(target)) {
            moves.push({ x, y });
          }
          break; // Stop on first non-empty square
        }
      } while (sliding);
    }

    return moves;
  }
}
