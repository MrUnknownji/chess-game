import React, { useEffect, useState, useCallback } from "react";
import { useDrop } from "react-dnd";
import ChessPiece from "./ChessPiece";
import { GameState, Piece, PieceColor } from "../utils/types";
import { motion } from "framer-motion";
import { Chess } from "chess.js";

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

  let bgColor = isLight ? "bg-board-light" : "bg-board-dark";

  // Highlighting logic
  if (isLastMove) {
    bgColor = isLight ? "bg-board-light-active" : "bg-board-dark-active";
  }

  if (isSelected) {
    bgColor = "bg-primary-400 bg-opacity-70";
  } else if (isPossibleMove) {
    if (piece) { // Capture move
      bgColor = "bg-red-400 bg-opacity-60";
    } else {
      // Just a dot usually, but here we color the square
      // We'll handle dot in the children
    }
  }

  return (
    <div
      ref={setDropRef}
      className={`w-full h-full ${bgColor} ${isOver ? "brightness-110" : ""
        } transition-colors duration-200 ease-in-out relative aspect-square flex items-center justify-center`}
      onClick={onClick}
    >
      {/* Coordinate Labels */}
      {row === 7 && (
        <span className={`absolute bottom-0.5 right-1 text-[10px] font-bold ${isLight ? "text-board-dark" : "text-board-light"}`}>
          {String.fromCharCode(97 + col)}
        </span>
      )}
      {col === 0 && (
        <span className={`absolute top-0.5 left-1 text-[10px] font-bold ${isLight ? "text-board-dark" : "text-board-light"}`}>
          {8 - row}
        </span>
      )}

      {/* Possible Move Marker (Dot) */}
      {isPossibleMove && !piece && (
        <div className="absolute w-3 h-3 bg-black bg-opacity-20 rounded-full"></div>
      )}

      {/* Capture Ring */}
      {isPossibleMove && piece && (
        <div className="absolute w-[90%] h-[90%] border-4 border-black border-opacity-10 rounded-full"></div>
      )}

      {/* Check Indicator */}
      {isInCheck && (
        <div className="absolute inset-0 bg-red-600 bg-opacity-50 ring-inset ring-4 ring-red-600" />
      )}

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
}) => {
  const { board, currentPlayer } = gameState;
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(
    null,
  );
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);

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
    const backgroundColor = winner === "white" ? "bg-black" : "bg-white";

    return (
      <div className="absolute inset-0 flex items-center justify-center z-10 rounded-lg overflow-hidden pointer-events-none">
        <div
          className={`${backgroundColor} bg-opacity-70 absolute inset-0`}
        ></div>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: -15 }}
          className={`${color} text-6xl md:text-8xl font-black select-none tracking-tighter`}
          style={{ textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
        >
          {winner.toUpperCase()} <br /> WINS!
        </motion.div>
      </div>
    );
  }, [winner]);

  return (
    <motion.div
      className="relative chess-board rounded-lg w-full max-w-[640px] mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="border-[12px] border-zinc-800 rounded-lg shadow-2xl overflow-hidden w-full aspect-square bg-zinc-800">
        <div className="grid grid-cols-8 w-full h-full">
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 8 }, (_, col) => renderSquare(row, col))
          )}
        </div>
      </div>
      {!isReviewMode && renderCelebration()}
    </motion.div>
  );
};

export default Chessboard;
