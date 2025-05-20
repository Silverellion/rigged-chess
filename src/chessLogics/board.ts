import { Color, Coords } from "./interface";
import { Piece } from "./pieces/piece";
import { Pawn } from "./pieces/pawn";
import { Knight } from "./pieces/knight";
import { Bishop } from "./pieces/bishop";
import { Rook } from "./pieces/rook";
import { Queen } from "./pieces/queen";
import { King } from "./pieces/king";
import Castling from "./specialMoves/castling";
import EnPassant from "./specialMoves/enPassant";
import CheckDetector from "./checkDetector";

export default class Board {
  private board: (Piece | null)[][];
  private static defaultBoard: (Piece | null)[][] = [
    [new Rook(Color.Black), new Knight(Color.Black), new Bishop(Color.Black), new Queen(Color.Black), new King(Color.Black), new Bishop(Color.Black), new Knight(Color.Black), new Rook(Color.Black)],
    [new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black)],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White)],
    [new Rook(Color.White), new Knight(Color.White), new Bishop(Color.White), new Queen(Color.White), new King(Color.White), new Bishop(Color.White), new Knight(Color.White), new Rook(Color.White)],
  ];

  constructor(board?: (Piece | null)[][]) {
    this.board = board || Board.defaultBoard;
  }

  public getBoard(): (Piece | null)[][] {
    return this.board;
  }

  public setBoard(board: (Piece | null)[][]): void {
    this.board = board;
  }

  /**
   * Converts board coordinates to standard chess notation.
   *
   * @param coords - The coordinates on the board (x: column, y: row).
   * @returns Standard chess notation (e.g., "e4") for the given coordinates.
   *
   * @example
   * // Get standard notation for coordinates {x: 4, y: 3}
   * const notation = getStandardCoord({x: 4, y: 3}); // returns "e5"
   */
  public getNotation(coords: Coords): string {
    const file = String.fromCharCode(97 + coords.x);
    const rank = 8 - coords.y;
    return `${file}${rank}`;
  }

  /**
   * Retrieves all legal moves for a piece at the specified position on the board.
   *
   * This method examines the piece at the given coordinates and calculates all valid moves
   * according to that piece's movement rules. It handles all chess piece types and includes
   * special moves like castling and en passant when applicable.
   *
   * @param row - The row index (0-7) of the piece on the chess board.
   * @param col - The column index (0-7) of the piece on the chess board.
   * @param lastMove - The previous move made in the game, represented as [start, end] coordinates, or null if no previous move.
   * @returns An array of Coords objects representing all legal destination squares
   *          for the piece, or an empty array if the square is empty or no legal moves exist.
   *
   * @example
   * // Get all legal moves for the piece at position (3,4), with last move information
   * const moves = board.getLegalMoves(3, 4, [{x: 1, y: 1}, {x: 1, y: 3}]);
   * console.log(moves); // [{x: 2, y: 3}, {x: 4, y: 5}, ...]
   */
  public getLegalMoves(row: number, col: number, lastMove: [Coords, Coords] | null): Coords[] {
    const piece: Piece | null = this.board[row][col];
    let moves: Coords[] = [];
    if (!piece) return moves;

    if (piece instanceof Pawn || piece instanceof Knight || piece instanceof Bishop || piece instanceof Rook || piece instanceof King || piece instanceof Queen) {
      moves = piece.getMoves({ x: row, y: col }, this.board);
      if (piece instanceof King) {
        const castlingMoves = Castling.getMoves(this, { x: row, y: col }, piece.getColor());
        moves.push(...castlingMoves);
      }
      if (piece instanceof Pawn) {
        const enPassantMoves = EnPassant.getMoves(this, { x: row, y: col }, piece.getColor(), lastMove);
        moves.push(...enPassantMoves);
      }
      moves = CheckDetector.filterLegalMoves(this, { x: row, y: col }, moves);
    }

    return moves;
  }

  /**
   * Updates the check status of kings and returns their positions
   *
   * @returns Object containing check status and positions of both kings
   */
  public updateKingsCheckStatus(): { white: boolean; black: boolean; whitePosition: Coords | null; blackPosition: Coords | null } {
    const whiteKingPos = this.findFirstMatchingPiece((piece) => piece instanceof King && piece.getColor() === Color.White);

    const blackKingPos = this.findFirstMatchingPiece((piece) => piece instanceof King && piece.getColor() === Color.Black);

    let whiteInCheck = false;
    let blackInCheck = false;

    if (whiteKingPos) {
      const whiteKing = this.board[whiteKingPos.x][whiteKingPos.y] as King;
      whiteInCheck = CheckDetector.isSquareAttacked(this, whiteKingPos, Color.White);
      whiteKing.setIsInCheck(whiteInCheck);
      if (whiteInCheck) console.log("White king is in check!");
    }

    if (blackKingPos) {
      const blackKing = this.board[blackKingPos.x][blackKingPos.y] as King;
      blackInCheck = CheckDetector.isSquareAttacked(this, blackKingPos, Color.Black);
      blackKing.setIsInCheck(blackInCheck);
      if (blackInCheck) console.log("Black king is in check!");
    }

    return {
      white: whiteInCheck,
      black: blackInCheck,
      whitePosition: whiteKingPos,
      blackPosition: blackKingPos,
    };
  }

  /**
   *
   * @param matcher - A function that takes a piece and returns true if the piece matches the criteria.
   * @returns The Coords for the first matching piece.
   *
   * @example
   * // Find the Black King:
   * const kingPosition = this.findFirstMatchingPiece(
   *  (piece) => piece instanceof King && piece.getColor() === Color.Black
   * );
   * // This should returns the current position of the Black King: [{x : 4, y: 7}]
   * // assuming the Black King did not move.
   */
  public findFirstMatchingPiece(matcher: (piece: Piece | null) => Boolean): Coords | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (matcher(this.board[row][col])) return { x: row, y: col };
      }
    }
    return null;
  }

  /**
   * @param matcher - A function that takes a piece and returns true if it matches the criteria.
   * @returns An array of coordinates for all matching pieces, or empty array if none found.
   *
   * @example
   * // Find all white pawns:
   * const whitePawns = board.findPieces(p => p instanceof Pawn && p.getColor() === Color.White);
   */
  public findAllMatchingPieces(matcher: (piece: Piece | null) => Boolean): Coords[] {
    let results: Coords[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (matcher(this.board[row][col])) results.push({ x: row, y: col });
      }
    }
    return results;
  }

  public printBoard(): void {
    let result: string = "";
    this.board.forEach((row) => {
      row.forEach((piece) => {
        if (piece === null) result += "　";
        else {
          if (piece instanceof Pawn) piece.getColor() === Color.Black ? (result += "♟") : (result += "♙");
          if (piece instanceof Knight) piece.getColor() === Color.Black ? (result += "♞") : (result += "♘");
          if (piece instanceof Bishop) piece.getColor() === Color.Black ? (result += "♝") : (result += "♗");
          if (piece instanceof Rook) piece.getColor() === Color.Black ? (result += "♜") : (result += "♖");
          if (piece instanceof Queen) piece.getColor() === Color.Black ? (result += "♛") : (result += "♕");
          if (piece instanceof King) piece.getColor() === Color.Black ? (result += "♚") : (result += "♔");
        }
      });
      result += "\n";
    });
    console.log(result);
  }
}
