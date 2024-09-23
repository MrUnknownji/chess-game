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
}

export type Board = (Piece | null)[][];
