import { useEffect, useState } from 'react';
import { getScoreHistory } from '../services/scoreService';
import type { Score } from '../types/api';

const PAGE_SIZE = 10;

const ScoreHistory = () => {
  const [items, setItems] = useState<Score[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getScoreHistory(page, PAGE_SIZE)
      .then((result) => {
        if (!mounted) return;
        setItems(result.data);
        setTotal(result.meta.total);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load score history');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="page">
      <h2>Score History</h2>
      {loading && <p className="page-muted">Loading...</p>}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Score</th>
                <th>Level</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4}>No scores recorded yet. Play a game!</td>
                </tr>
              )}
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td>{item.score}</td>
                  <td>{item.level}</td>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ScoreHistory;
