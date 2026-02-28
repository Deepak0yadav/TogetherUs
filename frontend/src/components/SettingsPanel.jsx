import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

const PALETTES = {
  amber:  { label: 'Classic',  shirt: '#3b82f6', hair: '#6b4226' },
  rose:   { label: 'Rose',     shirt: '#f472b6', hair: '#b45c82' },
  teal:   { label: 'Teal',     shirt: '#14b8a6', hair: '#2d6070' },
  violet: { label: 'Violet',   shirt: '#8b5cf6', hair: '#5b3b9e' },
  sage:   { label: 'Sage',     shirt: '#4ade80', hair: '#3d6b3d' },
  coral:  { label: 'Coral',    shirt: '#f97316', hair: '#8b4040' },
};

export default function SettingsPanel({ open, onClose, character, onCharacterChange }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [gender, setGender] = useState(character?.gender || 'male');
  const [palette, setPalette] = useState(character?.palette || 'amber');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const c = { gender, palette };
    localStorage.setItem('togetheros-character', JSON.stringify(c));
    onCharacterChange?.(c);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleLogout() {
    onClose?.();
    logout();
  }

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgba(10,10,22,0.96)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, width: 400, padding: '28px 32px',
        boxShadow: '0 16px 64px rgba(0,0,0,0.7)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ color: '#e8e8f0', fontWeight: 700, fontSize: 18 }}>Settings</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 18,
          }}>x</button>
        </div>

        {/* Account */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: 1, display: 'block', marginBottom: 8 }}>ACCOUNT</label>
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ color: '#e8e8f0', fontSize: 14, fontWeight: 500 }}>{user?.name || user?.email?.split('@')[0]}</div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>{user?.email}</div>
            </div>
            <button onClick={handleLogout} style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '6px 14px', color: '#f87171', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
            }}>Logout</button>
          </div>
        </div>

        {/* Character */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: 1, display: 'block', marginBottom: 10 }}>CHARACTER</label>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            {[['male', 'Guy'], ['female', 'Girl']].map(([g, label]) => (
              <button key={g} onClick={() => setGender(g)} style={{
                flex: 1, background: gender === g ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)',
                border: `2px solid ${gender === g ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 10, padding: '8px 0', color: gender === g ? '#e8e8f0' : '#9ca3af',
                fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {Object.entries(PALETTES).map(([key, pal]) => (
              <button key={key} onClick={() => setPalette(key)} style={{
                width: 36, height: 36, borderRadius: 10, cursor: 'pointer',
                background: `linear-gradient(135deg, ${pal.hair}, ${pal.shirt})`,
                border: `3px solid ${palette === key ? '#fff' : 'transparent'}`,
                transform: palette === key ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.2s',
              }} title={pal.label} />
            ))}
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} style={{
          width: '100%', background: saved ? '#22c55e' : '#7c3aed',
          border: 'none', borderRadius: 12, padding: '12px 0', color: '#fff',
          fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
        }}>
          {saved ? 'Saved! Reload to see changes' : 'Save Character'}
        </button>
      </div>
    </div>
  );
}
