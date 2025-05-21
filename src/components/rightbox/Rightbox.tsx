import React from "react";
import Logbox from "./Logbox";
import Chatbox from "./Chatbox";

const Rightbox: React.FC = () => {
  return (
    <>
      <div
        className="bg-transparent shadow-[4px_12px_12px_rgba(0,0,0,0.2)] 
        grid grid-rows-[3fr_5fr]"
      >
        <Logbox />
        <Chatbox />
      </div>
    </>
  );
};
export default Rightbox;
