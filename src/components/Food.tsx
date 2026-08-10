// Renders the food cell on the board.
import type { Position } from '../types';

interface FoodProps {
  position: Position;
}

const Food = ({ position }: FoodProps) => {
  return <div className="food" style={{ gridArea: `${position.y} / ${position.x}` }} />;
};

export default Food;
