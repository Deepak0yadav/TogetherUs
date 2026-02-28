import { useState, useRef, useEffect } from 'react';

const PALETTES = {
  amber:  { label: 'Classic',  shirt: '#3b82f6', hair: '#6b4226' },
  rose:   { label: 'Rose',     shirt: '#f472b6', hair: '#b45c82' },
  teal:   { label: 'Teal',     shirt: '#14b8a6', hair: '#2d6070' },
  violet: { label: 'Violet',   shirt: '#8b5cf6', hair: '#5b3b9e' },
  sage:   { label: 'Sage',     shirt: '#4ade80', hair: '#3d6b3d' },
  coral:  { label: 'Coral',    shirt: '#f97316', hair: '#8b4040' },
};

const SKIN_LIGHT = '#f5c5a3';
const SKIN_DARK_ACCENT = '#e8a882';

function MiniAvatar({ gender, palette, size = 120 }) {
  const pal = PALETTES[palette] || PALETTES.amber;
  const isMale = gender === 'male';
  const s = size;
  const head = s * 0.35;
  const bodyW = s * 0.45;
  const bodyH = s * 0.25;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {/* Hair */}
      <ellipse cx={s/2} cy={s*0.22} rx={head*0.62} ry={head*0.55}
        fill={pal.hair} />
      {isMale ? null : (
        <>
          <ellipse cx={s*0.3} cy={s*0.35} rx={head*0.15} ry={head*0.35} fill={pal.hair} />
          <ellipse cx={s*0.7} cy={s*0.35} rx={head*0.15} ry={head*0.35} fill={pal.hair} />
        </>
      )}
      {/* Head */}
      <ellipse cx={s/2} cy={s*0.28} rx={head*0.48} ry={head*0.45} fill={SKIN_LIGHT} />
      {/* Eyes */}
      <circle cx={s*0.42} cy={s*0.26} r={2.5} fill="#2c1810" />
      <circle cx={s*0.58} cy={s*0.26} r={2.5} fill="#2c1810" />
      {/* Blush (female) */}
      {!isMale && <>
        <circle cx={s*0.38} cy={s*0.3} r={3} fill="#f0a0a0" opacity={0.5} />
        <circle cx={s*0.62} cy={s*0.3} r={3} fill="#f0a0a0" opacity={0.5} />
      </>}
      {/* Mouth */}
      <ellipse cx={s/2} cy={s*0.33} rx={3} ry={1.5} fill={SKIN_DARK_ACCENT} />
      {/* Body */}
      <rect x={s/2 - bodyW/2} y={s*0.42} width={bodyW} height={bodyH} rx={6}
        fill={pal.shirt} />
      {/* Arms */}
      <rect x={s/2 - bodyW/2 - 8} y={s*0.44} width={10} height={bodyH*0.7} rx={4}
        fill={SKIN_LIGHT} />
      <rect x={s/2 + bodyW/2 - 2} y={s*0.44} width={10} height={bodyH*0.7} rx={4}
        fill={SKIN_LIGHT} />
      {/* Pants */}
      <rect x={s/2 - bodyW*0.4} y={s*0.66} width={bodyW*0.35} height={s*0.18} rx={4}
        fill="#1e3a5f" />
      <rect x={s/2 + bodyW*0.05} y={s*0.66} width={bodyW*0.35} height={s*0.18} rx={4}
        fill="#1e3a5f" />
      {/* Shoes */}
      <rect x={s/2 - bodyW*0.42} y={s*0.83} width={bodyW*0.38} height={s*0.06} rx={3}
        fill="#1c1917" />
      <rect x={s/2 + bodyW*0.04} y={s*0.83} width={bodyW*0.38} height={s*0.06} rx={3}
        fill="#1c1917" />
    </svg>
  );
}

export default function CharacterSelect({ onSelect }) {
  const [gender, setGender] = useState('male');
  const [palette, setPalette] = useState('amber');

  function handleConfirm() {
    onSelect({ gender, palette });
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'radial-gradient(ellipse at 50% 30%, #1a0b3b 0%, #0f0f1a 60%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div className="glass-card purple-glow" style={{
        maxWidth: 500, width: '100%', padding: '40px 36px', textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <h2 className="pixel-font" style={{
          fontSize: 11, marginBottom: 8, lineHeight: 2,
          background: 'linear-gradient(135deg, #a78bfa, #14b8a6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Choose Your Character</h2>
        <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 28 }}>
          Pick your look before entering the apartment
        </p>

        {/* Preview */}
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 28,
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '20px 0',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <MiniAvatar gender={gender} palette={palette} size={140} />
        </div>

        {/* Gender Toggle */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: 1, display: 'block', marginBottom: 10 }}>GENDER</span>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {[['male', 'Guy'], ['female', 'Girl']].map(([g, label]) => (
              <button key={g} onClick={() => setGender(g)} style={{
                background: gender === g ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)',
                border: `2px solid ${gender === g ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, padding: '10px 32px', color: gender === g ? '#e8e8f0' : '#9ca3af',
                fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Palette */}
        <div style={{ marginBottom: 28 }}>
          <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 600, letterSpacing: 1, display: 'block', marginBottom: 10 }}>STYLE</span>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {Object.entries(PALETTES).map(([key, pal]) => (
              <button key={key} onClick={() => setPalette(key)} style={{
                width: 44, height: 44, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                background: `linear-gradient(135deg, ${pal.hair}, ${pal.shirt})`,
                border: `3px solid ${palette === key ? '#fff' : 'transparent'}`,
                boxShadow: palette === key ? '0 0 12px rgba(255,255,255,0.3)' : 'none',
                transform: palette === key ? 'scale(1.15)' : 'scale(1)',
              }} title={pal.label} />
            ))}
          </div>
        </div>

        {/* Confirm */}
        <button onClick={handleConfirm} style={{
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          color: '#fff', border: 'none', borderRadius: 12, padding: '14px 48px',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(124,58,237,0.4)', transition: 'all 0.2s', width: '100%',
        }}>
          Enter Apartment
        </button>
      </div>
    </div>
  );
}
