import { Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

const GAME_ROUTES = ['/home'];

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const isGameRoute = GAME_ROUTES.some((r) => location.pathname.startsWith(r));

  // In game view: render outlet directly (no chrome, handled by Apartment.jsx)
  if (isGameRoute) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <Outlet />
      </div>
    );
  }

  return (
    <div className="page-scroll" style={{ background: 'var(--gather-bg)' }}>
      {/* Minimal top strip on auth/landing pages */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span className="pixel-font" style={{
            fontSize: '11px',
            background: 'linear-gradient(135deg, #a78bfa, #14b8a6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '1px',
          }}>
            TogetherOS
          </span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              <Link to="/home" style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}>
                Your Space
              </Link>
              <button
                onClick={() => useAuthStore.getState().logout()}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#9ca3af',
                  padding: '6px 14px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}>
                Log in
              </Link>
              <Link
                to="/register"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
