import { GameState, Board, PieceColor, Piece } from "./types";
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

  if (!piece || piece.color !== currentPlayer) {
    return false;
  }

  const targetPiece = board[toRow][toCol];
  if (targetPiece && targetPiece.color === currentPlayer) {
    return false;
  }

  if (piece.type === "king" && Math.abs(toCol - fromCol) === 2) {
    return isCastlingValid(gameState, fromRow, fromCol, toRow, toCol);
  }

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

  if (!validAccordingToPieceRules) {
    return false;
  }

  const newGameState: GameState = {
    ...gameState,
    board: JSON.parse(JSON.stringify(board)),
    pendingPromotion: null,
  };
  newGameState.board[toRow][toCol] = newGameState.board[fromRow][fromCol];
  newGameState.board[fromRow][fromCol] = null;

  if (isCheck(gameState, currentPlayer)) {
    return !isCheck(newGameState, currentPlayer);
  } else {
    return !isCheck(newGameState, currentPlayer);
  }
};

const isValidPawnMove = (
  gameState: GameState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean => {
  const { board, currentPlayer, enPassantTarget } = gameState;
  const piece = board[fromRow][fromCol];
  if (piece?.type !== "pawn") return false;

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

    if (
      enPassantTarget &&
      toRow === enPassantTarget[0] &&
      toCol === enPassantTarget[1]
    ) {
      return true;
    }
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
        if (canPieceAttackKing(gameState, row, col, kingRow, kingCol)) {
          return true;
        }
      }
    }
  }

  return false;
};

const canPieceAttackKing = (
  gameState: GameState,
  fromRow: number,
  fromCol: number,
  kingRow: number,
  kingCol: number,
): boolean => {
  const { board } = gameState;
  const piece = board[fromRow][fromCol];

  if (!piece) return false;

  switch (piece.type) {
    case "pawn":
      return isValidPawnAttack(piece.color, fromRow, fromCol, kingRow, kingCol);
    case "rook":
      return isValidRookMove(board, fromRow, fromCol, kingRow, kingCol);
    case "knight":
      return isValidKnightMove(fromRow, fromCol, kingRow, kingCol);
    case "bishop":
      return isValidBishopMove(board, fromRow, fromCol, kingRow, kingCol);
    case "queen":
      return isValidQueenMove(board, fromRow, fromCol, kingRow, kingCol);
    case "king":
      return isValidKingMove(
        board,
        fromRow,
        fromCol,
        kingRow,
        kingCol,
        piece.color,
      );
    default:
      return false;
  }
};

const isValidPawnAttack = (
  pawnColor: PieceColor,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean => {
  const direction = pawnColor === "white" ? -1 : 1;
  return toRow === fromRow + direction && Math.abs(toCol - fromCol) === 1;
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
  const { currentPlayer, board } = gameState;

  if (isCheck(gameState, currentPlayer)) return false;

  if (hasInsufficientMaterial(board)) return true;

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

const hasInsufficientMaterial = (board: (Piece | null)[][]): boolean => {
  const pieces: Piece[] = board
    .flat()
    .filter((piece): piece is Piece => piece !== null);

  if (pieces.length <= 2) return true;

  if (pieces.length === 3) {
    const nonKingPiece = pieces.find((piece) => piece.type !== "king");
    if (
      nonKingPiece &&
      (nonKingPiece.type === "knight" || nonKingPiece.type === "bishop")
    ) {
      return true;
    }
  }

  if (pieces.length === 4) {
    const bishops = pieces.filter((piece) => piece.type === "bishop");
    if (bishops.length === 2 && bishops[0].color !== bishops[1].color) {
      const bishopPositions = findBishopPositions(board);
      if (bishopPositions.length === 2) {
        const [row1, col1] = bishopPositions[0];
        const [row2, col2] = bishopPositions[1];
        if ((row1 + col1) % 2 === (row2 + col2) % 2) {
          return true;
        }
      }
    }
  }

  return false;
};

const findBishopPositions = (board: (Piece | null)[][]): [number, number][] => {
  const positions: [number, number][] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col]?.type === "bishop") {
        positions.push([row, col]);
      }
    }
  }
  return positions;
};

export const isThreefoldRepetition = (
  gameState: GameState,
  positionHistory: string[],
): boolean => {
  const currentPosition = JSON.stringify(gameState.board);
  return (
    positionHistory.filter((position) => position === currentPosition).length >=
    3
  );
};

export const isFiftyMoveRule = (moveCount: number): boolean => {
  return moveCount >= 100;
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
    whiteKingMoved: gameState.whiteKingMoved,
    blackKingMoved: gameState.blackKingMoved,
    whiteRooksMoved: gameState.whiteRooksMoved,
    blackRooksMoved: gameState.blackRooksMoved,
    pendingPromotion: gameState.pendingPromotion,
    positionHistory: [...gameState.positionHistory],
    movesSincePawnMoveOrCapture: gameState.movesSincePawnMoveOrCapture,
    moveHistory: [...gameState.moveHistory],
    currentMoveIndex: gameState.currentMoveIndex,
  };
  newGameState.board[toRow][toCol] = newGameState.board[fromRow][fromCol];
  newGameState.board[fromRow][fromCol] = null;
  return !isCheck(newGameState, gameState.currentPlayer);
};

const isCastlingValid = (
  gameState: GameState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean => {
  const { board, currentPlayer } = gameState;
  const piece = board[fromRow][fromCol];

  if (piece?.type !== "king") return false;
  if (fromRow !== toRow) return false;
  if (Math.abs(fromCol - toCol) !== 2) return false;

  const isKingside = toCol > fromCol;
  const rookCol = isKingside ? 7 : 0;
  const rookPiece = board[fromRow][rookCol];

  if (
    !rookPiece ||
    rookPiece.type !== "rook" ||
    rookPiece.color !== currentPlayer
  )
    return false;

  const kingHasMoved =
    currentPlayer === "white"
      ? gameState.whiteKingMoved
      : gameState.blackKingMoved;
  const rookHasMoved =
    currentPlayer === "white"
      ? gameState.whiteRooksMoved[isKingside ? 1 : 0]
      : gameState.blackRooksMoved[isKingside ? 1 : 0];

  if (kingHasMoved || rookHasMoved) return false;

  const direction = isKingside ? 1 : -1;
  for (let col = fromCol + direction; col !== rookCol; col += direction) {
    if (board[fromRow][col] !== null) return false;
  }

  const checkSquares = isKingside ? [4, 5, 6] : [2, 3, 4];
  for (const col of checkSquares) {
    if (
      isCheck(
        {
          ...gameState,
          board: simulateMove(board, fromRow, fromCol, fromRow, col),
        },
        currentPlayer,
      )
    ) {
      return false;
    }
  }

  return true;
};

const simulateMove = (
  board: Board,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): Board => {
  const newBoard = JSON.parse(JSON.stringify(board));
  newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
  newBoard[fromRow][fromCol] = null;
  return newBoard;
};
