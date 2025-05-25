import React from "react";
import { ChatMessage } from "../../api/ollama/OllamaChatManager";
import CodeblockConverter from "../utils/CodeblockConverter";

type MessageBubbleProps = {
  message: ChatMessage;
  isLatestAI?: boolean;
};

const ChatBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  // prettier-ignore
  return (
    <div className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          mt-4 mb-1 pt-2 pb-1.5 px-3 max-w-full rounded-[1rem] 
          break-words whitespace-pre-wrap overflow-wrap-anywhere
        bg-[rgb(255,255,255)] border border-[rgb(200,80,80)]
      `}>
        {message.text && message.text.trim() !== "" && (
          <div className="mb-1">
            <CodeblockConverter inputMessage={message.text} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
