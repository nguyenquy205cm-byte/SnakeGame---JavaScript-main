import { useEffect, useState } from 'react';
import { getAchievements, getMyAchievements } from '../services/achievementsService';
import { useAuth } from '../context/AuthContext';
import type { Achievement } from '../types/api';

const Achievements = () => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const request = isAuthenticated ? getMyAchievements() : getAchievements();
    request
      .then((data) => {
        if (mounted) setItems(data);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load achievements');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  return (
    <div className="page">
      <h2>Achievements</h2>
      {!isAuthenticated && <p className="page-muted">Log in to see which achievements you have unlocked.</p>}
      {loading && <p className="page-muted">Loading...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Requirement</th>
              <th>Status</th>
              <th>Unlocked At</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5}>No achievements available.</td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.requirement}</td>
                <td>{item.unlockedAt ? 'Unlocked' : 'Locked'}</td>
                <td>{item.unlockedAt ? new Date(item.unlockedAt).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Achievements;
