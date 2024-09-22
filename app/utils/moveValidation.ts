import { GameState, Board, PieceColor } from "./types";
import { findKing } from "./boardUtils";

export const isValidMove = (
  gameState: GameState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean => {
  const { board, currentPlayer } = gameState;
  const piece = board[fromRow][fromCol];
  if (!piece || piece.color !== currentPlayer) return false;

  const targetPiece = board[toRow][toCol];
  if (targetPiece && targetPiece.color === currentPlayer) return false;

  let validAccordingToPieceRules = false;
  switch (piece.type) {
    case "pawn":
      validAccordingToPieceRules = isValidPawnMove(
        gameState,
        fromRow,
        fromCol,
        toRow,
        toCol,
      );
      break;
    case "rook":
      validAccordingToPieceRules = isValidRookMove(
        board,
        fromRow,
        fromCol,
        toRow,
        toCol,
      );
      break;
    case "knight":
      validAccordingToPieceRules = isValidKnightMove(
        fromRow,
        fromCol,
        toRow,
        toCol,
      );
      break;
    case "bishop":
      validAccordingToPieceRules = isValidBishopMove(
        board,
        fromRow,
        fromCol,
        toRow,
        toCol,
      );
      break;
    case "queen":
      validAccordingToPieceRules = isValidQueenMove(
        board,
        fromRow,
        fromCol,
        toRow,
        toCol,
      );
      break;
    case "king":
      validAccordingToPieceRules = isValidKingMove(
        board,
        fromRow,
        fromCol,
        toRow,
        toCol,
        currentPlayer,
      );
      break;
  }

  if (!validAccordingToPieceRules) return false;

  const newGameState: GameState = {
    board: JSON.parse(JSON.stringify(gameState.board)),
    currentPlayer: gameState.currentPlayer,
    enPassantTarget: gameState.enPassantTarget,
  };
  newGameState.board[toRow][toCol] = newGameState.board[fromRow][fromCol];
  newGameState.board[fromRow][fromCol] = null;

  return !isCheck(newGameState, currentPlayer);
};

const isValidPawnMove = (
  gameState: GameState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean => {
  const { board, currentPlayer, enPassantTarget } = gameState;
  const direction = currentPlayer === "white" ? -1 : 1;
  const startRow = currentPlayer === "white" ? 6 : 1;

  if (fromCol === toCol && board[toRow][toCol] === null) {
    if (toRow === fromRow + direction) return true;
    if (
      fromRow === startRow &&
      toRow === fromRow + 2 * direction &&
      board[fromRow + direction][fromCol] === null
    )
      return true;
  }

  if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction) {
    const targetPiece = board[toRow][toCol];
    if (targetPiece && targetPiece.color !== currentPlayer) return true;
  }

  if (
    enPassantTarget &&
    toRow === enPassantTarget[0] &&
    toCol === enPassantTarget[1] &&
    Math.abs(fromCol - toCol) === 1 &&
    toRow === fromRow + direction
  ) {
    return true;
  }

  return false;
};

const isValidRookMove = (
  board: Board,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean => {
  if (fromRow !== toRow && fromCol !== toCol) return false;

  const rowStep = fromRow === toRow ? 0 : toRow > fromRow ? 1 : -1;
  const colStep = fromCol === toCol ? 0 : toCol > fromCol ? 1 : -1;

  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;

  while (currentRow !== toRow || currentCol !== toCol) {
    if (board[currentRow][currentCol] !== null) return false;
    currentRow += rowStep;
    currentCol += colStep;
  }

  return true;
};

const isValidKnightMove = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean => {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
};

const isValidBishopMove = (
  board: Board,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean => {
  if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;

  const rowStep = toRow > fromRow ? 1 : -1;
  const colStep = toCol > fromCol ? 1 : -1;

  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;

  while (currentRow !== toRow && currentCol !== toCol) {
    if (currentRow < 0 || currentRow >= 8 || currentCol < 0 || currentCol >= 8)
      return false;
    if (board[currentRow][currentCol] !== null) return false;
    currentRow += rowStep;
    currentCol += colStep;
  }

  return true;
};

const isValidQueenMove = (
  board: Board,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean => {
  return (
    isValidRookMove(board, fromRow, fromCol, toRow, toCol) ||
    isValidBishopMove(board, fromRow, fromCol, toRow, toCol)
  );
};

const areKingsTooClose = (
  board: Board,
  kingRow: number,
  kingCol: number,
  opponentColor: PieceColor,
): boolean => {
  const opponentKingPosition = findKing(board, opponentColor);
  if (!opponentKingPosition) return false;

  const [opponentKingRow, opponentKingCol] = opponentKingPosition;
  const rowDiff = Math.abs(kingRow - opponentKingRow);
  const colDiff = Math.abs(kingCol - opponentKingCol);

  return rowDiff <= 1 && colDiff <= 1;
};

const isValidKingMove = (
  board: Board,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  currentPlayer: PieceColor,
): boolean => {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  if (rowDiff > 1 || colDiff > 1) return false;

  const opponentColor = currentPlayer === "white" ? "black" : "white";
  return !areKingsTooClose(board, toRow, toCol, opponentColor);
};

export const isCheck = (gameState: GameState, player: PieceColor): boolean => {
  const { board } = gameState;
  const kingPosition = findKing(board, player);
  if (!kingPosition) return false;

  const [kingRow, kingCol] = kingPosition;
  const opponentColor = player === "white" ? "black" : "white";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        if (
          isValidMove(
            { ...gameState, currentPlayer: opponentColor },
            row,
            col,
            kingRow,
            kingCol,
          )
        ) {
          return true;
        }
      }
    }
  }

  return false;
};

export const isCheckmate = (gameState: GameState): boolean => {
  const { currentPlayer } = gameState;
  if (!isCheck(gameState, currentPlayer)) return false;

  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      for (let toRow = 0; toRow < 8; toRow++) {
        for (let toCol = 0; toCol < 8; toCol++) {
          if (isValidMove(gameState, fromRow, fromCol, toRow, toCol)) {
            return false;
          }
        }
      }
    }
  }

  return true;
};

export const isStalemate = (gameState: GameState): boolean => {
  const { currentPlayer } = gameState;
  if (isCheck(gameState, currentPlayer)) return false;

  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      for (let toRow = 0; toRow < 8; toRow++) {
        for (let toCol = 0; toCol < 8; toCol++) {
          if (isValidMove(gameState, fromRow, fromCol, toRow, toCol)) {
            return false;
          }
        }
      }
    }
  }

  return true;
};

export const updateEnPassantTarget = (
  gameState: GameState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): [number, number] | null => {
  const { board, currentPlayer } = gameState;
  const piece = board[fromRow][fromCol];

  if (piece && piece.type === "pawn" && piece.color === currentPlayer) {
    const twoSquareAdvance = Math.abs(toRow - fromRow) === 2;
    if (twoSquareAdvance) {
      const enPassantRow = (fromRow + toRow) / 2;
      return [enPassantRow, toCol];
    }
  }

  return null;
};

export const doesMoveResolveCheck = (
  gameState: GameState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean => {
  const newGameState: GameState = {
    board: JSON.parse(JSON.stringify(gameState.board)),
    currentPlayer: gameState.currentPlayer,
    enPassantTarget: gameState.enPassantTarget,
  };
  newGameState.board[toRow][toCol] = newGameState.board[fromRow][fromCol];
  newGameState.board[fromRow][fromCol] = null;
  return !isCheck(newGameState, newGameState.currentPlayer);
};
