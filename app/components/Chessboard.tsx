import React, { useEffect, useState, useCallback } from "react";
import { useDrop } from "react-dnd";
import ChessPiece from "./ChessPiece";
import { GameState, Piece, PieceColor } from "../utils/types";
import {
  isCheck,
  isValidMove,
  doesMoveResolveCheck,
} from "../utils/moveValidation";
import { motion, AnimatePresence } from "framer-motion";

interface ChessboardProps {
  gameState: GameState;
  onMove: (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ) => void;
  isGameStarted: boolean;
  isGameOver: boolean;
  winner: PieceColor | null;
  isReviewMode: boolean;
}

interface SquareProps {
  row: number;
  col: number;
  piece: Piece | null;
  isLight: boolean;
  isSelected: boolean;
  isPossibleMove: boolean;
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
      if (node) {
        dropRef(node);
      }
    },
    [dropRef],
  );

  let bgColor = isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]";
  let hoverColor = isLight ? "hover:bg-[#e6cfa5]" : "hover:bg-[#a57853]";

  if (isSelected) {
    bgColor = "bg-[#f7ec5e]";
    hoverColor = "hover:bg-[#f8e94e]";
  } else if (isPossibleMove) {
    bgColor = isLight ? "bg-[#cdd26a]" : "bg-[#aaa23a]";
    hoverColor = isLight ? "hover:bg-[#bdc25a]" : "hover:bg-[#9a922a]";
  }

  return (
    <div
      ref={setDropRef}
      className={`w-20 h-20 ${bgColor} ${hoverColor} ${
        isOver ? "brightness-110" : ""
      } transition-all duration-200 ease-in-out relative`}
      onClick={onClick}
    >
      {row === 7 && (
        <span className="absolute bottom-1 right-1 text-xs font-semibold text-gray-600">
          {String.fromCharCode(97 + col)}
        </span>
      )}
      {col === 0 && (
        <span className="absolute top-1 left-1 text-xs font-semibold text-gray-600">
          {8 - row}
        </span>
      )}
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
  isGameStarted,
  isGameOver,
  winner,
  isReviewMode,
}) => {
  const { board, currentPlayer } = gameState;
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(
    null,
  );
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);

  useEffect(() => {
    if (isGameOver) {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  }, [isGameOver]);

  const calculatePossibleMoves = useCallback(
    (row: number, col: number) => {
      const newPossibleMoves: [number, number][] = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (
            isValidMove(gameState, row, col, i, j) &&
            (isCheck(gameState, gameState.currentPlayer)
              ? doesMoveResolveCheck(gameState, row, col, i, j)
              : true)
          ) {
            newPossibleMoves.push([i, j]);
          }
        }
      }
      return newPossibleMoves;
    },
    [gameState],
  );

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (!isGameStarted || isGameOver) return;
      const piece = gameState.board[row][col];

      if (selectedSquare) {
        const [fromRow, fromCol] = selectedSquare;
        if (piece && piece.color === gameState.currentPlayer) {
          setSelectedSquare([row, col]);
        } else if (
          isValidMove(gameState, fromRow, fromCol, row, col) &&
          (isCheck(gameState, gameState.currentPlayer)
            ? doesMoveResolveCheck(gameState, fromRow, fromCol, row, col)
            : true)
        ) {
          onMove(fromRow, fromCol, row, col);
          setSelectedSquare(null);
        }
      } else {
        if (piece && piece.color === gameState.currentPlayer) {
          setSelectedSquare([row, col]);
        }
      }
    },
    [gameState, selectedSquare, isGameStarted, isGameOver, onMove],
  );

  const handlePieceDrop = useCallback(
    (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
      if (!isGameStarted || isGameOver) return;

      if (
        isValidMove(gameState, fromRow, fromCol, toRow, toCol) &&
        (isCheck(gameState, gameState.currentPlayer)
          ? doesMoveResolveCheck(gameState, fromRow, fromCol, toRow, toCol)
          : true)
      ) {
        onMove(fromRow, fromCol, toRow, toCol);
        setSelectedSquare(null);
      }
    },
    [gameState, isGameStarted, isGameOver, onMove],
  );

  useEffect(() => {
    if (selectedSquare) {
      const [row, col] = selectedSquare;
      setPossibleMoves(calculatePossibleMoves(row, col));
    } else {
      setPossibleMoves([]);
    }
  }, [selectedSquare, calculatePossibleMoves]);

  const renderSquare = useCallback(
    (row: number, col: number) => {
      const isLight = (row + col) % 2 === 0;
      const isSelected = selectedSquare
        ? selectedSquare[0] === row && selectedSquare[1] === col
        : false;
      const isPossibleMove = possibleMoves.some(
        ([r, c]) => r === row && c === col,
      );

      const piece = board[row][col];

      return (
        <Square
          key={`${row}-${col}`}
          row={row}
          col={col}
          piece={piece}
          isLight={isLight}
          isSelected={isSelected}
          isPossibleMove={isPossibleMove}
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
    ],
  );

  const renderCelebration = useCallback(() => {
    if (!winner) return null;

    const color = winner === "white" ? "text-white" : "text-black";
    const backgroundColor = winner === "white" ? "bg-black" : "bg-white";

    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div
          className={`${backgroundColor} bg-opacity-70 absolute inset-0`}
        ></div>
        <div
          className={`${color} text-9xl font-bold transform -rotate-45 select-none`}
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
        >
          {winner.toUpperCase()} WINS!
        </div>
      </div>
    );
  }, [winner]);

  const boardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const squareVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  return (
    <motion.div
      className="relative"
      initial="hidden"
      animate="visible"
      variants={boardVariants}
    >
      <div className="border-8 border-[#8b4513] rounded-lg shadow-2xl overflow-hidden">
        <div className="grid grid-cols-8 w-[640px] h-[640px]">
          <AnimatePresence>
            {Array.from({ length: 8 }, (_, row) =>
              Array.from({ length: 8 }, (_, col) => (
                <motion.div
                  key={`${row}-${col}`}
                  variants={squareVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, delay: (row * 8 + col) * 0.01 }}
                >
                  {renderSquare(row, col)}
                </motion.div>
              )),
            )}
          </AnimatePresence>
        </div>
      </div>
      {!isReviewMode && renderCelebration()}
    </motion.div>
  );
};

export default Chessboard;
