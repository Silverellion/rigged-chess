export interface ChatMessage {
  text: string;
  isUser: boolean;
  image?: string | string[];
}

export class ChatManager {
  private static instance: ChatManager;
  private chats: Map<string, ChatMessage[]> = new Map();
  private currentChatId: string = "";

  private constructor() {
    this.createNewChat();
  }

  public static getInstance(): ChatManager {
    if (!ChatManager.instance) {
      ChatManager.instance = new ChatManager();
    }
    return ChatManager.instance;
  }

  public createNewChat(): string {
    const chatId = `chat-${Date.now()}`;
    this.chats.set(chatId, []);
    this.currentChatId = chatId;
    return chatId;
  }

  public getCurrentChatId(): string {
    return this.currentChatId;
  }

  public handleUserInput(
    message: string,
    currentMessages: ChatMessage[]
  ): { newMessages: ChatMessage[] } {
    if (!message.trim()) return { newMessages: currentMessages };

    const newMessage: ChatMessage = {
      text: message,
      isUser: true,
    };

    const updatedMessages = [...currentMessages, newMessage];
    this.chats.set(this.currentChatId, updatedMessages);
    return { newMessages: updatedMessages };
  }

  public updateWithAIResponse(
    response: string,
    currentMessages: ChatMessage[]
  ): { newMessages: ChatMessage[] } {
    if (!response.trim()) return { newMessages: currentMessages };

    const newMessage: ChatMessage = {
      text: response,
      isUser: false,
    };

    const updatedMessages = [...currentMessages, newMessage];
    this.chats.set(this.currentChatId, updatedMessages);
    return { newMessages: updatedMessages };
  }

  public getChatMessages(chatId: string): ChatMessage[] {
    return this.chats.get(chatId) || [];
  }

  public switchChat(chatId: string): boolean {
    if (this.chats.has(chatId)) {
      this.currentChatId = chatId;
      return true;
    }
    return false;
  }

  public clearCurrentChat(): void {
    this.chats.set(this.currentChatId, []);
  }
}
