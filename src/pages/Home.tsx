// Main page component that composes the game UI.
import { useState } from 'react';
import Board from '../components/Board';
import GameOverModal from '../components/GameOverModal';
import Score from '../components/Score';
import useKeyboard from '../hooks/useKeyboard';
import useSnake from '../hooks/useSnake';
import { getHealth } from '../services/api';
import type { Difficulty } from '../types';

const Home = () => {
  const { gameState, startGame, restartGame, changeDirection } = useSnake();
  const [healthResult, setHealthResult] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useKeyboard(changeDirection);

  const handleSelectDifficulty = (difficulty: Difficulty) => {
    startGame(difficulty);
  };

  const handleTestApi = async () => {
    try {
      setHealthError(null);
      const response = await getHealth();
      setHealthResult(`Status: ${response.status}, Uptime: ${response.uptime.toFixed(2)}s`);
    } catch (error) {
      setHealthResult(null);
      if (error instanceof Error) {
        setHealthError(error.message);
      } else {
        setHealthError('Unknown API error');
      }
    }
  };

  return (
    <div className="wrapper">
      <div className="api-test-panel">
        <button type="button" onClick={handleTestApi}>
          Test API
        </button>
        {healthResult && <p className="api-result">{healthResult}</p>}
        {healthError && <p className="api-error">API Error: {healthError}</p>}
      </div>

      <Score score={gameState.score} highScore={gameState.highScore} />
      <Board food={gameState.food} snakeHead={gameState.snakeHead} snakeBody={gameState.snake} />

      {gameState.showGameOverModal && <GameOverModal score={gameState.score} onReplay={restartGame} />}

      {gameState.showDifficultyModal && (
        <div className="difficulty-modal" id="difficultyModal" style={{ display: 'flex' }}>
          <div className="difficulty-content">
            <h2>Select Difficulty</h2>
            <button onClick={() => handleSelectDifficulty('easy')}>Easy</button>
            <button onClick={() => handleSelectDifficulty('medium')}>Medium</button>
            <button onClick={() => handleSelectDifficulty('hard')}>Hard</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
