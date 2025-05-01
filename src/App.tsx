import { useState } from "react";
import "./global.css";
import Logbox from "./components/logbox/logbox";
import Chessboard from "./components/chessboard/Chessboard";
import Chatbox from "./components/chatbox/Chatbox";

function App() {
  return (
    <>
      <div
        className="
      bg-[rgb(30,30,30)] w-screen h-screen
      grid grid-cols-3 gap-4"
      >
        <Logbox />
        <Chessboard />
        <Chatbox />
      </div>
    </>
  );
}

export default App;
