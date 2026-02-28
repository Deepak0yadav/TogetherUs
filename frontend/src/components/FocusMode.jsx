import { useEffect, useState, useRef } from 'react';

const DEFAULT_DURATION = 25 * 60;
const PRESETS = [
  { label: '15 min', value: 15 * 60 },
  { label: '25 min', value: 25 * 60 },
  { label: '45 min', value: 45 * 60 },
  { label: '60 min', value: 60 * 60 },
];

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
};

const panelStyle = {
  background: '#16162a', borderRadius: 16, padding: 32, width: 380, textAlign: 'center',
  boxShadow: '0 12px 60px rgba(0,0,0,0.7)', border: '1px solid rgba(20,184,166,0.3)',
};

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function TimerRing({ remaining, total }) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? remaining / total : 1;
  const offset = circumference * (1 - progress);

  return (
    <svg width={220} height={220} style={{ margin: '16px auto', display: 'block' }}>
      <circle cx={110} cy={110} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
      <circle
        cx={110} cy={110} r={radius} fill="none"
        stroke="url(#focusGrad)" strokeWidth={8} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform="rotate(-90 110 110)"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
      <defs>
        <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <text x={110} y={105} textAnchor="middle" fill="#e8e8f0" fontSize={36} fontWeight={700} fontFamily="monospace">
        {formatTime(remaining)}
      </text>
      <text x={110} y={130} textAnchor="middle" fill="#6b7280" fontSize={12}>
        {total > 0 ? `of ${Math.round(total / 60)} min` : 'ready'}
      </text>
    </svg>
  );
}

export default function FocusMode({ socket, roomId, onClose }) {
  const [remaining, setRemaining] = useState(DEFAULT_DURATION);
  const [total, setTotal] = useState(DEFAULT_DURATION);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(DEFAULT_DURATION);
  const completedTimer = useRef(null);

  useEffect(() => {
    if (!socket) return;
    socket.emit('focus:sync', null, (state) => {
      if (state && state.remaining > 0) {
        setRemaining(state.remaining);
        setTotal(state.total);
        setRunning(state.running);
        setStarted(true);
      }
    });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const onStart = ({ remaining: r, total: t }) => {
      setRemaining(r); setTotal(t); setRunning(true); setStarted(true); setCompleted(false);
    };
    const onTick = ({ remaining: r }) => setRemaining(r);
    const onPause = ({ remaining: r }) => { setRemaining(r); setRunning(false); };
    const onResume = ({ remaining: r }) => { setRemaining(r); setRunning(true); };
    const onCancel = () => { setRunning(false); setStarted(false); setRemaining(selectedDuration); setTotal(selectedDuration); };
    const onComplete = () => {
      setRunning(false); setStarted(false); setRemaining(0); setCompleted(true);
      completedTimer.current = setTimeout(() => setCompleted(false), 5000);
    };

    socket.on('focus:start', onStart);
    socket.on('focus:tick', onTick);
    socket.on('focus:pause', onPause);
    socket.on('focus:resume', onResume);
    socket.on('focus:cancel', onCancel);
    socket.on('focus:complete', onComplete);
    return () => {
      socket.off('focus:start', onStart);
      socket.off('focus:tick', onTick);
      socket.off('focus:pause', onPause);
      socket.off('focus:resume', onResume);
      socket.off('focus:cancel', onCancel);
      socket.off('focus:complete', onComplete);
      if (completedTimer.current) clearTimeout(completedTimer.current);
    };
  }, [socket, selectedDuration]);

  function handleStart() {
    socket?.emit('focus:start', { duration: selectedDuration });
  }
  function handlePause() { socket?.emit('focus:pause'); }
  function handleResume() { socket?.emit('focus:resume'); }
  function handleCancel() { socket?.emit('focus:cancel'); }

  const btnBase = {
    border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600,
    cursor: 'pointer', fontSize: 14, transition: 'all 0.2s',
  };

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ color: '#e8e8f0', fontSize: 18, fontWeight: 700, margin: 0 }}>
            Focus Together
          </h3>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', color: '#9ca3af',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16,
          }}>✕</button>
        </div>

        {completed && (
          <div style={{
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)',
            color: '#4ade80', borderRadius: 10, padding: '12px 16px', fontSize: 14,
            fontWeight: 600, marginBottom: 16, animation: 'pulse 1.5s ease infinite',
          }}>
            Session complete! Great work together.
          </div>
        )}

        <TimerRing remaining={started ? remaining : selectedDuration} total={started ? total : selectedDuration} />

        {!started && !completed && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => { setSelectedDuration(p.value); setRemaining(p.value); setTotal(p.value); }}
                style={{
                  ...btnBase,
                  padding: '6px 14px',
                  fontSize: 12,
                  background: selectedDuration === p.value ? 'rgba(20,184,166,0.25)' : 'rgba(255,255,255,0.06)',
                  color: selectedDuration === p.value ? '#14b8a6' : '#9ca3af',
                  border: `1px solid ${selectedDuration === p.value ? 'rgba(20,184,166,0.4)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >{p.label}</button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {!started && !completed && (
            <button onClick={handleStart} style={{ ...btnBase, background: '#14b8a6', color: '#fff' }}>
              Start Focus
            </button>
          )}
          {started && running && (
            <button onClick={handlePause} style={{ ...btnBase, background: 'rgba(255,255,255,0.1)', color: '#e8e8f0' }}>
              Pause
            </button>
          )}
          {started && !running && (
            <button onClick={handleResume} style={{ ...btnBase, background: '#14b8a6', color: '#fff' }}>
              Resume
            </button>
          )}
          {started && (
            <button onClick={handleCancel} style={{ ...btnBase, background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
              Cancel
            </button>
          )}
        </div>

        <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }`}</style>
      </div>
    </div>
  );
}
