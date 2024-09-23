import React, { useRef, useEffect, useMemo } from "react";
import { Move, PieceType } from "../utils/types";
import { motion, AnimatePresence } from "framer-motion";

interface MoveHistoryProps {
  moves: Move[];
  currentMoveIndex: number;
  onMoveSelect: (index: number) => void;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  currentMoveIndex,
  onMoveSelect,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [moves]);

  const renderMove = (move: Move, index: number) => {
    const isCurrentMove = index === currentMoveIndex;
    const moveNumber = Math.floor(index / 2) + 1;
    const isWhiteMove = index % 2 === 0;

    const from = `${String.fromCharCode(97 + move.from[1])}${8 - move.from[0]}`;
    const to = `${String.fromCharCode(97 + move.to[1])}${8 - move.to[0]}`;
    const pieceSymbol = getPieceSymbol(move.piece.type);
    const moveNotation = `${pieceSymbol}${from}-${to}`;

    return (
      <div
        key={index}
        className={`inline-block py-1 px-2 cursor-pointer ${
          isCurrentMove ? "bg-blue-200" : "hover:bg-gray-200"
        } ${isWhiteMove ? "mr-1" : "ml-1"}`}
        onClick={() => onMoveSelect(index)}
      >
        {isWhiteMove && (
          <span className="mr-2 text-gray-500 font-semibold">
            {moveNumber}.
          </span>
        )}
        <span className={isWhiteMove ? "text-black" : "text-gray-600"}>
          {moveNotation}
        </span>
      </div>
    );
  };

  const getPieceSymbol = (pieceType: PieceType): string => {
    switch (pieceType) {
      case "king":
        return "♔";
      case "queen":
        return "♕";
      case "rook":
        return "♖";
      case "bishop":
        return "♗";
      case "knight":
        return "♘";
      case "pawn":
        return "♙";
      default:
        return "";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const newMoveVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const memoizedMoves = useMemo(
    () => moves.map((move, index) => renderMove(move, index)),
    [moves, currentMoveIndex],
  );

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg border border-gray-200 w-full mt-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div
        ref={scrollContainerRef}
        className="overflow-y-auto thin-scrollbar"
        style={{
          scrollbarWidth: "thin",
          maxHeight: "200px",
          width: "100%",
          overflowX: "hidden",
        }}
      >
        <div className="flex flex-wrap">
          {moves.length === 0 ? (
            <motion.div
              className="text-center text-gray-500 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              No moves
            </motion.div>
          ) : (
            <>
              {memoizedMoves.slice(0, -1)}
              {moves.length > 0 && (
                <motion.div
                  key={moves.length}
                  variants={newMoveVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {memoizedMoves[memoizedMoves.length - 1]}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MoveHistory;
