import { FENChar, Color, Coords } from "../interface";

export abstract class Piece {
  protected abstract fen: FENChar;
  protected abstract movementDirections: Coords[];
  protected abstract captureDirections: Coords[];

  public getPieceName(): FENChar {
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

  protected canCapture(target: Piece | null) {
    if (target === null) return false;
    return target.getColor() !== this.color;
  }

  protected getMoves(from: Coords, board: (Piece | null)[][], sliding: boolean): Coords[] {
    const moves: Coords[] = [];

    const tryDirections = (directions: Coords[], captureMovements: boolean) => {
      for (const direction of directions) {
        let currentX = from.x + direction.x;
        let currentY = from.y + direction.y;

        while (!this.isOutOfBound({ x: currentX, y: currentY })) {
          const targetSquare = board[currentX][currentY];

          if (targetSquare === null) {
            if (!captureMovements) {
              moves.push({ x: currentX, y: currentY });
            } else if (!sliding) {
              break;
            }
          } else {
            if (captureMovements && this.canCapture(targetSquare)) {
              moves.push({ x: currentX, y: currentY });
            }
            break;
          }

          if (!sliding) break;
          currentX += direction.x;
          currentY += direction.y;
        }
      }
    };

    tryDirections(this.movementDirections, false);
    tryDirections(this.captureDirections, true);

    return moves;
  }
}
