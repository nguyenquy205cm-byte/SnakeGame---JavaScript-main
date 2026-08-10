// Renders the snake head and body segments.
import type { Position } from '../types';

interface SnakeProps {
  head: Position;
  body: Position[];
}

const Snake = ({ head, body }: SnakeProps) => {
  return (
    <>
      <div className="head" style={{ gridArea: `${head.y} / ${head.x}` }} />
      {body.map((segment, index) => (
        <div key={`${segment.x}-${segment.y}-${index}`} className="body" style={{ gridArea: `${segment.y} / ${segment.x}` }} />
      ))}
    </>
  );
};

export default Snake;
