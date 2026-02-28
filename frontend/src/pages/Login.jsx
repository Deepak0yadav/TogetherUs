import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      const { token, ...user } = data;
      setAuth(user, token);
      
      const from = location.state?.from || '/home';
      navigate(from);
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, #1a0b3b 0%, #0f0f1a 60%)',
      padding: '80px 16px 24px',
    }}>
      {/* Star field */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            borderRadius: '50%',
            background: '#fff',
            opacity: Math.random() * 0.5 + 0.1,
          }} />
        ))}
      </div>

      <div className="glass-card purple-glow" style={{
        width: '100%',
        maxWidth: 400,
        padding: '40px 36px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span className="pixel-font" style={{
            fontSize: 10,
            background: 'linear-gradient(135deg, #a78bfa, #14b8a6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            TogetherOS
          </span>
          <h2 style={{
            color: '#e8e8f0',
            fontSize: 22,
            fontWeight: 700,
            margin: '12px 0 4px',
          }}>
            Welcome back
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Sign in to enter your shared space
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              className="gather-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email"
            />
          </div>
          <div>
            <label style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              className="gather-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} id="login-submit" style={{ marginTop: 4 }}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <div style={{ position: 'relative', margin: '20px 0', textAlign: 'center' }}>
          <div style={{ height: 1, background: 'var(--gather-border)' }} />
          <span style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--gather-surface)',
            padding: '0 12px',
            color: '#6b7280',
            fontSize: 12,
          }}>or</span>
        </div>

        <a
          href="/api/auth/google"
          className="btn-secondary"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </a>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#6b7280', fontSize: 13 }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 500 }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
