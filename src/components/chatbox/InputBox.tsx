import React, { useState, useRef, KeyboardEvent } from "react";

interface InputBoxProps {
  onSendMessage: (text: string) => void;
  isGenerating?: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({ onSendMessage, isGenerating = false }) => {
  const [message, setMessage] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        if (message.trim() && !isGenerating) {
          onSendMessage(message);
          setMessage("");
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
          }
        }
      }
    }
  };

  const handleTextareaResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="p-2 rounded-b-lg">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onInput={handleTextareaResize}
        className="
          w-full resize-none overflow-y-auto min-h-[40px] max-h-[20vh] p-2 rounded-md
          placeholder-[rgb(90,90,90)] bg-[rgb(255,255,255)] 
          focus:outline-none border border-[rgb(200,80,80)] 
        "
        placeholder="Message"
        disabled={isGenerating}
      ></textarea>
    </div>
  );
};

export default InputBox;
