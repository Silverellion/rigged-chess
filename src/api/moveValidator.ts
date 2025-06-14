import { Coords } from "../chessLogics/interface";

const PORT = import.meta.env.VITE_PORT || 1337;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Validates and makes a move on the backend
 * @param from Starting coordinates
 * @param to Destination coordinates
 * @param promotionPiece Optional promotion piece
 * @param getStockfishMove Whether to get Stockfish's response
 * @returns Promise with validation result and updated board state
 */
async function validateMove(
  from: Coords,
  to: Coords,
  promotionPiece: string = "",
  getStockfishMove: boolean = false
): Promise<{
  valid: boolean;
  promotionPending: boolean;
  boardFen?: string;
  turn?: "white" | "black";
  stockfishMove?: string;
  legalMoves: Coords[];
}> {
  try {
    const response = await fetch(`${BASE_URL}/validate-move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromX: from.x,
        fromY: from.y,
        toX: to.x,
        toY: to.y,
        promotionPiece,
        getStockfishMove,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to validate move");
    }

    return await response.json();
  } catch (error) {
    console.error("Error validating move:", error);
    return { valid: false, promotionPending: false, legalMoves: [] };
  }
}

/**
 * Gets the current board state from the backend
 * @returns Promise with board state information
 */
async function getBoardState(): Promise<{
  fen: string;
  turn: "white" | "black";
  promotionPending: boolean;
}> {
  try {
    const response = await fetch(`${BASE_URL}/board`);

    if (!response.ok) {
      throw new Error("Failed to get board state");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting board state:", error);
    return {
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      turn: "white",
      promotionPending: false,
    };
  }
}

/**
 * Gets all legal moves for a piece at the specified position
 * @param position The coordinates of the piece
 * @returns Promise with an array of legal moves
 */
async function getLegalMoves(position: Coords): Promise<Coords[]> {
  try {
    const response = await fetch(`${BASE_URL}/legal-moves?x=${position.x}&y=${position.y}`);

    if (!response.ok) {
      throw new Error("Failed to get legal moves");
    }

    const data = await response.json();
    return data.moves || [];
  } catch (error) {
    console.error("Error getting legal moves:", error);
    return [];
  }
}

export { validateMove, getBoardState, getLegalMoves };
