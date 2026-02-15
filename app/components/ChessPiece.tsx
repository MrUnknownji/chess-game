import React, { useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { getPieceIcon } from "../components/PieceIcons";
import { PieceType, PieceColor } from "../utils/types";

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  row: number;
  col: number;
  isCurrentPlayer: boolean;
  onPieceSelect: () => void;
  isDragging?: boolean;
}

const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  row,
  col,
  isCurrentPlayer,
  onPieceSelect,
  isDragging = false,
}) => {
  const pieceRef = useRef<HTMLDivElement>(null);
  const [{ isDragging: _isDragging }, drag, preview] = useDrag(
    () => ({
      type: "chess-piece",
      item: () => {
        if (isCurrentPlayer) onPieceSelect();
        return { fromRow: row, fromCol: col, type, color };
      },
      canDrag: isCurrentPlayer,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [row, col, isCurrentPlayer, onPieceSelect, type, color],
  );

  const pieceIcon = getPieceIcon(type, color);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  useEffect(() => {
    drag(pieceRef);
  }, [drag]);

  return (
    <div
      ref={pieceRef}
      className={`absolute inset-0 flex items-center justify-center w-full h-full ${
        isCurrentPlayer ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      }`}
      style={{
        opacity: _isDragging ? 0 : 1,
        display: isDragging ? "block" : "flex", // Keep flex to center, block if dragging logic requires it (though usually drag source is hidden)
      }}
    >
      <div
        className={`w-[85%] h-[85%] piece-shadow transition-transform duration-200 ${
          isCurrentPlayer ? "hover:scale-110 active:scale-95" : ""
        }`}
      >
        {pieceIcon}
      </div>
    </div>
  );
};

export default ChessPiece;
