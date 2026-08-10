// Displays the game over modal without changing the original UI.
interface GameOverModalProps {
  score: number;
  onReplay: () => void;
}

const GameOverModal = ({ score, onReplay }: GameOverModalProps) => {
  return (
    <div className="game-over-modal" id="gameOverModal" style={{ display: 'flex' }}>
      <div className="game-over-content">
        <h2>Game Over!</h2>
        <p>
          Your Score: <span id="finalScore">{score}</span>
        </p>
        <button onClick={onReplay}>Replay</button>
      </div>
    </div>
  );
};

export default GameOverModal;
