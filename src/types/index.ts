// Shared game-related type definitions.
export type Direction = 'ArrowUp' | 'ArrowDown' | 'ArrowRight' | 'ArrowLeft';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  snakeHead: Position;
  food: Position;
  velocityX: number;
  velocityY: number;
  score: number;
  highScore: number;
  gameOver: boolean;
  gameSpeed: number;
  showDifficultyModal: boolean;
  showGameOverModal: boolean;
}
