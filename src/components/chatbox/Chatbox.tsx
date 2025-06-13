import React, { useState } from "react";
import InputBox from "./InputBox";
import ChatBubbles from "./ChatBubbles";
import { ChatManager, ChatMessage } from "../../llama/LlamaChatManager";

const Chatbox: React.FC = () => {
  const chatManager = ChatManager.getInstance();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<{
    dateSent: Date;
    text: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const syncState = (result: any) => {
    if (result.newMessages !== undefined) setMessages(result.newMessages);
  };

  const handleSendMessage = (text: string) => {
    setUserInput({ dateSent: new Date(), text });
    syncState(chatManager.handleUserInput(text, messages));
    setIsGenerating(true);
  };

  return (
    <div
      className="bg-transparent shadow-[4px_12px_12px_rgba(0,0,0,0.2)] 
    flex flex-col flex-1 min-h-0 h-0"
    >
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <ChatBubbles
          userInput={userInput}
          messages={messages}
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
