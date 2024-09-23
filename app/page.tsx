"use client";
import React, { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Chessboard from "./components/Chessboard";
import GameControls from "./components/GameControls";
import DragLayer from "./components/DragLayer";
import {
  isCheck,
  isCheckmate,
  isStalemate,
  isValidMove,
  updateEnPassantTarget,
  isThreefoldRepetition,
  isFiftyMoveRule,
} from "./utils/moveValidation";
import { GameState, Move, PieceColor, PieceType } from "./utils/types";
import PromotionDialog from "./components/PromotionDialog";
import { createInitialGameState } from "./utils/gameStateUtils";
import MoveHistory from "./components/MoveHistory";
import Header from "./components/Header";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(
    createInitialGameState(),
  );

  const [isGameOver, setIsGameOver] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [promotionDialog, setPromotionDialog] = useState<{
    from: [number, number];
    to: [number, number];
  } | null>(null);
  const [winner, setWinner] = useState<PieceColor | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const handleMove = useCallback(
    (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
      if (isGameOver || !isGameStarted) return;

      if (isValidMove(gameState, fromRow, fromCol, toRow, toCol)) {
        setGameState((prevState: GameState) => {
          const newBoard = JSON.parse(JSON.stringify(prevState.board));
          const piece = newBoard[fromRow][fromCol];

          if (
            piece.type === "pawn" &&
            ((piece.color === "white" && toRow === 0) ||
              (piece.color === "black" && toRow === 7))
          ) {
            setPromotionDialog({
              from: [fromRow, fromCol],
              to: [toRow, toCol],
            });
            return prevState;
          }

          newBoard[toRow][toCol] = piece;
          newBoard[fromRow][fromCol] = null;

          if (
            piece.type === "pawn" &&
            Math.abs(fromCol - toCol) === 1 &&
            newBoard[toRow][toCol] === null
          ) {
            newBoard[fromRow][toCol] = null;
          }

          const newEnPassantTarget = updateEnPassantTarget(
            prevState,
            fromRow,
            fromCol,
            toRow,
            toCol,
          );

          if (piece.type === "king" && Math.abs(toCol - fromCol) === 2) {
            const isKingside = toCol > fromCol;
            const rookFromCol = isKingside ? 7 : 0;
            const rookToCol = isKingside ? toCol - 1 : toCol + 1;
            newBoard[toRow][rookToCol] = newBoard[toRow][rookFromCol];
            newBoard[toRow][rookFromCol] = null;
          }

          const nextPlayer: PieceColor =
            prevState.currentPlayer === "white" ? "black" : "white";

          const newPositionHistory = [
            ...prevState.positionHistory,
            JSON.stringify(newBoard),
          ];
          let newMovesSincePawnMoveOrCapture =
            prevState.movesSincePawnMoveOrCapture + 1;

          if (piece.type === "pawn" || newBoard[toRow][toCol] !== null) {
            newMovesSincePawnMoveOrCapture = 0;
          }

          const newMove: Move = {
            from: [fromRow, fromCol],
            to: [toRow, toCol],
            piece: piece,
            capturedPiece: newBoard[toRow][toCol],
            isPromotion: false,
          };

          const newGameState: GameState = {
            board: newBoard,
            currentPlayer: nextPlayer,
            enPassantTarget: newEnPassantTarget,
            whiteKingMoved:
              prevState.whiteKingMoved ||
              (piece.type === "king" && piece.color === "white"),
            blackKingMoved:
              prevState.blackKingMoved ||
              (piece.type === "king" && piece.color === "black"),
            whiteRooksMoved: [
              prevState.whiteRooksMoved[0] ||
                (piece.type === "rook" &&
                  piece.color === "white" &&
                  fromCol === 0),
              prevState.whiteRooksMoved[1] ||
                (piece.type === "rook" &&
                  piece.color === "white" &&
                  fromCol === 7),
            ],
            blackRooksMoved: [
              prevState.blackRooksMoved[0] ||
                (piece.type === "rook" &&
                  piece.color === "black" &&
                  fromCol === 0),
              prevState.blackRooksMoved[1] ||
                (piece.type === "rook" &&
                  piece.color === "black" &&
                  fromCol === 7),
            ],
            pendingPromotion: null,
            positionHistory: newPositionHistory,
            movesSincePawnMoveOrCapture: newMovesSincePawnMoveOrCapture,
            moveHistory: [...prevState.moveHistory, newMove],
            currentMoveIndex: prevState.moveHistory.length,
          };

          if (isCheckmate(newGameState)) {
            setIsGameOver(true);
            setResult(
              `Checkmate! ${piece.color.charAt(0).toUpperCase() + piece.color.slice(1)} wins!`,
            );
            setIsGameStarted(false);
            setWinner(piece.color);
          } else if (
            isStalemate(newGameState) ||
            isThreefoldRepetition(newGameState, newPositionHistory) ||
            isFiftyMoveRule(newMovesSincePawnMoveOrCapture)
          ) {
            setIsGameOver(true);
            setResult("Stalemate! The game is a draw.");
            setIsGameStarted(false);
          } else if (isCheck(newGameState, nextPlayer)) {
            setResult(`${nextPlayer} is in check!`);
          } else {
            setResult(null);
          }

          return {
            ...newGameState,
            moveHistory: [...prevState.moveHistory, newMove],
            currentMoveIndex: prevState.moveHistory.length,
          };
        });
      }
    },
    [gameState, isGameOver, isGameStarted],
  );

  const handlePromotion = useCallback(
    (pieceType: PieceType) => {
      if (!promotionDialog) return;

      setGameState((prevState: GameState) => {
        const newBoard = JSON.parse(JSON.stringify(prevState.board));
        const [fromRow, fromCol] = promotionDialog.from;
        const [toRow, toCol] = promotionDialog.to;
        const piece = newBoard[fromRow][fromCol];

        newBoard[toRow][toCol] = {
          type: pieceType,
          color: piece.color,
        };
        newBoard[fromRow][fromCol] = null;

        const nextPlayer: PieceColor =
          piece.color === "white" ? "black" : "white";

        const newMove: Move = {
          from: promotionDialog.from,
          to: promotionDialog.to,
          piece: piece,
          capturedPiece: newBoard[toRow][toCol],
          isPromotion: true,
          promotedTo: pieceType,
        };

        const newGameState: GameState = {
          ...prevState,
          board: newBoard,
          currentPlayer: nextPlayer,
          pendingPromotion: null,
          moveHistory: [...prevState.moveHistory, newMove],
          currentMoveIndex: prevState.moveHistory.length,
        };

        if (isCheckmate(newGameState)) {
          setIsGameOver(true);
          setResult(`Checkmate! ${piece.color} wins!`);
          setIsGameStarted(false);
        } else if (isStalemate(newGameState)) {
          setIsGameOver(true);
          setResult("Stalemate! The game is a draw.");
          setIsGameStarted(false);
        } else if (isCheck(newGameState, nextPlayer)) {
          setResult(`${nextPlayer} is in check!`);
        } else {
          setResult(null);
        }

        return newGameState;
      });

      setPromotionDialog(null);
    },
    [promotionDialog],
  );

  const handleStartNewGame = useCallback(() => {
    setGameState(createInitialGameState());
    setIsGameOver(false);
    setResult(null);
    setIsGameStarted(true);
    setWinner(null);
  }, []);

  const handleResign = useCallback(() => {
    const currentPlayer = gameState.currentPlayer;
    const resigningPlayer = currentPlayer === "white" ? "black" : "white";
    setIsGameOver(true);
    setResult(
      `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} resigns. ${resigningPlayer.charAt(0).toUpperCase() + resigningPlayer.slice(1)} wins!`,
    );
    setIsGameStarted(false);
    setWinner(resigningPlayer);
  }, [gameState.currentPlayer]);

  const handleUndo = useCallback(() => {
    if (gameState.currentMoveIndex > 0) {
      setGameState((prevState) => ({
        ...prevState,
        currentMoveIndex: prevState.currentMoveIndex - 1,
        board: JSON.parse(
          prevState.positionHistory[prevState.currentMoveIndex - 1],
        ),
        currentPlayer: prevState.currentPlayer === "white" ? "black" : "white",
      }));
    }
  }, [gameState]);

  const handleRedo = useCallback(() => {
    if (gameState.currentMoveIndex < gameState.moveHistory.length) {
      setGameState((prevState) => ({
        ...prevState,
        currentMoveIndex: prevState.currentMoveIndex + 1,
        board: JSON.parse(
          prevState.positionHistory[prevState.currentMoveIndex + 1],
        ),
        currentPlayer: prevState.currentPlayer === "white" ? "black" : "white",
      }));
    }
  }, [gameState]);

  const handleToggleReviewMode = useCallback(() => {
    setIsReviewMode((prev) => !prev);
    if (!isReviewMode) {
      setGameState((prevState) => ({
        ...prevState,
        currentMoveIndex: prevState.moveHistory.length - 1,
      }));
    }
  }, [isReviewMode]);

  const handleMoveSelect = useCallback((index: number) => {
    setGameState((prevState) => ({
      ...prevState,
      currentMoveIndex: index,
      board: JSON.parse(prevState.positionHistory[index]),
      currentPlayer: index % 2 === 0 ? "black" : "white",
    }));
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <Header />
        <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-8">
          <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-12">
            <Chessboard
              gameState={gameState}
              onMove={handleMove}
              isGameStarted={isGameStarted}
              isGameOver={isGameOver}
              winner={winner}
              isReviewMode={isReviewMode}
            />
            <GameControls
              currentPlayer={gameState.currentPlayer}
              isGameOver={isGameOver}
              result={result}
              onStartNewGame={handleStartNewGame}
              onResign={handleResign}
              isGameStarted={isGameStarted}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={gameState.currentMoveIndex > 0}
              canRedo={
                gameState.currentMoveIndex < gameState.moveHistory.length - 1
              }
              isReviewMode={isReviewMode}
              onToggleReviewMode={handleToggleReviewMode}
            />
          </div>
          <div
            className="w-full max-w-[900px] transition-all duration-1000 ease-in-out overflow-hidden"
            style={{ maxHeight: isReviewMode ? "100px" : "0" }}
          >
            <MoveHistory
              moves={gameState.moveHistory}
              currentMoveIndex={gameState.currentMoveIndex}
              onMoveSelect={handleMoveSelect}
            />
          </div>
        </div>
      </div>
      <DragLayer />
      {promotionDialog && (
        <PromotionDialog
          color={gameState.currentPlayer}
          onPromote={handlePromotion}
        />
      )}
    </DndProvider>
  );
}
