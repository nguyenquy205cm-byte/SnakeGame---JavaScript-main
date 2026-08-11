// Displays the game over modal without changing the original UI.
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createScore } from '../services/scoreService';

interface GameOverModalProps {
  score: number;
  onReplay: () => void;
}

const GameOverModal = ({ score, onReplay }: GameOverModalProps) => {
  const { currentUser } = useAuth();
  const [playerName, setPlayerName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGuest = !currentUser;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await createScore({ score, playerName: playerName.trim() || 'Guest' });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save score');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="game-over-modal" id="gameOverModal" style={{ display: 'flex' }}>
      <div className="game-over-content">
        <h2>Game Over!</h2>
        <p>
          Your Score: <span id="finalScore">{score}</span>
        </p>
        {isGuest && !saved && (
          <div className="guest-name-input">
            <input
              type="text"
              maxLength={30}
              value={playerName}
              placeholder="Enter your name (Guest)"
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <button type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save score'}
            </button>
          </div>
        )}
        {isGuest && saved && <p className="save-success">Score saved!</p>}
        {error && <p className="auth-error">{error}</p>}
        <button onClick={onReplay}>Replay</button>
      </div>
    </div>
  );
};

export default GameOverModal;
