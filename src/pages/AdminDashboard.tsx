import { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import type { User } from '../types/api';

interface AuditLogEntry {
  id: number;
  action: string;
  entity: string | null;
  entityId: number | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: number; username: string; email: string } | null;
}

interface AdminScore {
  id: number;
  userId: number;
  score: number;
  level: number;
  createdAt: string;
  user: { id: number; username: string; email: string };
}

interface AdminAchievement {
  id: number;
  name: string;
  description: string;
  requirement: number;
  createdAt: string;
  unlockedCount: number;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [scores, setScores] = useState<AdminScore[]>([]);
  const [achievements, setAchievements] = useState<AdminAchievement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setError(null);
      const [userResponse, scoreResponse, achievementResponse, logResponse] = await Promise.all([
        apiClient.get<{ status: string; data: User[] }>('/admin/users'),
        apiClient.get<{ status: string; data: AdminScore[] }>('/admin/scores'),
        apiClient.get<{ status: string; data: AdminAchievement[] }>('/admin/achievements'),
        apiClient.get<{ status: string; data: AuditLogEntry[] }>('/admin/audit-logs'),
      ]);
      setUsers(userResponse.data.data);
      setScores(scoreResponse.data.data);
      setAchievements(achievementResponse.data.data);
      setAuditLogs(logResponse.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu admin');
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const toggleUserActive = async (user: User) => {
    try {
      await apiClient.patch(`/admin/users/${user.id}`, { isActive: !user.isActive });
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật user');
    }
  };

  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      {error && <p className="auth-error">{error}</p>}

      <section>
        <h3>Users</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button type="button" className="small-button" onClick={() => toggleUserActive(user)}>
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Scores</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Score</th>
              <th>Level</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.user.username}</td>
                <td>{item.score}</td>
                <td>{item.level}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Achievements</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Requirement</th>
              <th>Unlocked By</th>
            </tr>
          </thead>
          <tbody>
            {achievements.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.requirement}</td>
                <td>{item.unlockedCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Audit Logs</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>User</th>
              <th>IP</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.action}</td>
                <td>{log.entity || 'N/A'}</td>
                <td>{log.entityId ?? 'N/A'}</td>
                <td>{log.user ? `${log.user.username} (${log.user.email})` : 'System'}</td>
                <td>{log.ipAddress || 'N/A'}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;
