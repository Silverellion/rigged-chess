import React, { useState } from "react";
import InputBox from "./InputBox";
import ChatBubbles from "./ChatBubbles";
import { ChatManager, ChatMessage } from "../../backend/ollama/OllamaChatManager";

const Chatbox: React.FC = () => {
  const chatManager = ChatManager.getInstance();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<{
    dateSent: Date;
    text: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [model] = useState("gemma3");

  const syncState = (result: any) => {
    if (result.newMessages !== undefined) setMessages(result.newMessages);
  };

  const handleSendMessage = (text: string) => {
    setUserInput({ dateSent: new Date(), text });
    syncState(chatManager.handleUserInput(text, messages));
    setIsGenerating(true);
  };

  return (
    <div className="bg-[rgba(20,20,20,0.7)] shadow-[4px_12px_12px_rgba(0,0,0,0.2)] h-full rounded-lg flex flex-col">
      <div className="flex-1 overflow-hidden p-4">
        <ChatBubbles
          userInput={userInput}
          messages={messages}
          model={model}
          supportsImages={true}
          onAIResponse={(response) => {
            if (response) {
              syncState(chatManager.updateWithAIResponse(response, messages));
            }
            setIsGenerating(false);
          }}
        />
      </div>
      <InputBox onSendMessage={handleSendMessage} isGenerating={isGenerating} />
    </div>
  );
};

export default Chatbox;
