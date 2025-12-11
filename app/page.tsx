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
    handleAbort,
    handleUndo,
    handleRedo,
    handleToggleReviewMode,
    handleMoveSelect,
    getValidMoves,
    game,
    gameMode,
    toggleGameMode,
  } = useChessGame();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground flex flex-col items-center py-8 px-4">
        <Header />

        <main className="w-full max-w-7xl flex flex-col lg:flex-row items-start justify-center gap-8 mt-8">
          <div className="flex-1 flex flex-col items-center w-full">
            <div className="glass-panel p-6 lg:p-8 rounded-2xl w-full max-w-[700px]">
              <Chessboard
                gameState={gameState}
                onMove={handleMove}
                getValidMoves={getValidMoves}
                isGameStarted={isGameStarted}
                isGameOver={isGameOver}
                winner={winner}
                isReviewMode={isReviewMode}
                game={game}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-start w-full space-y-6 max-w-md">
            <GameControls
              currentPlayer={gameState.currentPlayer}
              isGameOver={isGameOver}
              result={result}
              onStartNewGame={handleStartNewGame}
              onResign={handleResign}
              onAbort={handleAbort}
              isGameStarted={isGameStarted}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={isReviewMode && gameState.currentMoveIndex >= 0}
              canRedo={isReviewMode && gameState.currentMoveIndex < gameState.moveHistory.length - 1}
              isReviewMode={isReviewMode}
              onToggleReviewMode={handleToggleReviewMode}
              gameMode={gameMode}
              onToggleGameMode={toggleGameMode}
            />

            <MoveHistory
              moves={gameState.moveHistory}
              currentMoveIndex={gameState.currentMoveIndex}
              onMoveSelect={handleMoveSelect}
            />
          </div>
        </main>

        <DragLayer />

        {promotionDialog && (
          <PromotionDialog
            color={gameState.currentPlayer}
            onPromote={handlePromotion}
          />
        )}
      </div>
    </DndProvider>
  );
}
