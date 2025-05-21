import { Color, Coords } from "./interface";
import Board from "./board";
import BoardHistory from "./boardHistory";
import { King } from "./pieces/king";
import { Rook } from "./pieces/rook";
import { Pawn } from "./pieces/pawn";
import Castling from "./specialMoves/castling";
import EnPassant from "./specialMoves/enPassant";
import Sound from "./sound";
import CheckDetector from "./checkDetector";

export default class Game {
  private board: Board;
  private currentTurn: Color = Color.White;
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
    const kingPos = this.board.findFirstMatchingPiece((piece) => piece instanceof King && piece.getColor() === this.currentTurn);

    if (kingPos) {
      const king = boardState[kingPos.x][kingPos.y] as King;
      if (king.getIsInCheck()) {
        // Create a temporary board to see if this move would get the king out of check
        const tempBoardState = boardState.map((row) => [...row]);
        tempBoardState[toRow][toCol] = currentPiece;
        tempBoardState[fromRow][fromCol] = null;

        const tempBoard = new Board(tempBoardState);
        const kingStillInCheck = CheckDetector.isKingInCheck(tempBoard, this.currentTurn);

        if (kingStillInCheck) {
          Sound.checkWarning();
          return false;
        }
      }
    }

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

    // Log the move with the new signature
    const pieceName = currentPiece.getPieceName();
    this.boardHistory.logMove(toCoords, pieceName, this.board);

    // Check shenanigans
    const checkStatus = this.board.updateKingsCheckStatus();
    const opponentColor = this.currentTurn === Color.White ? Color.Black : Color.White;
    if ((opponentColor === Color.White && checkStatus.white) || (opponentColor === Color.Black && checkStatus.black)) {
      Sound.check();
    }
    this.checkForCheckmate();
    this.boardHistory.addHistory(newBoard.getBoard());
    this.lastMove = [fromCoords, toCoords];
    this.currentTurn = this.currentTurn === Color.White ? Color.Black : Color.White;

    return true;
  }

  public setToHistoryPoint(index: number): void {
    const historyBoard = this.boardHistory.goToMove(index);
    if (historyBoard) {
      this.board = historyBoard;
    }
  }

  public goToPreviousMove(): Board | null {
    const previousBoard = this.boardHistory.goToPreviousMove();
    if (previousBoard) {
      this.board = previousBoard;
      return previousBoard;
    }
    return null;
  }

  public goToNextMove(): Board | null {
    const nextBoard = this.boardHistory.goToNextMove();
    if (nextBoard) {
      this.board = nextBoard;
      return nextBoard;
    }
    return null;
  }

  public goToStart(): Board | null {
    const startBoard = this.boardHistory.goToStart();
    if (startBoard) {
      this.board = startBoard;
      return startBoard;
    }
    return null;
  }

  public goToEnd(): Board | null {
    const endBoard = this.boardHistory.goToEnd();
    if (endBoard) {
      this.board = endBoard;
      return endBoard;
    }
    return null;
  }

  private checkForCheckmate(): void {
    const currentColor = this.currentTurn === Color.White ? Color.Black : Color.White;
    const kingPos = this.board.findFirstMatchingPiece((piece) => piece instanceof King && piece.getColor() === currentColor);

    if (!kingPos) return;
    const king = this.board.getBoard()[kingPos.x][kingPos.y] as King;
    if (!king.getIsInCheck()) return;

    // Check if any piece can make a legal move
    const pieces = this.board.findAllMatchingPieces((piece) => piece !== null && piece.getColor() === currentColor);
    for (const piecePos of pieces) {
      const legalMoves = this.board.getLegalMoves(piecePos.x, piecePos.y, this.lastMove);
      if (legalMoves.length > 0) {
        return;
      }
    }

    Sound.gameEnd();
    console.log(`${currentColor === Color.White ? "White" : "Black"} king has been checkmated!`);
  }
}
