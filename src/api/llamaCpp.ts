const PORT = import.meta.env.VITE_PORT || 1337;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Checks if the model is initialized and ready
 * @returns Promise with the model status
 */
async function checkModelStatus(): Promise<{ initialized: boolean; model: string }> {
  try {
    const response = await fetch(`${BASE_URL}/model-status`);
    if (!response.ok) {
      throw new Error("Failed to check model status");
    }
    return await response.json();
  } catch (error) {
    console.error("Error checking model status:", error);
    return { initialized: false, model: "unknown" };
  }
}

/**
 * Sends a chat prompt to the llama.cpp backend
 * @param prompt The text prompt to send to the model
 * @returns Promise with the model's response text
 */
async function sendChatPrompt(prompt: string): Promise<string> {
  try {
    const status = await checkModelStatus();
    if (!status.initialized) {
      return "The language model is still initializing. Please wait a moment and try again.";
    }

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

export { sendChatPrompt, checkModelStatus };
