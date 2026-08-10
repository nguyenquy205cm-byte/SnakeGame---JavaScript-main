import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Email và password là bắt buộc.');
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
    }
  };

  return (
    <div className="auth-page">
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Mật khẩu
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
      </form>
      {(formError || error) && <p className="auth-error">{formError || error}</p>}
    </div>
  );
};

export default LoginPage;
