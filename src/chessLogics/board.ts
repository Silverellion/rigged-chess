import { Color, Coords } from "./interface";
import { Piece } from "./pieces/piece";
import { Pawn } from "./pieces/pawn";
import { Knight } from "./pieces/knight";
import { Bishop } from "./pieces/bishop";
import { Rook } from "./pieces/rook";
import { Queen } from "./pieces/queen";
import { King } from "./pieces/king";
import Castling from "./specialMoves/castling";

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
   * Retrieves all legal moves for a piece at the specified position on the board.
   *
   * This method examines the piece at the given row and column coordinates and.
   * calculates all valid moves according to that piece's movement rules. The method.
   * handles all chess piece types (Pawn, Knight, Bishop, Rook, Queen, and King)
   * and their specific movement patterns.
   *
   * @param row - The row index (0-7) of the piece on the chess board.
   * @param col - The column index (0-7) of the piece on the chess board.
   * @returns An array of Coords objects representing all legal destination squares
   *          for the piece, or an empty array if the square is empty or contains an invalid piece.
   *
   * @example
   * // Get all legal moves for the piece at position (3,4)
   * const moves = board.getLegalMoves(3, 4);
   * console.log(moves); // [{x: 2, y: 3}, {x: 4, y: 5}, ...]
   */
  public getLegalMoves(row: number, col: number): Coords[] {
    const piece: Piece | null = this.board[row][col];
    let moves: Coords[] = [];
    if (piece instanceof Pawn || piece instanceof Knight || piece instanceof Bishop || piece instanceof Rook || piece instanceof King || piece instanceof Queen) {
      moves = piece.getMoves({ x: row, y: col }, this.board);
      if (piece instanceof King) {
        const castlingMoves = Castling.getPossibleCastlingMoves(this, { x: row, y: col }, piece.getColor());
        moves.push(...castlingMoves);
      }
    }
    return moves;
  }

  /**
   * Handles moving a piece from one position to another.
   *
   * @param fromCoords - The starting coordinates of the piece.
   * @param toCoords - The destination coordinates for the piece.
   * @returns A new Board instance with the updated state, or null if the move is invalid.
   */
  public handleMove(fromCoords: Coords, toCoords: Coords): Board | null {
    const { x: fromRow, y: fromCol } = fromCoords;
    const { x: toRow, y: toCol } = toCoords;

    const currentPiece = this.board[fromRow][fromCol];
    if (!currentPiece) return null;

    if (currentPiece instanceof King) {
      if (toCol === fromCol + 2) return Castling.performCastling(this, fromCoords, toCoords);
      if (toCol === fromCol - 2) return Castling.performCastling(this, fromCoords, toCoords);
    }

    const legalMoves = this.getLegalMoves(fromRow, fromCol);
    const isLegal = legalMoves.some((move) => move.x === toRow && move.y === toCol);
    if (!isLegal) return null;

    // Create a deep copy of the board
    const newBoardState = this.board.map((row) => [...row]);

    if (currentPiece instanceof Pawn && !currentPiece.getHasMoved()) currentPiece.setHasMoved();
    if (currentPiece instanceof Rook && !currentPiece.getHasMoved()) currentPiece.setHasMoved();
    if (currentPiece instanceof King && !currentPiece.getHasMoved()) currentPiece.setHasMoved();

    // Update board state
    newBoardState[toRow][toCol] = currentPiece;
    newBoardState[fromRow][fromCol] = null;
    return new Board(newBoardState);
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

  /**
   * Checks if the King is in check or not.
   *
   * @param color - The color of the King.
   * @returns - True if the King is in check.
   */
  public isKingInCheck(color: Color): boolean {
    const kingPosition = this.findFirstMatchingPiece((piece) => piece instanceof King && piece.getColor() === color);
    if (!kingPosition) return false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        // Get the opponent's pieces by checking if the color is opposite
        if (piece && piece.getColor() !== color) {
          const moves = this.getLegalMoves(row, col);
          if (moves.some((move) => move.x === kingPosition.x && move.y === kingPosition.y)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public updateCheckStatus(): void {
    const kings = this.findAllMatchingPieces((piece) => piece instanceof King);
    kings.forEach((kingPosition) => {
      const king = this.board[kingPosition.x][kingPosition.y] as King;
      king.setIsInCheck(this.isKingInCheck(king.getColor()));
    });
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
