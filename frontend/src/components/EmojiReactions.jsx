import { useState, useEffect, useRef } from 'react';

const REACTIONS = ['👋', '❤️', '😂', '🎉', '👍', '🔥', '😮', '💜'];

function FloatingEmoji({ emoji, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  const left = 30 + Math.random() * 40;
  return (
    <div ref={ref} style={{
      position: 'fixed', bottom: 120, left: `${left}%`,
      fontSize: 32, pointerEvents: 'none', zIndex: 300,
      animation: 'emoji-float 2s ease-out forwards',
    }}>
      {emoji}
    </div>
  );
}

export default function EmojiReactions({ socket, open, onClose }) {
  const [floats, setFloats] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ emoji }) => {
      const id = Date.now() + Math.random();
      setFloats((prev) => [...prev, { id, emoji }]);
    };
    socket.on('chat:reaction', handler);
    return () => socket.off('chat:reaction', handler);
  }, [socket]);

  function removeFloat(id) {
    setFloats((prev) => prev.filter((f) => f.id !== id));
  }

  function sendReaction(emoji) {
    if (!socket) return;
    socket.emit('chat:reaction', { emoji });
    onClose?.();
  }

  return (
    <>
      {/* Floating emojis */}
      {floats.map((f) => (
        <FloatingEmoji key={f.id} emoji={f.emoji} onDone={() => removeFloat(f.id)} />
      ))}

      {/* Picker popup */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(10,10,22,0.94)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16,
          padding: '12px 16px', display: 'flex', gap: 6, zIndex: 250,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {REACTIONS.map((e) => (
            <button key={e} onClick={() => sendReaction(e)} style={{
              background: 'none', border: 'none', fontSize: 28, cursor: 'pointer',
              padding: '4px 6px', borderRadius: 8, transition: 'all 0.15s',
            }}
            onMouseOver={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.1)'; ev.currentTarget.style.transform = 'scale(1.2)'; }}
            onMouseOut={(ev) => { ev.currentTarget.style.background = 'none'; ev.currentTarget.style.transform = 'scale(1)'; }}
            >
              {e}
            </button>
          ))}
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
            fontSize: 14, padding: '4px 8px',
          }}>x</button>
        </div>
      )}

      {/* CSS animation */}
      <style>{`
        @keyframes emoji-float {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-200px) scale(1.5); }
        }
      `}</style>
    </>
  );
}
