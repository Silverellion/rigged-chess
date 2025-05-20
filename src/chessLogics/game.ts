import { Color, Coords } from "./interface";
import Board from "./board";
import BoardHistory from "./boardHistory";
import { King } from "./pieces/king";
import { Rook } from "./pieces/rook";
import { Pawn } from "./pieces/pawn";
import Castling from "./specialMoves/castling";
import EnPassant from "./specialMoves/enPassant";
import Sound from "./sound";

export default class Game {
  private board: Board;
  private currentTurn: Color = Color.White;
  private currentTurnCycle: number = 0; // When this reaches 1, it returns to 0 and increase currentTurnCount by 1
  private currentTurnCount: number = 1;
  private boardHistory: BoardHistory;
  private lastMove: [Coords, Coords] | null = null;

  constructor(initialBoard?: Board) {
    this.board = initialBoard || new Board();
    this.boardHistory = new BoardHistory(this.board.getBoard());
  }

  public getBoard(): Board {
    return this.board;
  }

  public getCurrentTurn(): Color {
    return this.currentTurn;
  }

  public getBoardHistory(): BoardHistory {
    return this.boardHistory;
  }

  public getLastMove(): [Coords, Coords] | null {
    return this.lastMove;
  }

  public getCurrentTurnCount(): number {
    return this.currentTurnCount;
  }

  /**
   * Handles moving a piece from one position to another.
   *
   * @param fromCoords - The starting coordinates of the piece.
   * @param toCoords - The destination coordinates for the piece.
   * @returns A new Board instance with the updated state, or null if the move is invalid.
   */
  public handleMove(fromCoords: Coords, toCoords: Coords): boolean {
    const { x: fromRow, y: fromCol } = fromCoords;
    const { x: toRow, y: toCol } = toCoords;
    const boardState = this.board.getBoard();
    const currentPiece = boardState[fromRow][fromCol];

    if (!currentPiece || currentPiece.getColor() !== this.currentTurn) return false;
    let newBoard: Board | null = null;

    // Handle castling
    if (currentPiece instanceof King && Math.abs(toCol - fromCol) === 2) {
      if (toRow !== fromRow) return false;
      newBoard = Castling.performCastling(this.board, fromCoords, toCoords);
      if (!newBoard) return false;
      Sound.castle();
    }
    // Handle en passant
    else if (currentPiece instanceof Pawn && EnPassant.isEnPassantCapture(fromCoords, toCoords, this.board, this.lastMove)) {
      newBoard = EnPassant.performEnPassant(this.board, fromCoords, toCoords);
      if (!newBoard) return false;
      Sound.capture();
    }
    // Handle regular moves
    else {
      const legalMoves = this.board.getLegalMoves(fromRow, fromCol, this.lastMove);
      const isLegal = legalMoves.some((move) => move.x === toRow && move.y === toCol);
      if (!isLegal) return false;

      const newBoardState = boardState.map((row) => [...row]);
      if (currentPiece instanceof Pawn && !currentPiece.getHasMoved()) currentPiece.setHasMoved();
      if (currentPiece instanceof Rook && !currentPiece.getHasMoved()) currentPiece.setHasMoved();
      if (currentPiece instanceof King && !currentPiece.getHasMoved()) currentPiece.setHasMoved();

      // Check if capturing
      if (boardState[toRow][toCol]) Sound.capture();
      else Sound.normalMove();

      // Update board state
      newBoardState[toRow][toCol] = currentPiece;
      newBoardState[fromRow][fromCol] = null;
      newBoard = new Board(newBoardState);
    }

    this.board = newBoard;
    this.boardHistory.addHistory(newBoard.getBoard());
    this.lastMove = [fromCoords, toCoords];
    this.currentTurn = this.currentTurn === Color.White ? Color.Black : Color.White;

    return true;
  }
}
