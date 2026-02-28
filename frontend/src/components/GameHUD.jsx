import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

function HudButton({ icon, label, active, danger, onClick, id }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`hud-btn${active ? ' active' : ''}${danger ? ' danger' : ''}`}
      title={label}
      aria-label={label}
    >
      <span className="tooltip">{label}</span>
      <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
    </button>
  );
}

export default function GameHUD({ spaceCode, roomName, onCopyInvite, onChangeSpace, micOn, camOn, onToggleMic, onToggleCam }) {
  const user = useAuthStore((s) => s.user);
  const [chatOpen, setChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }

  function handleSwitchSubmit() {
    if (joinCodeInput.trim() && onChangeSpace) {
      onChangeSpace(joinCodeInput.trim());
      setShowSwitchModal(false);
      setJoinCodeInput('');
    }
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'You';

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 48,
        background: 'rgba(10, 10, 20, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 100,
      }}>
        {/* Left: room name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 6px #22c55e',
            flexShrink: 0,
          }} />
          <span className="pixel-font" style={{
            fontSize: 8,
            color: '#c4c4d4',
            letterSpacing: '1px',
          }}>
            {roomName || 'Your Space'}
          </span>
        </div>

        {/* Right: Space Code */}
        {spaceCode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 500 }}>Space Code:</span>
            <input
              readOnly
              value={spaceCode}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#e8e8f0',
                fontSize: 12,
                fontWeight: 600,
                padding: '5px 12px',
                width: 140,
                textAlign: 'center',
                outline: 'none',
                fontFamily: 'Inter, monospace',
                letterSpacing: '1px'
              }}
            />
            <button
              onClick={onCopyInvite}
              id="copy-invite-btn"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '5px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Copy Code
            </button>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            <button
              onClick={() => setShowSwitchModal(true)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: '5px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              Switch Space
            </button>
          </div>
        )}
      </div>

      {/* ── Switch Space Modal ───────────────────────────────── */}
      {showSwitchModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-card purple-glow" style={{ width: 380, padding: 30, textAlign: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 10, fontWeight: 600 }}>Switch Space</h3>
            <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>Enter the Space Code for the room you want to join.</p>
            <input 
              autoFocus
              type="text" 
              placeholder="e.g. 74424b7f7d37"
              value={joinCodeInput}
              onChange={e => setJoinCodeInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSwitchSubmit()}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#e8e8f0',
                fontSize: 14,
                outline: 'none',
                fontFamily: 'Inter, monospace',
                textAlign: 'center',
                marginBottom: 20
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={() => setShowSwitchModal(false)}
                style={{
                  flex: 1, background: 'transparent', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '10px 0', cursor: 'pointer', fontWeight: 500
                }}
              >Cancel</button>
              <button 
                onClick={handleSwitchSubmit}
                disabled={!joinCodeInput.trim()}
                style={{
                  flex: 1, background: joinCodeInput.trim() ? '#7c3aed' : 'rgba(124,58,237,0.4)', 
                  color: '#fff', border: 'none', borderRadius: 10, padding: '10px 0', 
                  cursor: joinCodeInput.trim() ? 'pointer' : 'not-allowed', fontWeight: 600
                }}
              >Join</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom HUD toolbar ──────────────────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(10, 10, 22, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 18,
        padding: '10px 16px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15)',
      }}>
        {/* Mic */}
        <HudButton
          id="hud-mic"
          icon={micOn ? '🎤' : '🔇'}
          label={micOn ? 'Mute mic' : 'Unmute mic'}
          active={micOn}
          danger={!micOn}
          onClick={onToggleMic}
        />

        {/* Cam */}
        <HudButton
          id="hud-cam"
          icon={camOn ? '📷' : '🚫'}
          label={camOn ? 'Turn off camera' : 'Turn on camera'}
          active={camOn}
          danger={!camOn}
          onClick={onToggleCam}
        />

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

        {/* Chat */}
        <HudButton
          id="hud-chat"
          icon="💬"
          label="Chat"
          active={chatOpen}
          onClick={() => setChatOpen((v) => !v)}
        />

        {/* Emoji */}
        <HudButton id="hud-emoji" icon="👋" label="React" />

        {/* Screen share */}
        <HudButton id="hud-share" icon="🖥️" label="Share screen" />

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

        {/* Fullscreen */}
        <HudButton
          id="hud-fullscreen"
          icon={isFullscreen ? '⬜' : '⛶'}
          label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          onClick={toggleFullscreen}
        />

        {/* Settings */}
        <HudButton id="hud-settings" icon="⚙️" label="Settings" />

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

        {/* User badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(124,58,237,0.2)',
          border: '1px solid rgba(124,58,237,0.4)',
          borderRadius: 12,
          padding: '6px 14px',
          cursor: 'default',
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #14b8a6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}>
            {displayName[0]?.toUpperCase()}
          </div>
          <span style={{ color: '#e8e8f0', fontSize: 13, fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </span>
          <button
            onClick={() => useAuthStore.getState().logout()}
            title="Leave & logout"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: 14,
              padding: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}
