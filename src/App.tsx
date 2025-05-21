import "./global.css";
import Sidebar from "./components/sidebar/Sidebar";
import Chessboard from "./components/chessboard/Chessboard";
import Rightbox from "./components/rightbox/Rightbox";

function App() {
  return (
    <>
      <div className="relative w-screen h-screen">
        <div
          className="absolute inset-0 
          bg-[url('./assets/images/background/kasaneTeto.png')] 
          bg-no-repeat bg-cover blur-sm z-0"
        />
        <div className="relative z-10 w-full h-full py-10 px-5 grid grid-cols-[1fr_2fr_2fr] gap-4">
          <Sidebar />
          <Chessboard />
          <Rightbox />
        </div>
      </div>
    </>
  );
}

export default App;
