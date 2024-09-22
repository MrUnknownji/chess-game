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
} from "./utils/moveValidation";
import { GameState, PieceColor } from "./utils/types";
import { initialBoard } from "./utils/boardUtils";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    board: initialBoard,
    currentPlayer: "white",
    enPassantTarget: null,
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const handleMove = useCallback(
    (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
      if (isGameOver || !isGameStarted) return;

      if (isValidMove(gameState, fromRow, fromCol, toRow, toCol)) {
        setGameState((prevState: GameState) => {
          const newBoard = JSON.parse(JSON.stringify(prevState.board));
          newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
          newBoard[fromRow][fromCol] = null;

          if (
            prevState.enPassantTarget &&
            toRow === prevState.enPassantTarget[0] &&
            toCol === prevState.enPassantTarget[1] &&
            newBoard[toRow][toCol]?.type === "pawn"
          ) {
            newBoard[fromRow][toCol] = null;
          }

          const nextPlayer: PieceColor =
            prevState.currentPlayer === "white" ? "black" : "white";
          const newEnPassantTarget = updateEnPassantTarget(
            prevState,
            fromRow,
            fromCol,
            toRow,
            toCol,
          );

          const newGameState: GameState = {
            board: newBoard,
            currentPlayer: nextPlayer,
            enPassantTarget: newEnPassantTarget,
          };

          if (isCheckmate(newGameState)) {
            setIsGameOver(true);
            setResult(`Checkmate! ${prevState.currentPlayer} wins!`);
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
      }
    },
    [gameState, isGameOver, isGameStarted],
  );

  const handleStartNewGame = useCallback(() => {
    setGameState({
      board: initialBoard,
      currentPlayer: "white",
      enPassantTarget: null,
    });
    setIsGameOver(false);
    setResult(null);
    setIsGameStarted(true);
  }, []);

  const handleResign = useCallback(() => {
    const currentPlayer = gameState.currentPlayer;
    setIsGameOver(true);
    setResult(
      `${currentPlayer} resigns. ${currentPlayer === "white" ? "Black" : "White"} wins!`,
    );
    setIsGameStarted(false);
  }, [gameState.currentPlayer]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-100 p-4">
        <Chessboard
          gameState={gameState}
          onMove={handleMove}
          isGameStarted={isGameStarted}
          isGameOver={isGameOver}
        />

        <div className="mt-8 md:mt-0 md:ml-8">
          <GameControls
            currentPlayer={gameState.currentPlayer}
            isGameOver={isGameOver}
            result={result}
            onStartNewGame={handleStartNewGame}
            onResign={handleResign}
            isGameStarted={isGameStarted}
          />
        </div>
      </div>
      <DragLayer />
    </DndProvider>
  );
}
