import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getMyCouple } from '../api/client';

// Emoji pixel sprites for the walking animation
const WALKERS = ['🧑‍💻', '👩‍💼', '🧙', '👾', '🧝', '🦸'];

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const starsRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    getMyCouple()
      .then((data) => { if (data.couple) navigate('/home'); })
      .catch(() => {});
  }, [user, navigate]);

  // Generate random stars
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 4,
    duration: 2 + Math.random() * 3,
  }));

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(ellipse at 50% 30%, #1a0b3b 0%, #0f0f1a 60%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Star field */}
      <div ref={starsRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {stars.map((s) => (
          <div key={s.id} style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: '#fff',
            animation: `star-twinkle ${s.duration}s ${s.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* Floating pixel grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      {/* Purple ambient glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 300,
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Main content */}
      <div style={{ textAlign: 'center', zIndex: 2, padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ marginBottom: 24, animation: 'float-up 4s ease-in-out infinite' }}>
          <h1 className="pixel-font" style={{
            fontSize: 'clamp(14px, 3vw, 22px)',
            background: 'linear-gradient(135deg, #a78bfa 0%, #14b8a6 50%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.8,
            letterSpacing: '2px',
            marginBottom: 8,
          }}>
            TogetherOS
          </h1>
          <div style={{
            width: 80,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)',
            margin: '8px auto 0',
          }} />
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: 18,
          color: '#a0a0c0',
          marginBottom: 48,
          fontWeight: 300,
          letterSpacing: '0.3px',
          maxWidth: 440,
          margin: '0 auto 48px',
          lineHeight: 1.7,
        }}>
          A persistent virtual space for long-distance couples.<br />
          Move together. Connect in real time.
        </p>

        {/* Walking avatars strip */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginBottom: 48,
          fontSize: 32,
          filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.5))',
        }}>
          {WALKERS.map((emoji, i) => (
            <span key={i} style={{
              display: 'inline-block',
              animation: `float-up ${2.5 + i * 0.3}s ${i * 0.2}s ease-in-out infinite`,
            }}>
              {emoji}
            </span>
          ))}
        </div>

        {/* CTAs */}
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Link
              to="/home"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#fff',
                padding: '14px 40px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
                boxShadow: '0 6px 24px rgba(124,58,237,0.5)',
                transition: 'all 0.2s',
                letterSpacing: '0.3px',
              }}
            >
              ✨ Enter your space
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#fff',
                padding: '14px 36px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
                boxShadow: '0 6px 24px rgba(124,58,237,0.5)',
                letterSpacing: '0.3px',
              }}
            >
              ✨ Get Started Free
            </Link>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.06)',
                color: '#c4c4d4',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '14px 36px',
                borderRadius: 12,
                fontWeight: 500,
                fontSize: 15,
                textDecoration: 'none',
                letterSpacing: '0.3px',
              }}
            >
              Log in
            </Link>
          </div>
        )}

        {/* Feature pills */}
        <div style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          marginTop: 40,
          flexWrap: 'wrap',
        }}>
          {['🎮 Pixel world', '💬 Real-time chat', '🏠 Shared space', '🎵 Proximity audio'].map((f) => (
            <span key={f} style={{
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.25)',
              color: '#a78bfa',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
            }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom walking pixel characters animation */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        height: 40,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontSize: 28,
          animation: 'pixel-walk 18s linear infinite',
          display: 'inline-block',
          whiteSpace: 'nowrap',
        }}>
          🧑‍💻
        </div>
        <div style={{
          fontSize: 28,
          animation: 'pixel-walk 24s 3s linear infinite',
          display: 'inline-block',
          whiteSpace: 'nowrap',
          position: 'absolute',
          left: 0,
          bottom: 0,
        }}>
          👩‍💼
        </div>
      </div>
    </div>
  );
}
