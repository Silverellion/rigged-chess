import { sendChatPrompt } from "../api/llamaCpp";

export default async function LlamaResponse(
  prompt: string,
  streamHandler: ((text: string) => void) | null = null
) {
  if (streamHandler) {
    streamHandler("");
  }

  try {
    const response = await sendChatPrompt(prompt);

    if (streamHandler) {
      const words = response.split(" ");
      let partialResponse = "";

      for (let i = 0; i < words.length; i++) {
        partialResponse += (i > 0 ? " " : "") + words[i];
        streamHandler(partialResponse);

        if (i < words.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 15));
        }
      }
    }

    return response;
  } catch (error) {
    console.error("Error in LlamaResponse:", error);
    const errorMessage = "Error communicating with the model.";
    if (streamHandler) {
      streamHandler(errorMessage);
    }
    return errorMessage;
  }
}
