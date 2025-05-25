import Board from "./board";
import { Piece } from "./pieces/piece";
import { ActionType, Color, Coords, FENChar } from "./interface";
import { King } from "./pieces/king";
import { Rook } from "./pieces/rook";
import { Pawn } from "./pieces/pawn";

interface MoveHistoryEntry {
  notation: string;
  type: ActionType;
}

export default class BoardHistory {
  private boardHistory: Board[];
  private currentHistoryIndex: number = 0;
  private currentTurnCycle: number = 0; // 0 = white, 1 = black
  private currentTurnCount: number = 1;
  private halfMoveClock: number = 0; // For 50 moves rule
  private moveLog: string[] = [];
  private whiteMoves: string[] = [];
  private blackMoves: string[] = [];
  private moveHistory: MoveHistoryEntry[] = [];

  constructor(board?: (Piece | null)[][]) {
    this.boardHistory = [];
    if (board) {
      const newBoard = new Board(board);
      this.boardHistory.push(newBoard);
    }
  }

  public addHistory(board: (Piece | null)[][]): boolean {
    const newBoard = new Board(board);
    this.boardHistory.push(newBoard);
    this.currentHistoryIndex = this.boardHistory.length - 1;
    return true;
  }

  public getHistory(): Board[] {
    return this.boardHistory;
  }

  public getMoveLog(): string[] {
    return this.moveLog;
  }

  public getMoveHistory(): MoveHistoryEntry[] {
    return this.moveHistory;
  }

  public getWhiteMoves(): string[] {
    return this.whiteMoves;
  }

  public getBlackMoves(): string[] {
    return this.blackMoves;
  }

  public getCurrentHistoryIndex(): number {
    return this.currentHistoryIndex;
  }

  public setCurrentHistoryIndex(index: number): void {
    if (index >= 0 && index < this.boardHistory.length) {
      this.currentHistoryIndex = index;
    }
  }

  public getTurnCount(): number {
    return this.currentTurnCount;
  }

  public getCurrentBoard(): Board {
    return this.boardHistory[this.currentHistoryIndex];
  }

  /**
   * Converts the current board state to FEN (Forsyth-Edwards Notation) string
   *
   * @param lastMove The last move made on the board, used for en passant
   * @returns FEN string representation of the current board state
   */
  public toFEN(lastMove: [Coords, Coords] | null = null): string {
    const board = this.getCurrentBoard();
    const boardState = board.getBoard();

    let fen = "";
    for (let row = 0; row < 8; row++) {
      let emptyCount = 0;
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col];
        if (piece === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          fen += piece.getPieceName();
        }
      }

      if (emptyCount > 0) {
        fen += emptyCount;
      }

      if (row < 7) fen += "/";
    }

    const activeColor = this.currentTurnCycle === 0 ? "w" : "b";
    fen += " " + activeColor;

    // Castling
    let castling = "";
    const whiteKingPos = board.findFirstMatchingPiece(
      (piece) => piece instanceof King && piece.getColor() === Color.White
    );
    const blackKingPos = board.findFirstMatchingPiece(
      (piece) => piece instanceof King && piece.getColor() === Color.Black
    );

    if (whiteKingPos) {
      const whiteKing = boardState[whiteKingPos.x][whiteKingPos.y] as King;

      if (!whiteKing.getHasMoved()) {
        const kingsideRook = boardState[7][7];
        if (
          kingsideRook instanceof Rook &&
          kingsideRook.getColor() === Color.White &&
          !kingsideRook.getHasMoved()
        ) {
          castling += "K";
        }

        const queensideRook = boardState[7][0];
        if (
          queensideRook instanceof Rook &&
          queensideRook.getColor() === Color.White &&
          !queensideRook.getHasMoved()
        ) {
          castling += "Q";
        }
      }
    }

    if (blackKingPos) {
      const blackKing = boardState[blackKingPos.x][blackKingPos.y] as King;

      if (!blackKing.getHasMoved()) {
        const kingsideRook = boardState[0][7];
        if (
          kingsideRook instanceof Rook &&
          kingsideRook.getColor() === Color.Black &&
          !kingsideRook.getHasMoved()
        ) {
          castling += "k";
        }

        const queensideRook = boardState[0][0];
        if (
          queensideRook instanceof Rook &&
          queensideRook.getColor() === Color.Black &&
          !queensideRook.getHasMoved()
        ) {
          castling += "q";
        }
      }
    }

    fen += " " + (castling || "-");

    // En passant target square
    let enPassant = "-";
    if (lastMove) {
      const [fromPos, toPos] = lastMove;
      const movedPiece = boardState[toPos.x][toPos.y];

      if (movedPiece instanceof Pawn && Math.abs(fromPos.x - toPos.x) === 2) {
        const direction = movedPiece.getColor() === Color.White ? 1 : -1;
        const epSquare = { x: toPos.x + direction, y: toPos.y };
        enPassant = board.getNotation(epSquare);
      }
    }
    fen += " " + enPassant;
    fen += " " + this.halfMoveClock;
    fen += " " + this.currentTurnCount;

    return fen;
  }

  /**
   * Updates the halfmove clock based on the type of move
   *
   * @param isCapture Whether the move was a capture
   * @param isPawnMove Whether a pawn was moved
   */
  public updateHalfMoveClock(isCapture: boolean, isPawnMove: boolean): void {
    if (isCapture || isPawnMove) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock++;
    }
  }

  /**
   * Logs a move in standard chess notation.
   */
  public logMove(
    fromCoords: Coords,
    toCoords: Coords,
    pieceName: FENChar,
    board: Board,
    isCapture: boolean = false,
    isCastling: boolean = false,
    isCheck: boolean = false,
    isCheckmate: boolean = false,
    isEnPassant: boolean = false,
    isPromote: boolean = false,
    promotedTo: FENChar | null = null
  ): void {
    // Update halfmove clock
    const isPawnMove = pieceName === FENChar.WhitePawn || pieceName === FENChar.BlackPawn;
    this.updateHalfMoveClock(isCapture || isEnPassant, isPawnMove);

    const fromNotation = board.getNotation(fromCoords);
    const toNotation = board.getNotation(toCoords);
    let pieceSymbol = "";

    switch (pieceName) {
      case FENChar.WhiteKnight:
      case FENChar.BlackKnight:
        pieceSymbol = "N";
        break;
      case FENChar.WhiteBishop:
      case FENChar.BlackBishop:
        pieceSymbol = "B";
        break;
      case FENChar.WhiteRook:
      case FENChar.BlackRook:
        pieceSymbol = "R";
        break;
      case FENChar.WhiteQueen:
      case FENChar.BlackQueen:
        pieceSymbol = "Q";
        break;
      case FENChar.WhiteKing:
      case FENChar.BlackKing:
        pieceSymbol = "K";
        break;
    }

    let moveNotation = "";
    let moveType: ActionType = ActionType.Normal;

    if (isCastling) {
      moveNotation = toCoords.y > fromCoords.y ? "O-O" : "O-O-O";
      moveType = ActionType.Castle;
    } else if (isEnPassant) {
      moveNotation = `${fromNotation[0]}x${toNotation} e.p.`;
      moveType = ActionType.EnPassant;
    } else if (isPromote) {
      let promotionPiece = "Q";
      if (promotedTo) {
        switch (promotedTo) {
          case FENChar.WhiteKnight:
          case FENChar.BlackKnight:
            promotionPiece = "N";
            break;
          case FENChar.WhiteBishop:
          case FENChar.BlackBishop:
            promotionPiece = "B";
            break;
          case FENChar.WhiteRook:
          case FENChar.BlackRook:
            promotionPiece = "R";
            break;
        }
      }

      if (isCapture) {
        moveNotation = `${fromNotation[0]}x${toNotation}=${promotionPiece}`;
      } else {
        moveNotation = `${toNotation}=${promotionPiece}`;
      }
      moveType = ActionType.Promote;
    } else if (isCapture) {
      if (pieceSymbol === "") {
        moveNotation = `${fromNotation[0]}x${toNotation}`;
      } else {
        moveNotation = `${pieceSymbol}x${toNotation}`;
      }
      moveType = ActionType.Capture;
    } else {
      if (pieceSymbol === "") {
        moveNotation = toNotation;
      } else {
        moveNotation = `${pieceSymbol}${toNotation}`;
      }
      moveType = ActionType.Normal;
    }

    if (isCheckmate) {
      moveNotation += "#";
      moveType = ActionType.GameEnd;
    } else if (isCheck) {
      moveNotation += "+";
      moveType = ActionType.Check;
    }

    const historyEntry: MoveHistoryEntry = {
      notation: moveNotation,
      type: moveType,
    };
    this.moveHistory.push(historyEntry);

    // If this is white's move
    if (this.currentTurnCycle === 0) {
      this.whiteMoves.push(moveNotation);
      this.moveLog.push(`${this.currentTurnCount}. ${moveNotation}`);
      this.currentTurnCycle = 1;
    }
    // If it's black's move
    else {
      this.blackMoves.push(moveNotation);
      const lastIdx = this.moveLog.length - 1;
      this.moveLog[lastIdx] = `${this.moveLog[lastIdx]} ${moveNotation}`;
      this.currentTurnCycle = 0;
      this.currentTurnCount++;
    }

    console.log(this.moveLog[this.moveLog.length - 1]);
  }

  public goToPreviousMove(): Board | null {
    if (this.currentHistoryIndex > 0) {
      this.currentHistoryIndex--;
      return this.boardHistory[this.currentHistoryIndex];
    }
    return null;
  }

  public goToNextMove(): Board | null {
    if (this.currentHistoryIndex < this.boardHistory.length - 1) {
      this.currentHistoryIndex++;
      return this.boardHistory[this.currentHistoryIndex];
    }
    return null;
  }

  public goToStart(): Board | null {
    if (this.boardHistory.length > 0) {
      this.currentHistoryIndex = 0;
      return this.boardHistory[0];
    }
    return null;
  }

  public goToEnd(): Board | null {
    if (this.boardHistory.length > 0) {
      this.currentHistoryIndex = this.boardHistory.length - 1;
      return this.boardHistory[this.currentHistoryIndex];
    }
    return null;
  }

  public goToMove(moveIndex: number): Board | null {
    const targetIndex = moveIndex + 1;
    if (targetIndex >= 0 && targetIndex < this.boardHistory.length) {
      this.currentHistoryIndex = targetIndex;
      return this.boardHistory[this.currentHistoryIndex];
    }
    return null;
  }

  public printHistory(index: number): void {
    const board = this.boardHistory[index];
    board.printBoard();
  }
}
