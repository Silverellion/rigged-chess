import React, { useState } from "react";
import InputBox from "./InputBox";
import ChatBubbles from "./ChatBubbles";
import { ChatManager, ChatMessage } from "../../backend/ollama/ChatManager";

const Chatbox: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<{
    dateSent: Date;
    text: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [model] = useState("gemma3");

  const chatManager = React.useMemo(() => ChatManager.getInstance(), []);
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    setIsGenerating(true);
    const { newMessages } = chatManager.handleUserInput(text, messages);
    setMessages(newMessages);
    setUserInput({ dateSent: new Date(), text });
  };

  const handleAIResponse = (response: string | null) => {
    if (response) {
      const { newMessages } = chatManager.updateWithAIResponse(response, messages);
      setMessages(newMessages);
    }
    setIsGenerating(false);
  };

  return (
    // prettier-ignore
    <div className="bg-[rgba(20,20,20,0.7)] shadow-[4px_12px_12px_rgba(0,0,0,0.2)] h-full rounded-lg flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ChatBubbles
          userInput={userInput}
          messages={messages}
          model={model}
          supportsImages={true}
          onAIResponse={handleAIResponse}
        />
      </div>
      <InputBox 
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default Chatbox;
