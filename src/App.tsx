import { useState } from "react";
import "./global.css";
import Chatbox from "./components/chatbox/Chatbox";
import Chessboard from "./components/chessboard/Chessboard";
import Logbox from "./components/logbox/logbox";

function App() {
  return (
    <>
      <div
        className="
      bg-[rgb(30,30,30)] w-screen h-screen py-10 px-5
      grid grid-cols-[1fr_2fr_1fr] gap-4"
      >
        <Chatbox />
        <Chessboard />
        <Logbox />
      </div>
    </>
  );
}

export default App;
