import { useState, useCallback, useEffect, useRef } from "react";
import { Chess, Move, Square } from "chess.js";
import { Board, PieceColor, PieceType } from "../utils/types";

// Helper to map chess.js board to our UI board format
const mapBoard = (chessBoard: ({ square: string; type: string; color: string } | null)[][]): Board => {
  return chessBoard.map((row) =>
    row.map((piece) => {
      if (!piece) return null;
      const typeMap: Record<string, PieceType> = {
        p: "pawn",
        r: "rook",
        n: "knight",
        b: "bishop",
        q: "queen",
        k: "king",
      };
      return {
        type: typeMap[piece.type],
        color: piece.color === "w" ? "white" : "black",
      };
    })
  );
};

export const useChessGame = () => {
  // Main game state
  const [game, setGame] = useState(new Chess());
  const gameRef = useRef(game); // Ref to always hold latest game instance
  const [board, setBoard] = useState<Board>(mapBoard(game.board()));
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const [promotionDialog, setPromotionDialog] = useState<{
    from: string;
    to: string;
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
  } | null>(null);

  const [gameMode, setGameMode] = useState<'pvp' | 'pve'>('pvp');

  // Game Status
  const [isGameOver, setIsGameOver] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [winner, setWinner] = useState<PieceColor | null>(null);

  // Review & Navigation
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Keep ref synced with state
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // Helper to update local state from chess instance
  const updateGameState = useCallback((chess: Chess) => {
    setBoard(mapBoard(chess.board()));
    const history = chess.history({ verbose: true }) as Move[];
    setMoveHistory(history);
    setIsGameOver(chess.isGameOver());

    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        const winnerColor = chess.turn() === 'w' ? 'black' : 'white';
        setWinner(winnerColor);
        setResult(`Checkmate! ${winnerColor === 'white' ? 'White' : 'Black'} wins!`);
      } else if (chess.isDraw()) {
        setResult("Draw!");
        setWinner(null);
      } else if (chess.isStalemate()) {
        setResult("Stalemate!");
        setWinner(null);
      } else if (chess.isThreefoldRepetition()) {
        setResult("Draw by repetition!");
        setWinner(null);
      } else if (chess.isInsufficientMaterial()) {
        setResult("Draw by insufficient material!");
        setWinner(null);
      }
    } else if (chess.inCheck()) {
      // Optional
    } else {
      setResult(null);
    }
  }, []);

  // AI Move Effect
  useEffect(() => {
    if (!isGameStarted) return;
    if (gameMode === 'pve' && game.turn() === 'b' && !isGameOver && !promotionDialog) {
      const timeout = setTimeout(() => {
        const moves = game.moves();
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          const gameCopy = new Chess();
          gameCopy.loadPgn(game.pgn());

          gameCopy.move(randomMove);
          setGame(gameCopy);
          updateGameState(gameCopy);
          setCurrentMoveIndex(prev => prev + 1);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [game, gameMode, isGameOver, promotionDialog, updateGameState, isGameStarted]);

  const handleStartNewGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    gameRef.current = newGame; // Immediate ref update
    updateGameState(newGame);
    setCurrentMoveIndex(-1);
    setIsReviewMode(false);
    setIsGameOver(false);
    setResult(null);
    setWinner(null);
    setPromotionDialog(null);
    setIsGameStarted(true);
  }, [updateGameState]);

  const toggleGameMode = useCallback(() => {
    setGameMode(prev => prev === 'pvp' ? 'pve' : 'pvp');
  }, []);

  const handleMove = useCallback(
    (fromRow: number, fromCol: number, toRow: number, toCol: number, promotion?: string) => {
      if (isReviewMode || !isGameStarted) return;

      try {
        const fromSquare = `${String.fromCharCode(97 + fromCol)}${8 - fromRow}`;
        const toSquare = `${String.fromCharCode(97 + toCol)}${8 - toRow}`;

        const currentGame = gameRef.current; // Use ref to get latest game
        const piece = currentGame.get(fromSquare as Square);
        if (
          piece &&
          piece.type === 'p' &&
          ((piece.color === 'w' && toRow === 0) || (piece.color === 'b' && toRow === 7))
        ) {
          const tempGame = new Chess(currentGame.fen());
          try {
            const result = tempGame.move({ from: fromSquare, to: toSquare, promotion: 'q' });
            if (result) {
              setPromotionDialog({ from: fromSquare, to: toSquare, fromRow, fromCol, toRow, toCol });
              return true;
            }
          } catch { return false; }
          return false;
        }

        // Clone using PGN to preserved history
        const gameCopy = new Chess();
        gameCopy.loadPgn(currentGame.pgn());

        const moveResult = gameCopy.move({
          from: fromSquare,
          to: toSquare,
          promotion: promotion || 'q',
        });

        if (moveResult) {
          setGame(gameCopy);
          gameRef.current = gameCopy; // Immediate ref update
          updateGameState(gameCopy);
          setCurrentMoveIndex(prev => prev + 1);
          return true;
        }
      } catch {
        return false;
      }
      return false;
    },
    [isReviewMode, updateGameState, isGameStarted]
  );

  const handlePromotion = useCallback((pieceType: PieceType) => {
    if (!promotionDialog) return;

    const { from, to } = promotionDialog;
    const typeMap: Record<string, string> = {
      'queen': 'q',
      'rook': 'r',
      'bishop': 'b',
      'knight': 'n'
    };

    const promotionChar = typeMap[pieceType] || 'q';

    try {
      const currentGame = gameRef.current;
      const gameCopy = new Chess();
      gameCopy.loadPgn(currentGame.pgn());

      gameCopy.move({
        from,
        to,
        promotion: promotionChar
      });
      setGame(gameCopy);
      gameRef.current = gameCopy; // Immediate ref update
      updateGameState(gameCopy);
      setCurrentMoveIndex(prev => prev + 1);
      setPromotionDialog(null);
    } catch {
      setPromotionDialog(null);
    }

  }, [promotionDialog, updateGameState]);

  const handleResign = useCallback(() => {
    if (isGameOver) return;
    setIsGameOver(true);
    const w = game.turn() === 'w' ? 'black' : 'white';
    setWinner(w);
    setResult(`${game.turn() === 'w' ? 'White' : 'Black'} resigns. ${w === 'white' ? 'White' : 'Black'} wins!`);
  }, [game, isGameOver]);

  const handleAbort = useCallback(() => {
    if (isGameOver) return;
    setIsGameOver(true);
    setWinner(null);
    setResult("Game aborted");
  }, [isGameOver]);

  // Undo also needs to respect history
  const handleUndo = useCallback(() => {
    if (isReviewMode && currentMoveIndex >= 0) {
      setCurrentMoveIndex(prev => prev - 1);
    }
  }, [isReviewMode, currentMoveIndex]);

  const handleRedo = useCallback(() => {
    if (isReviewMode) {
      const totalMoves = game.history().length;
      if (currentMoveIndex < totalMoves - 1) {
        setCurrentMoveIndex(prev => prev + 1);
      }
    }
  }, [isReviewMode, currentMoveIndex, game]);

  const handleMoveSelect = useCallback((index: number) => {
    const moves = game.history({ verbose: true });
    const tempGame = new Chess();
    try {
      for (let i = 0; i <= index; i++) {
        const move = moves[i];
        tempGame.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion
        });
      }
      setBoard(mapBoard(tempGame.board()));
      if (isReviewMode) {
        setCurrentMoveIndex(index);
      }
    } catch (e) {
      console.error("Error replaying moves:", e);
    }
  }, [game, isReviewMode]);

  const handleToggleReviewMode = useCallback(() => {
    if (!isReviewMode) {
      // Turning review mode ON
      setCurrentMoveIndex(game.history().length - 1);
      setIsReviewMode(true);
    } else {
      // Turning review mode OFF - reset to current game state
      setBoard(mapBoard(game.board()));
      setCurrentMoveIndex(game.history().length - 1);
      setIsReviewMode(false);
    }
  }, [game, isReviewMode]);

  useEffect(() => {
    if (isReviewMode && currentMoveIndex >= -1) {
      const tempGame = new Chess();
      const allMoves = game.history({ verbose: true });
      try {
        for (let i = 0; i <= currentMoveIndex; i++) {
          if (allMoves[i]) {
            tempGame.move({
              from: allMoves[i].from,
              to: allMoves[i].to,
              promotion: allMoves[i].promotion
            });
          }
        }
        setBoard(mapBoard(tempGame.board()));
      } catch (e) {
        console.error("Error syncing review board:", e);
      }
    }
  }, [currentMoveIndex, isReviewMode, game]);

  const getValidMoves = useCallback((row: number, col: number): [number, number][] => {
    try {
      const square = `${String.fromCharCode(97 + col)}${8 - row}`;
      const moves = game.moves({ square: square as Square, verbose: true });
      return moves.map(m => {
        const colIndex = m.to.charCodeAt(0) - 97;
        const rowIndex = 8 - parseInt(m.to[1]);
        return [rowIndex, colIndex] as [number, number];
      });
    } catch {
      return [];
    }
  }, [game]);

  return {
    gameState: {
      board,
      currentPlayer: (game.turn() === 'w' ? 'white' : 'black') as PieceColor,
      moveHistory: moveHistory,
      currentMoveIndex: currentMoveIndex,
    },
    isGameOver,
    result,
    isGameStarted,
    promotionDialog,
    winner,
    isReviewMode,
    gameMode,
    handleMove,
    handlePromotion,
    handleStartNewGame,
    handleResign,
    handleAbort,
    handleUndo,
    handleRedo,
    handleToggleReviewMode,
    handleMoveSelect,
    getValidMoves,
    toggleGameMode,
    game
  };
};
