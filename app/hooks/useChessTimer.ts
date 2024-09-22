import { useState, useEffect, useCallback } from "react";
import { PieceColor } from "../utils/types";

export const useChessTimer = (initialTime: number) => {
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [activePlayer, setActivePlayer] = useState<PieceColor>("white");

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setWhiteTime(initialTime);
    setBlackTime(initialTime);
    setActivePlayer("white");
    setIsRunning(false);
  }, [initialTime]);

  const resetAndStart = useCallback(() => {
    setWhiteTime(initialTime);
    setBlackTime(initialTime);
    setActivePlayer("white");
    setIsRunning(true);
  }, [initialTime]);

  const switchPlayer = useCallback(() => {
    setActivePlayer((prevPlayer) =>
      prevPlayer === "white" ? "black" : "white",
    );
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        if (activePlayer === "white") {
          setWhiteTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        } else {
          setBlackTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, activePlayer]);

  return {
    whiteTime,
    blackTime,
    activePlayer,
    startTimer,
    stopTimer,
    resetTimer,
    resetAndStart,
    switchPlayer,
  };
};
