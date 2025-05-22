import { Color, Coords, FENChar } from "./interface";
import Board from "./board";
import BoardHistory from "./boardHistory";
import { King } from "./pieces/king";
import { Rook } from "./pieces/rook";
import { Pawn } from "./pieces/pawn";
import Castling from "./specialMoves/castling";
import Promotion from "./specialMoves/promotion";
import EnPassant from "./specialMoves/enPassant";
import Sound from "./sound";
import CheckDetector from "./checkDetector";

export default class Game {
  private board: Board;
  private currentTurn: Color = Color.White;
  private boardHistory: BoardHistory;
  private lastMove: [Coords, Coords] | null = null;
  private pendingPromotion: { from: Coords; to: Coords } | null = null;

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

  public getPendingPromotion(): { from: Coords; to: Coords } | null {
    return this.pendingPromotion;
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
    const kingPosition = this.board.findFirstMatchingPiece((piece) => piece instanceof King && piece.getColor() === this.currentTurn);

    if (kingPosition) {
      const king = boardState[kingPosition.x][kingPosition.y] as King;
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

    // Check for promotion
    if (currentPiece instanceof Pawn) {
      const isPromoting = (this.currentTurn === Color.White && toRow === 0) || (this.currentTurn === Color.Black && toRow === 7);
      if (isPromoting) {
        this.pendingPromotion = { from: fromCoords, to: toCoords };
        return true;
      }
    }

    let isCapture = boardState[toRow][toCol] !== null;
    let isCastling = false;
    let isEnPassant = false;
    let isCheck = false;
    let isCheckmate = false;
    let isPromote = false;

    // Handle castling
    if (currentPiece instanceof King && Math.abs(toCol - fromCol) === 2) {
      if (toRow !== fromRow) return false;
      newBoard = Castling.performCastling(this.board, fromCoords, toCoords);
      if (!newBoard) return false;
      Sound.castle();
      isCastling = true;
      isCapture = false;
    }
    // Handle en passant
    else if (currentPiece instanceof Pawn && EnPassant.isEnPassantCapture(fromCoords, toCoords, this.board, this.lastMove)) {
      newBoard = EnPassant.performEnPassant(this.board, fromCoords, toCoords);
      if (!newBoard) return false;
      Sound.capture();
      isEnPassant = true;
      isCapture = true;
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
      if (boardState[toRow][toCol]) {
        Sound.capture();
        isCapture = true;
      } else {
        Sound.normalMove();
      }

      // Update board state
      newBoardState[toRow][toCol] = currentPiece;
      newBoardState[fromRow][fromCol] = null;
      newBoard = new Board(newBoardState);
    }

    this.board = newBoard;

    // Add the board to history for navigation
    this.boardHistory.addHistory(newBoard.getBoard());

    // Check if the move puts opponent in check or checkmate
    const checkStatus = this.board.updateKingsCheckStatus();
    const opponentColor = this.currentTurn === Color.White ? Color.Black : Color.White;

    if ((opponentColor === Color.White && checkStatus.white) || (opponentColor === Color.Black && checkStatus.black)) {
      isCheck = true;
      Sound.check();

      isCheckmate = this.isCheckmate(opponentColor);
      if (isCheckmate) Sound.gameEnd();
    }

    const pieceName = currentPiece.getPieceName();
    this.boardHistory.logMove(fromCoords, toCoords, pieceName, this.board, isCapture, isCastling, isCheck, isCheckmate, isEnPassant, isPromote);

    this.lastMove = [fromCoords, toCoords];
    this.currentTurn = this.currentTurn === Color.White ? Color.Black : Color.White;

    return true;
  }

  /**
   * Completes a pawn promotion move.
   *
   * @param promoteTo - The piece to promote to (FENChar)
   * @returns True if the promotion was successful
   */
  public completePromotion(promoteTo: FENChar): boolean {
    if (!this.pendingPromotion) return false;

    const { from, to } = this.pendingPromotion;
    const boardState = this.board.getBoard();
    const piece = boardState[from.x][from.y];

    if (!(piece instanceof Pawn)) return false;

    const newBoard = Promotion.performPromotion(from, to, this.board, promoteTo);
    if (!newBoard) return false;

    this.board = newBoard;
    this.boardHistory.addHistory(newBoard.getBoard());
    const pieceName = piece.getPieceName();
    this.boardHistory.logMove(from, to, pieceName, this.board, boardState[to.x][to.y] !== null, false, false, false, false, true);

    this.lastMove = [from, to];
    this.currentTurn = this.currentTurn === Color.White ? Color.Black : Color.White;
    this.pendingPromotion = null;

    Sound.promote();
    return true;
  }

  private isCheckmate(color: Color): boolean {
    const pieces = this.board.findAllMatchingPieces((piece) => piece !== null && piece.getColor() === color);
    for (const piecePos of pieces) {
      const legalMoves = this.board.getLegalMoves(piecePos.x, piecePos.y, this.lastMove);
      if (legalMoves.length > 0) {
        return false;
      }
    }
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
}
