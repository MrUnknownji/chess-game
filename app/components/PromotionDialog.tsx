import React from "react";
import { PieceColor, PieceType } from "../utils/types";
import { getPieceIcon } from "../components/PieceIcons";

interface PromotionDialogProps {
  color: PieceColor;
  onPromote: (pieceType: PieceType) => void;
}

const PromotionDialog: React.FC<PromotionDialogProps> = ({
  color,
  onPromote,
}) => {
  const pieces: PieceType[] = ["queen", "rook", "bishop", "knight"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="flex space-x-4">
          {pieces.map((pieceType) => (
            <button
              key={pieceType}
              className="w-16 h-16 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center"
              onClick={() => onPromote(pieceType)}
            >
              <div className="w-12 h-12">{getPieceIcon(pieceType, color)}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionDialog;
