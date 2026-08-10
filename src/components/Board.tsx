// Renders the playable grid and all snake/game elements.
import type { Position } from '../types';
import Food from './Food';
import Snake from './Snake';

interface BoardProps {
  food: Position;
  snakeHead: Position;
  snakeBody: Position[];
}

const Board = ({ food, snakeHead, snakeBody }: BoardProps) => {
  return (
    <div className="play-board">
      <Food position={food} />
      <Snake head={snakeHead} body={snakeBody} />
    </div>
  );
};

export default Board;
