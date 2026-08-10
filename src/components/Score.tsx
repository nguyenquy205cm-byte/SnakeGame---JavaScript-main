// Displays the current score and high score.
interface ScoreProps {
  score: number;
  highScore: number;
}

const Score = ({ score, highScore }: ScoreProps) => {
  return (
    <div className="game-details">
      <span className="score">Score: {score}</span>
      <span className="highscore">High Score: {highScore}</span>
    </div>
  );
};

export default Score;
