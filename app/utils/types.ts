import { Move as ChessJsMove } from "chess.js";

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

export type Board = (Piece | null)[][];

// Use chess.js Move type for history
export type Move = ChessJsMove;

export interface GameState {
  board: Board;
  currentPlayer: PieceColor;
  moveHistory: Move[];
  currentMoveIndex: number;
}
