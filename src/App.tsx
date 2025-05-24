import "./global.css";
import React from "react";
import Game from "./chessLogics/game";
import Sidebar from "./components/sidebar/Sidebar";
import Chessboard from "./components/chessboard/Chessboard";
import Logbox from "./components/rightbox/Logbox";
import Chatbox from "./components/rightbox/Chatbox";

function App() {
  const [game] = React.useState(() => new Game());
  const [boardUpdateTrigger, setBoardUpdateTrigger] = React.useState(0);

  // This function is called whenever we need to update the UI
  const handleBoardUpdate = () => {
    setBoardUpdateTrigger((prev) => prev + 1);
  };

  return (
    <>
      <div className="relative w-screen h-screen">
        <div
          className="absolute inset-0 
          bg-[url('./assets/images/background/kasaneTeto.png')] 
          bg-no-repeat bg-cover blur-sm z-0"
        />
        <div
          className="relative z-10 w-full h-full py-10 px-5 
          grid grid-cols-[1fr_2fr_2fr] gap-4"
        >
          <Sidebar />
          <Chessboard game={game} onBoardUpdate={handleBoardUpdate} key={`chessboard-${boardUpdateTrigger}`} />
          <div>
            <div className="mb-[3vh]">
              <Logbox game={game} onBoardUpdate={handleBoardUpdate}></Logbox>
            </div>
            <Chatbox />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
