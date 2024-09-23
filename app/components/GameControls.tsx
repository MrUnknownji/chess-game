import React, { useEffect, useState } from "react";
import { PieceColor } from "../utils/types";
import { useChessTimer } from "../hooks/useChessTimer";
import { motion, AnimatePresence } from "framer-motion";

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

  const [resultHeight, setResultHeight] = useState(0);

  const resultVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0 },
    visible: { opacity: 1, height: resultHeight, marginTop: 24 },
  };

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg border border-gray-200 w-80"
    >
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Game Controls
      </h2>
      <div className="mb-6 space-y-4">
        {["black", "white"].map((color) => (
          <motion.div
            key={color}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: color === "black" ? 0 : 0.1 }}
            className="flex items-center justify-between"
          >
            <span className="text-lg font-medium capitalize text-gray-700">
              {color}
            </span>
            <motion.div
              animate={{
                backgroundColor:
                  currentPlayer === color && isGameStarted && !isGameOver
                    ? "#DBEAFE"
                    : "#E5E7EB",
              }}
              transition={{ duration: 0.3 }}
              className={`p-2 rounded ${
                currentPlayer === color && isGameStarted && !isGameOver
                  ? "shadow-inner"
                  : ""
              }`}
            >
              <div className="text-xl font-mono tracking-wider text-gray-800">
                {formatTime(color === "white" ? whiteTime : blackTime)}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {!isGameStarted && (
          <motion.button
            key="start-game"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={handleNewGame}
          >
            Start Game
          </motion.button>
        )}
        {isGameStarted && !isGameOver && (
          <motion.button
            key="resign"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-6 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            onClick={onResign}
          >
            Resign
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {result && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={resultVariants}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="overflow-hidden"
          >
            <div
              className="text-lg font-semibold text-center text-gray-800 p-3 bg-yellow-100 rounded-md border border-yellow-200"
              ref={(el) => {
                if (el && resultHeight === 0) {
                  setResultHeight(el.offsetHeight);
                }
              }}
            >
              {result}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default React.memo(GameControls);
