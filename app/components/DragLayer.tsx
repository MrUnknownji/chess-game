import React from "react";
import { useDragLayer } from "react-dnd";
import ChessPiece from "./ChessPiece";

const DragLayer = () => {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 100,
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: currentOffset?.x,
          top: currentOffset?.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <ChessPiece
          type={item.type}
          color={item.color}
          row={item.fromRow}
          col={item.fromCol}
          isCurrentPlayer={true}
          onPieceSelect={() => {}}
          isDragging={true}
        />
      </div>
    </div>
  );
};

export default DragLayer;
