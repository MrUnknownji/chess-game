export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";
export type PieceColor = "white" | "black";

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface GameState {
  board: Board;
  currentPlayer: PieceColor;
  enPassantTarget: [number, number] | null;
  whiteKingMoved: boolean;
  blackKingMoved: boolean;
  whiteRooksMoved: [boolean, boolean];
  blackRooksMoved: [boolean, boolean];
  pendingPromotion: {
    from: [number, number];
    to: [number, number];
  } | null;
  positionHistory: string[];
  movesSincePawnMoveOrCapture: number;
}

export type Board = (Piece | null)[][];
