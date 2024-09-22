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
}

export type Board = (Piece | null)[][];
