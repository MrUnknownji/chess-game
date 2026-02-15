import React, { useEffect, useState, useCallback } from "react";
import { useDrop } from "react-dnd";
import ChessPiece from "./ChessPiece";
import { GameState, Piece, PieceColor } from "../utils/types";
import { motion, AnimatePresence } from "framer-motion";
import { Chess } from "chess.js";
import Confetti from "react-confetti";

interface ChessboardProps {
  gameState: GameState;
  onMove: (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ) => void;
  getValidMoves: (row: number, col: number) => [number, number][];
  isGameStarted: boolean;
  isGameOver: boolean;
  winner: PieceColor | null;
  isReviewMode: boolean;
  game: Chess;
  onReset: () => void;
}

interface SquareProps {
  row: number;
  col: number;
  piece: Piece | null;
  isLight: boolean;
  isSelected: boolean;
  isPossibleMove: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  onClick: () => void;
  onDrop: (item: { fromRow: number; fromCol: number }) => void;
  currentPlayer: PieceColor;
}

const Square: React.FC<SquareProps> = ({
  row,
  col,
  piece,
  isLight,
  isSelected,
  isPossibleMove,
  isLastMove,
  isInCheck,
  onClick,
  onDrop,
  currentPlayer,
}) => {
  const [{ isOver }, dropRef] = useDrop({
    accept: "chess-piece",
    drop: (item: { fromRow: number; fromCol: number }) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const setDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) dropRef(node);
    },
    [dropRef],
  );

  // Base background color with gradients
  let bgClasses = isLight
    ? "bg-board-light bg-gradient-to-br from-transparent to-black/5"
    : "bg-board-dark bg-gradient-to-br from-transparent to-black/10";

  if (isSelected) {
    bgClasses = "bg-yellow-200/50 mix-blend-multiply"; // Subtle yellow selection
  } else if (isLastMove) {
    bgClasses = isLight ? "bg-board-light-active" : "bg-board-dark-active";
  }

  return (
    <div
      ref={setDropRef}
      className={`w-full h-full ${bgClasses} ${
        isOver ? "brightness-110" : ""
      } relative aspect-square flex items-center justify-center select-none`}
      onClick={onClick}
    >
      {/* Coordinate Labels */}
      {row === 7 && (
        <span
          className={`absolute bottom-0.5 right-1 text-[9px] font-bold ${
            isLight ? "text-slate-500" : "text-slate-300"
          } opacity-70`}
        >
          {String.fromCharCode(97 + col)}
        </span>
      )}
      {col === 0 && (
        <span
          className={`absolute top-0.5 left-1 text-[9px] font-bold ${
            isLight ? "text-slate-500" : "text-slate-300"
          } opacity-70`}
        >
          {8 - row}
        </span>
      )}

      {/* Possible Move Marker */}
      {isPossibleMove && !piece && (
        <div className="absolute w-3 h-3 bg-black/20 rounded-full" />
      )}

      {/* Capture Indicator */}
      {isPossibleMove && piece && (
        <div className="absolute w-full h-full rounded-full border-[5px] border-black/10" />
      )}

      {/* Check Indicator */}
      {isInCheck && (
        <div className="absolute inset-0 bg-red-500/40 rounded-sm"
             style={{ boxShadow: "inset 0 0 10px 4px rgba(220, 38, 38, 0.5)" }}
        />
      )}

      {/* Last Move Highlight Border (if needed on top of color) */}
      {isLastMove && <div className="absolute inset-0 ring-4 ring-yellow-400/20" />}

      {/* Piece */}
      {piece && (
        <ChessPiece
          type={piece.type}
          color={piece.color}
          row={row}
          col={col}
          isCurrentPlayer={piece.color === currentPlayer}
          onPieceSelect={() => onClick()}
        />
      )}
    </div>
  );
};

const Chessboard: React.FC<ChessboardProps> = ({
  gameState,
  onMove,
  getValidMoves,
  isGameStarted,
  isGameOver,
  winner,
  isReviewMode,
  game,
  onReset,
}) => {
  const { board, currentPlayer } = gameState;
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(
    null,
  );
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Client-side window size for confetti
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isGameOver || isReviewMode) {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  }, [isGameOver, isReviewMode]);

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (!isGameStarted || isGameOver || isReviewMode) return;
      const piece = board[row][col];

      // If clicking same square, deselect
      if (selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // If clicking a possible move
      const isMove = possibleMoves.some(([r, c]) => r === row && c === col);
      if (selectedSquare && isMove) {
        onMove(selectedSquare[0], selectedSquare[1], row, col);
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // If clicking own piece, select it
      if (piece && piece.color === currentPlayer) {
        setSelectedSquare([row, col]);
        const moves = getValidMoves(row, col);
        setPossibleMoves(moves);
      } else {
        // Clicking empty or enemy square without valid move
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    },
    [selectedSquare, possibleMoves, isGameStarted, isGameOver, isReviewMode, currentPlayer, onMove, getValidMoves, board],
  );

  const handlePieceDrop = useCallback(
    (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
      if (!isGameStarted || isGameOver || isReviewMode) return;

      // Validate move via getValidMoves (re-calculate to be safe)
      const moves = getValidMoves(fromRow, fromCol);
      const isValid = moves.some(([r, c]) => r === toRow && c === toCol);

      if (isValid) {
        onMove(fromRow, fromCol, toRow, toCol);
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    },
    [isGameStarted, isGameOver, isReviewMode, onMove, getValidMoves],
  );

  const renderSquare = useCallback(
    (row: number, col: number) => {
      const isLight = (row + col) % 2 === 0;
      const isSelected = selectedSquare
        ? selectedSquare[0] === row && selectedSquare[1] === col
        : false;
      const isPossibleMove = possibleMoves.some(
        ([r, c]) => r === row && c === col,
      );

      const lastMove = game.history({ verbose: true }).pop();
      let isLastMove = false;
      if (lastMove) {
        const fromRow = 8 - parseInt(lastMove.from[1]);
        const fromCol = lastMove.from.charCodeAt(0) - 97;
        const toRow = 8 - parseInt(lastMove.to[1]);
        const toCol = lastMove.to.charCodeAt(0) - 97;
        if ((row === fromRow && col === fromCol) || (row === toRow && col === toCol)) {
          isLastMove = true;
        }
      }

      const piece = board[row][col];
      const isInCheck =
        piece?.type === "king" &&
        piece?.color === currentPlayer &&
        game.inCheck();

      return (
        <Square
          key={`${row}-${col}`}
          row={row}
          col={col}
          piece={piece}
          isLight={isLight}
          isSelected={isSelected}
          isPossibleMove={isPossibleMove}
          isLastMove={isLastMove}
          isInCheck={isInCheck}
          onClick={() => handleSquareClick(row, col)}
          onDrop={(item) =>
            handlePieceDrop(item.fromRow, item.fromCol, row, col)
          }
          currentPlayer={currentPlayer}
        />
      );
    },
    [
      board,
      selectedSquare,
      possibleMoves,
      handleSquareClick,
      handlePieceDrop,
      currentPlayer,
      game,
    ],
  );

  const renderCelebration = useCallback(() => {
    if (!winner) return null;

    const color = winner === "white" ? "text-white" : "text-black";
    const bg = winner === "white" ? "bg-slate-900" : "bg-slate-100";

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto">
        <div className={`absolute inset-0 ${bg} opacity-90 backdrop-blur-md`}></div>
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={800}
          recycle={true}
          className="z-50"
        />
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className={`${color} z-[60] text-center flex flex-col items-center gap-6 p-12 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl`}
        >
          <div className="text-8xl font-black tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            {winner.toUpperCase()} <br /> WINS
          </div>
          <div className="text-3xl font-bold opacity-90 tracking-widest uppercase">
            Checkmate
          </div>
          <button
            onClick={onReset}
            className="mt-8 px-8 py-3 bg-white/20 hover:bg-white/30 text-current rounded-full font-bold transition-all hover:scale-105 active:scale-95"
          >
            Play Again
          </button>
        </motion.div>
      </div>
    );
  }, [winner, windowSize, onReset]);

  return (
    <motion.div
      className="relative chess-board rounded-lg w-full max-w-[640px] mx-auto shadow-2xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Board Border/Container */}
      <div className="p-3 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
        <div className="rounded-md overflow-hidden shadow-inner w-full aspect-square ring-1 ring-white/10">
          <div className="grid grid-cols-8 w-full h-full">
            {Array.from({ length: 8 }, (_, row) =>
              Array.from({ length: 8 }, (_, col) => renderSquare(row, col))
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isReviewMode && winner && renderCelebration()}
      </AnimatePresence>
    </motion.div>
  );
};

export default Chessboard;
