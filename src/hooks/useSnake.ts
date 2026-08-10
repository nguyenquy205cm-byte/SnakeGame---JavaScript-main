// Main game state hook that preserves the original gameplay loop.
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Difficulty, Direction, GameState } from '../types';
import { canTurn, createRandomPosition, getGameSpeed, getInitialGameState, resetGameState, stepGame } from '../utils/gameEngine';
import { createScore } from '../services/scoreService';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'highScore';

const useSnake = () => {
  const { isAuthenticated } = useAuth();
  const [gameState, setGameState] = useState<GameState>(() => {
    const storedHighScore = Number(localStorage.getItem(STORAGE_KEY) || 0);
    return getInitialGameState(storedHighScore);
  });
  const [scoreSaved, setScoreSaved] = useState(false);

  const updateHighScore = useCallback((score: number) => {
    const nextHighScore = Math.max(score, Number(localStorage.getItem(STORAGE_KEY) || 0));
    localStorage.setItem(STORAGE_KEY, String(nextHighScore));
    setGameState((currentState) => ({ ...currentState, highScore: nextHighScore }));
  }, []);

  useEffect(() => {
    if (!gameState.gameOver) {
      setScoreSaved(false);
      return;
    }

    if (scoreSaved) {
      return;
    }

    if (isAuthenticated && gameState.score > 0) {
      createScore({ score: gameState.score, level: 1 })
        .then(() => setScoreSaved(true))
        .catch(() => setScoreSaved(true));
    } else {
      setScoreSaved(true);
    }
  }, [gameState.gameOver, gameState.score, scoreSaved, isAuthenticated]);

  const startGame = useCallback((difficulty: Difficulty) => {
    const nextSpeed = getGameSpeed(difficulty);
    setGameState((currentState) => ({
      ...currentState,
      gameSpeed: nextSpeed,
      showDifficultyModal: false,
      showGameOverModal: false,
      gameOver: false,
      snake: [],
      snakeHead: { x: 5, y: 10 },
      food: createRandomPosition(),
      velocityX: 0,
      velocityY: 0,
      score: 0,
    }));
  }, []);

  const restartGame = useCallback(() => {
    const storedHighScore = Number(localStorage.getItem(STORAGE_KEY) || 0);
    setGameState(resetGameState(storedHighScore));
  }, []);

  const changeDirection = useCallback((direction: Direction) => {
    setGameState((currentState) => {
      if (currentState.gameOver || currentState.showDifficultyModal) {
        return currentState;
      }

      if (canTurn(currentState.velocityX, currentState.velocityY, direction)) {
        const nextState = { ...currentState };
        if (direction === 'ArrowUp') {
          nextState.velocityX = 0;
          nextState.velocityY = -1;
        } else if (direction === 'ArrowDown') {
          nextState.velocityX = 0;
          nextState.velocityY = 1;
        } else if (direction === 'ArrowRight') {
          nextState.velocityX = 1;
          nextState.velocityY = 0;
        } else if (direction === 'ArrowLeft') {
          nextState.velocityX = -1;
          nextState.velocityY = 0;
        }
        return nextState;
      }

      return currentState;
    });
  }, []);

  useEffect(() => {
    if (gameState.gameOver || gameState.showDifficultyModal) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setGameState((currentState) => {
        const nextState = stepGame(currentState);
        if (nextState.highScore > currentState.highScore) {
          localStorage.setItem(STORAGE_KEY, String(nextState.highScore));
        }
        return nextState;
      });
    }, gameState.gameSpeed);

    return () => window.clearInterval(intervalId);
  }, [gameState.gameSpeed, gameState.gameOver, gameState.showDifficultyModal]);

  useEffect(() => {
    if (gameState.score > 0 && gameState.score > Number(localStorage.getItem(STORAGE_KEY) || 0)) {
      updateHighScore(gameState.score);
    }
  }, [gameState.score, updateHighScore]);

  const derivedState = useMemo(() => ({
    ...gameState,
    showGameOverModal: gameState.gameOver,
  }), [gameState]);

  return {
    gameState: derivedState,
    startGame,
    restartGame,
    changeDirection,
  };
};

export default useSnake;
