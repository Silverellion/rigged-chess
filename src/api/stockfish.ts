/**
 * Posts the current FEN position to the backend for Stockfish analysis
 * @param fen The FEN string representation of the current board position
 * @param depth The search depth for Stockfish (default: 12)
 * @returns Promise with the response data
 */
async function postFEN(fen: string, depth: number = 12): Promise<void> {
  await fetch("http://localhost:1337", {
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
  const response = await fetch("http://localhost:1337");
  const data = await response.json();
  return data.bestmove;
}

export { postFEN, getBestMove };
