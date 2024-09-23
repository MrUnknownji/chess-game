import { GameState } from "./types";
import { initialBoard } from "./boardUtils";

export const createInitialGameState = (): GameState => {
  return {
    board: initialBoard,
    currentPlayer: "white",
    enPassantTarget: null,
    whiteKingMoved: false,
    blackKingMoved: false,
    whiteRooksMoved: [false, false],
    blackRooksMoved: [false, false],
    pendingPromotion: null,
    positionHistory: [],
    movesSincePawnMoveOrCapture: 0,
  };
};
