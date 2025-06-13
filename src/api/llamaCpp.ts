const PORT = import.meta.env.VITE_PORT || 1337;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Sends a chat prompt to the llama.cpp backend
 * @param prompt The text prompt to send to the model
 * @returns Promise with the model's response text
 */
async function sendChatPrompt(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get response from model");
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error in sendChatPrompt:", error);
    return "Error communicating with the model.";
  }
}

export { sendChatPrompt };
