import React, { useEffect } from "react";
import { PieceColor } from "../utils/types";
import { useChessTimer } from "../hooks/useChessTimer";

interface GameControlsProps {
  currentPlayer: PieceColor;
  isGameOver: boolean;
  result: string | null;
  onStartNewGame: () => void;
  onResign: () => void;
  isGameStarted: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  currentPlayer,
  isGameOver,
  result,
  onStartNewGame,
  onResign,
  isGameStarted,
}) => {
  const {
    whiteTime,
    blackTime,
    activePlayer,
    startTimer,
    stopTimer,
    resetAndStart,
    switchPlayer,
  } = useChessTimer(600);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isGameStarted && !isGameOver) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [isGameStarted, isGameOver, startTimer, stopTimer]);

  useEffect(() => {
    if (currentPlayer !== activePlayer) {
      switchPlayer();
    }
  }, [currentPlayer, activePlayer, switchPlayer]);

  const handleNewGame = () => {
    resetAndStart();
    onStartNewGame();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl shadow-2xl text-white w-96 border border-gray-700">
      <h2 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
        Game Controls
      </h2>
      <div className="mb-8 space-y-6">
        {["black", "white"].map((color) => (
          <div key={color} className="flex items-center justify-between">
            <span className="text-xl font-semibold capitalize">{color}</span>
            <div
              className={`p-1 rounded-lg ${
                currentPlayer === color && isGameStarted && !isGameOver
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg transition-all duration-300"
                  : "bg-gray-700"
              }`}
            >
              <div
                className={`${color === "white" ? "bg-gray-100 text-gray-900" : "bg-gray-900 text-white"} px-4 py-3 rounded-md text-2xl font-mono tracking-wider shadow-inner`}
              >
                {formatTime(color === "white" ? whiteTime : blackTime)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mb-8 space-x-4">
        <button
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out flex-grow shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          onClick={handleNewGame}
        >
          {isGameStarted ? "New Game" : "Start Game"}
        </button>
        {isGameStarted && !isGameOver && (
          <button
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out flex-grow shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            onClick={onResign}
          >
            Resign
          </button>
        )}
      </div>
      {result && (
        <div className="text-lg font-semibold text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out">
          {result}
        </div>
      )}
    </div>
  );
};

export default React.memo(GameControls);
