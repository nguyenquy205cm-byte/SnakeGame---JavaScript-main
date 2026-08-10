import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-link navbar-brand-text">
          Snake Cloud
        </Link>
      </div>
      <div className="navbar-links">
        {loading ? (
          <span className="navbar-muted">Loading...</span>
        ) : !isAuthenticated ? (
          <>
            <Link to="/leaderboard" className="navbar-link">
              Leaderboard
            </Link>
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/register" className="navbar-link">
              Register
            </Link>
          </>
        ) : (
          <>
            <span className="navbar-user">
              {currentUser?.username} ({currentUser?.role})
            </span>
            <Link to="/" className="navbar-link">
              Play Game
            </Link>
            <Link to="/leaderboard" className="navbar-link">
              Leaderboard
            </Link>
            <Link to="/scores/history" className="navbar-link">
              Score History
            </Link>
            <Link to="/achievements" className="navbar-link">
              Achievements
            </Link>
            {currentUser?.role === 'ADMIN' && (
              <Link to="/admin" className="navbar-link">
                Admin Dashboard
              </Link>
            )}
            <button type="button" className="navbar-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
