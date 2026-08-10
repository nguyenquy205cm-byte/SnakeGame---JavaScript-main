import { useEffect, useState } from 'react';
import { getTopScores } from '../services/scoreService';
import type { LeaderboardItem } from '../types/api';

const Leaderboard = () => {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getTopScores()
      .then((data) => {
        if (mounted) setItems(data);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page">
      <h2>Leaderboard</h2>
      {loading && <p className="page-muted">Loading...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
              <th>Level</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5}>No scores yet.</td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={`${item.username}-${item.score}-${item.createdAt}`}>
                <td>{item.rank}</td>
                <td>{item.username}</td>
                <td>{item.score}</td>
                <td>{item.level}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;
