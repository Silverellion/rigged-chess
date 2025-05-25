/**
 * Posts the current FEN position to the backend for Stockfish analysis
 * @param fen The FEN string representation of the current board position
 * @param depth The search depth for Stockfish (default: 12)
 * @returns Promise with the response data
 */
async function postFEN(fen: string, depth: number = 12): Promise<Response> {
  try {
    const response = await fetch("http://localhost:3001/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fen,
        depth,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("Error posting FEN to server:", error);
    throw error;
  }
}

/**
 * Gets the best move from Stockfish for the current position
 * @returns Promise with the best move in UCI format (e.g., "e2e4")
 */
async function getBestMove(): Promise<string> {
  try {
    const response = await fetch("http://localhost:3001/bestmove");

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.bestMove) {
      throw new Error("No best move returned from server");
    }

    console.log(`Stockfish suggests: ${data.bestMove}`);
    return data.bestMove;
  } catch (error) {
    console.error("Error getting best move from server:", error);
    throw error;
  }
}

export { postFEN, getBestMove };
