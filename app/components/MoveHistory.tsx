import React, { useRef, useEffect } from "react";
import { Move, PieceType } from "../utils/types";

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
  const moveRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (moveRefs.current[currentMoveIndex]) {
      moveRefs.current[currentMoveIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [currentMoveIndex]);

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
        ref={(el) => {
          moveRefs.current[index] = el;
        }}
        className={`flex-shrink-0 py-1 px-2 cursor-pointer ${
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

  return (
    <div className="transition-all duration-300 ease-in-out overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg border border-gray-200 w-full">
      <div ref={scrollContainerRef} className="overflow-x-auto thin-scrollbar">
        {moves.length === 0 ? (
          <div className="text-center text-gray-500">No moves</div>
        ) : (
          <div className="flex space-x-2">
            {moves.map((move, index) => renderMove(move, index))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
