import { Color, Coords } from "./interface";
import Board from "./board";
import BoardHistory from "./boardHistory";
import { King } from "./pieces/king";
import { Rook } from "./pieces/rook";
import { Pawn } from "./pieces/pawn";
import Castling from "./specialMoves/castling";

export default class Game {
  private board: Board;
  private currentTurn: Color = Color.White;
  private boardHistory: BoardHistory;

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
    } else {
      const legalMoves = this.board.getLegalMoves(fromRow, fromCol);
      const isLegal = legalMoves.some((move) => move.x === toRow && move.y === toCol);
      if (!isLegal) return false;

      // Create a deep copy of the board
      const newBoardState = boardState.map((row) => [...row]);

      if (currentPiece instanceof Pawn && !currentPiece.getHasMoved()) currentPiece.setHasMoved();
      if (currentPiece instanceof Rook && !currentPiece.getHasMoved()) currentPiece.setHasMoved();
      if (currentPiece instanceof King && !currentPiece.getHasMoved()) currentPiece.setHasMoved();

      // Update board state
      newBoardState[toRow][toCol] = currentPiece;
      newBoardState[fromRow][fromCol] = null;
      newBoard = new Board(newBoardState);
    }

    this.board = newBoard;
    this.boardHistory.addHistory(newBoard.getBoard());
    this.currentTurn = this.currentTurn === Color.White ? Color.Black : Color.White;

    return true;
  }
}
