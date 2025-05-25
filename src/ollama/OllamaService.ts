import { OllamaMemoryManager } from "./OllamaMemoryManager";
import { ChatManager } from "./OllamaChatManager";

const baseUrl = "http://localhost:11434";

export default async function OllamaResponse(
  prompt: string,
  streamHandler: ((text: string) => void) | null = null,
  model: string = "gemma3",
  imageData?: string | string[]
) {
  const chatManager = ChatManager.getInstance();
  const memoryId = chatManager.getCurrentChatId() || "temp-" + Date.now();

  return await OllamaMemoryManager.chat(
    memoryId,
    prompt,
    model,
    baseUrl,
    streamHandler || undefined,
    imageData
  );
}
