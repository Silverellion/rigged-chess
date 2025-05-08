import { Color, Coords } from "../interface";
import { Piece } from "../pieces/piece";

export default class Castling {
  public getMoves(from: Coords, board: (Piece | null)[][], color: Color): Coords[] {
    return [];
  }

  private checkIsLastRankEmpty(board: (Piece | null)[][], color: Color): boolean {
    if (color === Color.White) {
      return true;
    }
    return false;
  }
}
