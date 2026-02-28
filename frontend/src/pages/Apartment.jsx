import React, { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react';
import { getMyCouple, getMyRoom, createCouple, joinCouple } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { io } from 'socket.io-client';
import Game from '../game/Game';
import GameHUD from '../components/GameHUD';
import CharacterSelect from '../components/CharacterSelect';

const WatchMode = lazy(() => import('../components/WatchMode'));
const FocusMode = lazy(() => import('../components/FocusMode'));
const ProximityVideo = lazy(() => import('../components/ProximityVideo'));

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

const ZONE_MODE_MAP = { lounge: 'watch', office: 'focus', garden: 'video' };

class OverlayErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error('[overlay crash]', err); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed', bottom: 100, right: 20, zIndex: 500,
          background: '#16162a', borderRadius: 16, padding: 20,
          border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13,
        }}>
          Overlay crashed.{' '}
          <button onClick={() => { this.setState({ hasError: false }); this.props.onClose?.(); }}
            style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', textDecoration: 'underline' }}>
            Close
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Apartment() {
  const [couple, setCouple] = useState(null);
  const [room, setRoom] = useState(null);
  const [spaceCode, setSpaceCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [character, setCharacter] = useState(() => {
    try { return JSON.parse(localStorage.getItem('togetheros-character')); } catch { return null; }
  });
  const [socket, setSocket] = useState(null);
  const [activeZone, setActiveZone] = useState(null);
  const mediaStreamRef = useRef(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!room?.id || !token) return;
    const sock = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    sock.on('zone:state', (data) => {
      if (ZONE_MODE_MAP[data.zone]) {
        setActiveZone(data.zone);
      }
    });
    sock.on('zone:left', () => {
      setActiveZone(null);
    });
    sock._zoneCallback = (zone) => {
      if (zone && ZONE_MODE_MAP[zone]) setActiveZone(zone);
      else setActiveZone(null);
    };

    setSocket(sock);

    return () => {
      sock.emit('room:leave');
      sock.disconnect();
      setSocket(null);
      setActiveZone(null);
    };
  }, [room?.id, token]);

  const closeOverlay = useCallback(() => setActiveZone(null), []);

  const setMediaStream = useCallback((stream) => { mediaStreamRef.current = stream; }, []);

  const toggleMic = useCallback(() => {
    const track = mediaStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
    else setMicOn((v) => !v);
  }, []);

  const toggleCam = useCallback(() => {
    const track = mediaStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); }
    else setCamOn((v) => !v);
  }, []);

  async function loadSpaceData() {
    setLoading(true);
    try {
      const data = await getMyCouple();
      setCouple(data.couple);
      setRoom(data.room);
      if (data.couple?.invite_code) {
        setSpaceCode(data.couple.invite_code);
      }
    } catch {
      setCouple(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSpaceData();
  }, []);

  async function handleCreateCouple() {
    setCreating(true);
    setError(null);
    try {
      const data = await createCouple();
      setSpaceCode(data.invite_code);
      setCouple({ id: data.couple_id, invite_code: data.invite_code });
      setRoom({ id: data.room_id, layout_json: { furniture: [], theme: 'night' } });
    } catch (e) {
      console.error(e);
      const msg = e?.message || 'Create failed';
      setError(msg === 'Not authenticated' ? 'Please log out and log in again, then try creating.' : msg);
    } finally {
      setCreating(false);
    }
  }
  
  async function handleJoinSpace() {
    if (!joinCodeInput.trim()) return;
    setJoining(true);
    setError(null);
    try {
      await joinCouple(joinCodeInput.trim());
      await loadSpaceData();
    } catch (e) {
      setError(e?.message || 'Failed to join space. Check the code and try again.');
    } finally {
      setJoining(false);
    }
  }

  function copyInvite() {
    navigator.clipboard.writeText(spaceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Loading screen ─────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#0f0f1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '3px solid rgba(124,58,237,0.3)',
          borderTopColor: '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }} />
        <span className="pixel-font" style={{ fontSize: 8, color: '#6b7280', letterSpacing: '2px' }}>
          Loading space…
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── No couple yet: onboarding screen ───────────────────────
  if (!room) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at 50% 30%, #1a0b3b 0%, #0f0f1a 60%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }} />
        <div className="glass-card purple-glow" style={{ maxWidth: 440, width: '100%', padding: '48px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏠</div>
          <h2 className="pixel-font" style={{
            fontSize: 11,
            background: 'linear-gradient(135deg, #a78bfa, #14b8a6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 16,
            lineHeight: 2,
          }}>
            Join or Create a Space
          </h2>
          <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
            Create a new shared world, or enter your partner's Space Code to join theirs.
          </p>
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <button
              onClick={handleCreateCouple}
              disabled={creating || joining}
              id="create-couple-btn"
              style={{
                background: creating ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 32px',
                fontSize: 15,
                fontWeight: 700,
                cursor: (creating || joining) ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 24px rgba(124,58,237,0.4)',
                transition: 'all 0.2s',
                width: '100%',
              }}
            >
              {creating ? '✨ Creating…' : '✨ Create new space'}
            </button>

            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', position: 'absolute', top: '50%', left: 0, right: 0, zIndex: 0 }} />
              <span style={{ position: 'relative', zIndex: 1, background: 'var(--gather-surface)', padding: '0 12px', color: '#6b7280', fontSize: 12 }}>OR</span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <input 
                type="text" 
                placeholder="Enter Space Code..."
                value={joinCodeInput}
                onChange={e => setJoinCodeInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  padding: '0 16px',
                  color: '#e8e8f0',
                  fontSize: 14,
                  outline: 'none',
                  fontFamily: 'Inter, monospace'
                }}
              />
              <button 
                onClick={handleJoinSpace}
                disabled={joining || creating || !joinCodeInput.trim()}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: (joining || creating || !joinCodeInput.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {joining ? 'Joining…' : 'Join'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function handleSwitchSpaceFromHUD(code) {
    if (!code) return;
    try {
      await joinCouple(code);
      await loadSpaceData();
    } catch (e) {
      alert(e?.message || 'Failed to switch space.');
    }
  }

  // ── Character selection ────────────────────────────────────────
  if (!character) {
    return (
      <CharacterSelect onSelect={(c) => {
        localStorage.setItem('togetheros-character', JSON.stringify(c));
        setCharacter(c);
      }} />
    );
  }

  // ── Main game view ──────────────────────────────────────────
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a12',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gather-style HUD (top bar + bottom toolbar) */}
      <GameHUD
        spaceCode={spaceCode}
        roomName="Your Space"
        onCopyInvite={copyInvite}
        onChangeSpace={handleSwitchSpaceFromHUD}
        micOn={micOn}
        camOn={camOn}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
      />

      {/* Copy feedback toast */}
      {copied && (
        <div style={{
          position: 'fixed',
          top: 64,
          right: 20,
          background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.4)',
          color: '#4ade80',
          borderRadius: 10,
          padding: '10px 18px',
          fontSize: 13,
          fontWeight: 500,
          zIndex: 200,
          animation: 'float-up 0.3s ease',
        }}>
          ✓ Space Code copied!
        </div>
      )}

      {/* Full-screen Phaser canvas (padded for top/bottom HUD) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        paddingTop: 48,
        paddingBottom: 88,
      }}>
        <Game roomId={room.id} layoutJson={room.layout_json} socket={socket} character={character} />
      </div>

      <OverlayErrorBoundary onClose={closeOverlay}>
        <Suspense fallback={null}>
          {activeZone === 'lounge' && (
            <WatchMode socket={socket} roomId={room.id} onClose={closeOverlay} />
          )}
          {activeZone === 'office' && (
            <FocusMode socket={socket} roomId={room.id} onClose={closeOverlay} />
          )}
          {activeZone === 'garden' && (
            <ProximityVideo
              socket={socket}
              onClose={closeOverlay}
              onStreamReady={setMediaStream}
              micOn={micOn}
              camOn={camOn}
              onToggleMic={toggleMic}
              onToggleCam={toggleCam}
            />
          )}
        </Suspense>
      </OverlayErrorBoundary>
    </div>
  );
}
