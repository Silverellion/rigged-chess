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
    <div className="p-2 border-t border-[rgba(60,60,60,0.5)] bg-[rgba(25,25,25,0.3)] rounded-b-lg">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onInput={handleTextareaResize}
        className="
          w-full resize-none overflow-y-auto min-h-[40px] max-h-[20vh] p-2
          placeholder-[rgb(90,90,90)] text-white rounded-md
          focus:outline-none bg-[rgba(40,40,40,0.4)]
        "
        placeholder="Message (Enter to send, Shift+Enter for new line)"
        disabled={isGenerating}
      ></textarea>
    </div>
  );
};

export default InputBox;
