// Core game logic extracted from the original script.
import type { Difficulty, GameState, Position } from '../types';

const BOARD_SIZE = 30;

const createInitialState = (highScore: number): GameState => ({
  snake: [],
  snakeHead: { x: 5, y: 10 },
  food: { x: 1, y: 1 },
  velocityX: 0,
  velocityY: 0,
  score: 0,
  highScore,
  gameOver: false,
  gameSpeed: 125,
  showDifficultyModal: true,
  showGameOverModal: false,
});

const createRandomPosition = (): Position => ({
  x: Math.floor(Math.random() * BOARD_SIZE) + 1,
  y: Math.floor(Math.random() * BOARD_SIZE) + 1,
});

const getGameSpeed = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case 'easy':
      return 200;
    case 'medium':
      return 125;
    case 'hard':
      return 75;
    default:
      return 125;
  }
};

const getInitialGameState = (highScore: number): GameState => {
  const state = createInitialState(highScore);
  state.food = createRandomPosition();
  return state;
};

const canTurn = (currentVelocityX: number, currentVelocityY: number, nextDirection: string): boolean => {
  if (nextDirection === 'ArrowUp' && currentVelocityY !== 1) return true;
  if (nextDirection === 'ArrowDown' && currentVelocityY !== -1) return true;
  if (nextDirection === 'ArrowRight' && currentVelocityX !== -1) return true;
  if (nextDirection === 'ArrowLeft' && currentVelocityX !== 1) return true;
  return false;
};

const stepGame = (state: GameState): GameState => {
  const nextState: GameState = { ...state };
  const tailX = nextState.snake.length ? nextState.snake[nextState.snake.length - 1].x : nextState.snakeHead.x;
  const tailY = nextState.snake.length ? nextState.snake[nextState.snake.length - 1].y : nextState.snakeHead.y;

  nextState.snakeHead = {
    x: nextState.snakeHead.x + nextState.velocityX,
    y: nextState.snakeHead.y + nextState.velocityY,
  };

  if (
    nextState.snakeHead.x < 1 ||
    nextState.snakeHead.x > BOARD_SIZE ||
    nextState.snakeHead.y < 1 ||
    nextState.snakeHead.y > BOARD_SIZE
  ) {
    nextState.gameOver = true;
    nextState.showGameOverModal = true;
    return nextState;
  }

  for (const segment of nextState.snake) {
    if (segment.x === nextState.snakeHead.x && segment.y === nextState.snakeHead.y) {
      nextState.gameOver = true;
      nextState.showGameOverModal = true;
      return nextState;
    }
  }

  if (nextState.snakeHead.x === nextState.food.x && nextState.snakeHead.y === nextState.food.y) {
    nextState.food = createRandomPosition();
    nextState.snake = [...nextState.snake, { x: tailX, y: tailY }];
    nextState.score += 1;
    nextState.highScore = Math.max(nextState.highScore, nextState.score);
  }

  for (let index = nextState.snake.length - 1; index > 0; index -= 1) {
    nextState.snake[index] = nextState.snake[index - 1];
  }

  if (nextState.snake.length > 0) {
    nextState.snake[0] = {
      x: nextState.snakeHead.x - nextState.velocityX,
      y: nextState.snakeHead.y - nextState.velocityY,
    };
  }

  return nextState;
};

const resetGameState = (highScore: number): GameState => {
  const state = getInitialGameState(highScore);
  state.showDifficultyModal = true;
  state.showGameOverModal = false;
  return state;
};

export { BOARD_SIZE, canTurn, createRandomPosition, getGameSpeed, getInitialGameState, resetGameState, stepGame };
export type { Difficulty, GameState, Position } from '../types';
