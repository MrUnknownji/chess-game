"use client";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Chessboard from "./components/Chessboard";
import GameControls from "./components/GameControls";
import DragLayer from "./components/DragLayer";
import PromotionDialog from "./components/PromotionDialog";
import MoveHistory from "./components/MoveHistory";
import Header from "./components/Header";
import { useChessGame } from "./hooks/useChessGame";

export default function Home() {
  const {
    gameState,
    isGameOver,
    result,
    isGameStarted,
    promotionDialog,
    winner,
    isReviewMode,
    handleMove,
    handlePromotion,
    handleStartNewGame,
    handleResign,
    handleUndo,
    handleRedo,
    handleToggleReviewMode,
    handleMoveSelect,
  } = useChessGame();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <Header />
        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8 flex flex-col items-center space-y-4 md:space-y-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-12">
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
          <MoveHistory
            moves={gameState.moveHistory}
            currentMoveIndex={gameState.currentMoveIndex}
            onMoveSelect={handleMoveSelect}
          />
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
