const PORT = import.meta.env.VITE_PORT || 1337;
const BASE_URL = `http://localhost:${PORT}`;
/**
 * Posts the current FEN position to the backend for Stockfish analysis
 * @param fen The FEN string representation of the current board position
 * @param depth The search depth for Stockfish (default: 16)
 * @returns Promise with the response data
 */
async function postFEN(fen: string, depth: number = 16): Promise<void> {
  await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fen, depth }),
  });
}

/**
 * Gets the best move from Stockfish for the current position
 * @returns Promise with the best move in UCI format (e.g., "e2e4")
 */
async function getBestMove(): Promise<string> {
  const response = await fetch(`${BASE_URL}`);
  const data = await response.json();
  return data.bestmove;
}

export { postFEN, getBestMove };
