import React, { useEffect, useState } from "react";
import { PieceColor } from "../utils/types";
import { useChessTimer } from "../hooks/useChessTimer";
import { motion, AnimatePresence } from "framer-motion";
import { FaUndo, FaRedo, FaChessKnight } from "react-icons/fa";

interface GameControlsProps {
  currentPlayer: PieceColor;
  isGameOver: boolean;
  result: string | null;
  onStartNewGame: () => void;
  onResign: () => void;
  onAbort: () => void;
  isGameStarted: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isReviewMode: boolean;
  onToggleReviewMode: () => void;
  gameMode: 'pvp' | 'pve';
  onToggleGameMode: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  currentPlayer,
  isGameOver,
  result,
  onStartNewGame,
  onResign,
  onAbort,
  isGameStarted,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isReviewMode,
  onToggleReviewMode,
  gameMode,
  onToggleGameMode,
}) => {
  const {
    whiteTime,
    blackTime,
    activePlayer,
    startTimer,
    stopTimer,
    resetAndStart,
    switchPlayer,
    resetTimer
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
    if (!isGameStarted) {
      resetTimer();
    }
  }, [isGameStarted, resetTimer]);

  useEffect(() => {
    if (isGameStarted && !isGameOver) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [isGameStarted, isGameOver, startTimer, stopTimer]);

  useEffect(() => {
    if (currentPlayer !== activePlayer && isGameStarted) {
      switchPlayer();
    }
  }, [currentPlayer, activePlayer, switchPlayer, isGameStarted]);

  const handleNewGame = () => {
    resetAndStart();
    onStartNewGame();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-6 rounded-2xl w-80 text-foreground"
    >
      <div className="flex items-center gap-2 mb-6">
        <FaChessKnight className="text-slate-400 text-xl" />
        <h2 className="text-xl font-semibold tracking-tight text-slate-100">
          Game Controls
        </h2>
      </div>

      <div className="flex justify-center mb-6">
        <motion.button
          onClick={onToggleGameMode}
          disabled={isGameStarted && !isGameOver}
          whileHover={{ scale: isGameStarted && !isGameOver ? 1 : 1.02 }}
          whileTap={{ scale: isGameStarted && !isGameOver ? 1 : 0.98 }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 border
            ${isGameStarted && !isGameOver
              ? "bg-slate-800/30 text-slate-500 border-slate-700/30 cursor-not-allowed"
              : "bg-slate-700/40 hover:bg-slate-700/60 text-slate-200 border-slate-600/50"}`}
        >
          <span className="text-slate-400">Mode:</span>
          <span className="font-semibold text-slate-100">
            {gameMode === 'pvp' ? 'PvP' : 'vs AI'}
          </span>
        </motion.button>
      </div>

      <div className="mb-6 space-y-2">
        {["white", "black"].map((color) => (
          <motion.div
            key={color}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: color === "white" ? 0 : 0.05 }}
            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200
              ${currentPlayer === color && isGameStarted && !isGameOver
                ? "bg-slate-700/50 border border-slate-600/50"
                : "bg-slate-800/30 border border-slate-700/30"}`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-3 h-3 rounded-full ${color === 'white'
                  ? 'bg-white'
                  : 'bg-slate-800 border-2 border-slate-600'
                }`} />
              <span className={`text-sm font-medium capitalize ${currentPlayer === color && isGameStarted && !isGameOver
                  ? "text-slate-100"
                  : "text-slate-400"
                }`}>
                {color}
              </span>
            </div>
            <div className={`font-mono text-lg font-semibold tracking-wide ${currentPlayer === color && isGameStarted && !isGameOver
                ? "text-slate-100"
                : "text-slate-500"
              }`}>
              {formatTime(color === "white" ? whiteTime : blackTime)}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        <AnimatePresence mode="wait">
          {!isGameStarted ? (
            <motion.button
              key="start-game"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm"
              onClick={handleNewGame}
            >
              Start New Game
            </motion.button>
          ) : !isGameOver ? (
            <React.Fragment>
              <motion.button
                key="resign"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm"
                onClick={onResign}
              >
                Resign
              </motion.button>
              <motion.button
                key="abort"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 rounded-lg font-medium text-slate-300 bg-slate-700/40 hover:bg-slate-700/60 border border-slate-600/50 transition-all"
                onClick={onAbort}
              >
                Abort Game
              </motion.button>
            </React.Fragment>
          ) : (
            <motion.button
              key="play-again"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
              onClick={handleNewGame}
            >
              Play Again
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isGameStarted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full mt-3 py-2.5 rounded-lg text-sm font-medium transition-all border
                ${isReviewMode
                  ? "bg-purple-600/90 text-white border-purple-500/50"
                  : "bg-slate-700/40 text-slate-300 hover:bg-slate-700/60 border-slate-600/50"}`}
              onClick={onToggleReviewMode}
            >
              {isReviewMode ? "Exit Review Mode" : "Review Game"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={resultVariants}
            className="overflow-hidden w-full mt-4"
          >
            <div
              className={`text-sm font-semibold text-center p-3.5 rounded-lg border ${result.includes("won") || result.includes("wins")
                  ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-200"
                  : "bg-amber-600/20 border-amber-500/30 text-amber-200"
                }`}
              ref={(el) => {
                if (el && resultHeight === 0) setResultHeight(el.offsetHeight);
              }}
            >
              {result}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isReviewMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex justify-between gap-2.5"
        >
          <motion.button
            whileHover={canUndo ? { scale: 1.02 } : {}}
            whileTap={canUndo ? { scale: 0.98 } : {}}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all flex justify-center items-center gap-2 border
              ${!canUndo
                ? "opacity-40 cursor-not-allowed bg-slate-800/30 text-slate-600 border-slate-700/30"
                : "bg-slate-700/40 hover:bg-slate-700/60 text-slate-200 border-slate-600/50"}`}
            onClick={onUndo}
            disabled={!canUndo}
          >
            <FaUndo className="text-xs" />
            <span>Prev</span>
          </motion.button>
          <motion.button
            whileHover={canRedo ? { scale: 1.02 } : {}}
            whileTap={canRedo ? { scale: 0.98 } : {}}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all flex justify-center items-center gap-2 border
              ${!canRedo
                ? "opacity-40 cursor-not-allowed bg-slate-800/30 text-slate-600 border-slate-700/30"
                : "bg-slate-700/40 hover:bg-slate-700/60 text-slate-200 border-slate-600/50"}`}
            onClick={onRedo}
            disabled={!canRedo}
          >
            <span>Next</span>
            <FaRedo className="text-xs" />
          </motion.button>
        </motion.div>
      )}
    </motion.div >
  );
};

export default React.memo(GameControls);
