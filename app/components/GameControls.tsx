import React, { useEffect, useState } from "react";
import { PieceColor } from "../utils/types";
import { useChessTimer } from "../hooks/useChessTimer";
import { motion, AnimatePresence } from "framer-motion";
import { FaUndo, FaRedo, FaChessKnight, FaUser, FaRobot, FaPlay, FaFlag, FaStop, FaRedoAlt } from "react-icons/fa";

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
      className="glass-panel p-6 rounded-2xl w-full max-w-sm text-foreground shadow-2xl"
    >
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <FaChessKnight className="text-indigo-400 text-xl" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Controls
          </h2>
        </div>

        <motion.button
          onClick={onToggleGameMode}
          disabled={isGameStarted && !isGameOver}
          whileHover={{ scale: isGameStarted && !isGameOver ? 1 : 1.05 }}
          whileTap={{ scale: isGameStarted && !isGameOver ? 1 : 0.95 }}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-2 border
            ${isGameStarted && !isGameOver
              ? "bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed"
              : "bg-slate-700/40 hover:bg-slate-600/60 text-indigo-300 border-indigo-500/30"}`}
        >
          {gameMode === 'pvp' ? <FaUser /> : <FaRobot />}
          <span>{gameMode === 'pvp' ? 'PvP' : 'PvE'}</span>
        </motion.button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        {["white", "black"].map((color) => {
           const isActive = currentPlayer === color && isGameStarted && !isGameOver;
           const isWhite = color === "white";

           return (
            <motion.div
              key={color}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: isWhite ? 0 : 0.1 }}
              className={`relative flex flex-col items-center p-4 rounded-xl transition-all duration-300 border
                ${isActive
                  ? "bg-gradient-to-b from-indigo-500/20 to-indigo-600/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  : "bg-slate-800/40 border-slate-700/30 opacity-70"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full shadow-sm ${isWhite
                    ? 'bg-white'
                    : 'bg-slate-900 border border-slate-600'
                  }`} />
                <span className={`text-xs font-bold uppercase tracking-widest ${isActive
                    ? "text-indigo-200"
                    : "text-slate-500"
                  }`}>
                  {color}
                </span>
              </div>
              <div className={`font-mono text-3xl font-bold tabular-nums tracking-wider ${isActive
                  ? "text-white scale-110"
                  : "text-slate-400"
                } transition-all duration-300`}>
                {formatTime(isWhite ? whiteTime : blackTime)}
              </div>

              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -bottom-1 w-12 h-1 rounded-full bg-indigo-400 shadow-[0_0_10px_currentColor]"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="wait">
          {!isGameStarted ? (
            <motion.button
              key="start-game"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-button-enhanced flex items-center justify-center gap-2 w-full"
              onClick={handleNewGame}
            >
              <FaPlay className="text-sm" /> Start New Game
            </motion.button>
          ) : !isGameOver ? (
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                key="resign"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-3 px-4 rounded-xl font-bold text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 transition-all flex items-center justify-center gap-2"
                onClick={onResign}
              >
                <FaFlag /> Resign
              </motion.button>
              <motion.button
                key="abort"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-3 px-4 rounded-xl font-bold text-slate-300 bg-slate-700/40 hover:bg-slate-700/60 border border-slate-600/30 transition-all flex items-center justify-center gap-2"
                onClick={onAbort}
              >
                <FaStop /> Abort
              </motion.button>
            </div>
          ) : (
            <motion.button
              key="play-again"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-button-enhanced flex items-center justify-center gap-2 w-full from-emerald-600/40 to-emerald-700/40 border-emerald-500/30 hover:shadow-emerald-500/20"
              onClick={handleNewGame}
            >
              <FaRedoAlt /> Play Again
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
            className="w-full mt-4 border-t border-white/5 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-xl text-sm font-bold tracking-wide uppercase transition-all border flex items-center justify-center gap-2
                ${isReviewMode
                  ? "bg-purple-600/20 text-purple-200 border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.2)]"
                  : "bg-slate-800/40 text-slate-400 hover:bg-slate-700/60 border-slate-700/50"}`}
              onClick={onToggleReviewMode}
            >
              {isReviewMode ? "Exit Review" : "Analyze Game"}
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
              className={`text-sm font-bold tracking-wide text-center p-4 rounded-xl border backdrop-blur-md ${result.includes("won") || result.includes("wins")
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
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
          className="mt-4 flex justify-between gap-3"
        >
          <motion.button
            whileHover={canUndo ? { scale: 1.05 } : {}}
            whileTap={canUndo ? { scale: 0.95 } : {}}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2 border
              ${!canUndo
                ? "opacity-30 cursor-not-allowed bg-slate-800/20 text-slate-500 border-slate-800"
                : "bg-slate-700/40 hover:bg-slate-600/60 text-white border-slate-600/50"}`}
            onClick={onUndo}
            disabled={!canUndo}
          >
            <FaUndo className="text-sm" />
          </motion.button>
          <motion.button
            whileHover={canRedo ? { scale: 1.05 } : {}}
            whileTap={canRedo ? { scale: 0.95 } : {}}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2 border
              ${!canRedo
                ? "opacity-30 cursor-not-allowed bg-slate-800/20 text-slate-500 border-slate-800"
                : "bg-slate-700/40 hover:bg-slate-600/60 text-white border-slate-600/50"}`}
            onClick={onRedo}
            disabled={!canRedo}
          >
            <FaRedo className="text-sm" />
          </motion.button>
        </motion.div>
      )}
    </motion.div >
  );
};

export default React.memo(GameControls);
