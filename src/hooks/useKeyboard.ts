// Handles keyboard input for snake direction changes.
import { useEffect } from 'react';
import type { Direction } from '../types';

const useKeyboard = (onDirectionChange: (direction: Direction) => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        onDirectionChange(event.key as Direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDirectionChange]);
};

export default useKeyboard;
