import { useEffect, useRef, useState, useCallback } from 'react';
import { createSession } from '../api/client';

let ytReady = false;
const ytCallbacks = [];
function loadYTApi() {
  if (ytReady) return Promise.resolve();
  if (window.YT?.Player) { ytReady = true; return Promise.resolve(); }
  return new Promise((resolve) => {
    ytCallbacks.push(resolve);
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      ytReady = true;
      ytCallbacks.forEach((cb) => cb());
      ytCallbacks.length = 0;
    };
  });
}

function extractVideoId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/v\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
};

const panelStyle = {
  background: '#16162a', borderRadius: 16, padding: 24, width: '90%', maxWidth: 720,
  boxShadow: '0 12px 60px rgba(0,0,0,0.7)', border: '1px solid rgba(124,58,237,0.3)',
};

export default function WatchMode({ socket, roomId, onClose }) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [urlInput, setUrlInput] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [playing, setPlaying] = useState(false);
  const ignoreEvent = useRef(false);
  const watchStart = useRef(Date.now());

  useEffect(() => { loadYTApi(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit('watch:sync', null, (state) => {
      if (state?.url) {
        const id = extractVideoId(state.url);
        if (id) { setVideoId(id); setPlaying(state.playing); }
      }
    });
  }, [socket]);

  useEffect(() => {
    if (!videoId || !containerRef.current || !window.YT?.Player) return;
    if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; }
    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      width: '100%',
      height: 400,
      playerVars: { autoplay: playing ? 1 : 0, rel: 0, modestbranding: 1 },
      events: {
        onStateChange: (e) => {
          if (ignoreEvent.current) return;
          const t = e.target.getCurrentTime();
          if (e.data === window.YT.PlayerState.PLAYING) {
            setPlaying(true);
            socket?.emit('watch:play', { time: t });
          } else if (e.data === window.YT.PlayerState.PAUSED) {
            setPlaying(false);
            socket?.emit('watch:pause', { time: t });
          }
        },
      },
    });
    return () => { playerRef.current?.destroy(); playerRef.current = null; };
  }, [videoId]);

  const seekTo = useCallback((time) => {
    if (!playerRef.current) return;
    ignoreEvent.current = true;
    playerRef.current.seekTo(time, true);
    setTimeout(() => { ignoreEvent.current = false; }, 500);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onLoad = ({ url }) => {
      const id = extractVideoId(url);
      if (id) setVideoId(id);
    };
    const onPlay = ({ time }) => {
      setPlaying(true);
      seekTo(time);
      ignoreEvent.current = true;
      playerRef.current?.playVideo();
      setTimeout(() => { ignoreEvent.current = false; }, 500);
    };
    const onPause = ({ time }) => {
      setPlaying(false);
      seekTo(time);
      ignoreEvent.current = true;
      playerRef.current?.pauseVideo();
      setTimeout(() => { ignoreEvent.current = false; }, 500);
    };
    const onSeek = ({ time }) => seekTo(time);
    const onEnd = () => { setVideoId(null); setPlaying(false); };

    socket.on('watch:load', onLoad);
    socket.on('watch:play', onPlay);
    socket.on('watch:pause', onPause);
    socket.on('watch:seek', onSeek);
    socket.on('watch:end', onEnd);
    return () => {
      socket.off('watch:load', onLoad);
      socket.off('watch:play', onPlay);
      socket.off('watch:pause', onPause);
      socket.off('watch:seek', onSeek);
      socket.off('watch:end', onEnd);
    };
  }, [socket, seekTo]);

  function handleLoadUrl() {
    const id = extractVideoId(urlInput);
    if (!id) return;
    setVideoId(id);
    socket?.emit('watch:load', { url: urlInput });
    setUrlInput('');
  }

  function handleClose() {
    socket?.emit('watch:end');
    if (roomId && videoId) {
      const duration = Math.round((Date.now() - watchStart.current) / 1000);
      createSession(roomId, { type: 'watch', duration, metadata: { videoId } }).catch(() => {});
    }
    onClose?.();
  }

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#e8e8f0', fontSize: 18, fontWeight: 700, margin: 0 }}>
            Watch Together
          </h3>
          <button onClick={handleClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', color: '#9ca3af',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16,
          }}>✕</button>
        </div>

        {!videoId && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Paste YouTube URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoadUrl()}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, padding: '10px 14px', color: '#e8e8f0', fontSize: 14, outline: 'none',
              }}
            />
            <button onClick={handleLoadUrl} disabled={!extractVideoId(urlInput)} style={{
              background: extractVideoId(urlInput) ? '#7c3aed' : 'rgba(124,58,237,0.3)',
              color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px',
              fontWeight: 600, cursor: extractVideoId(urlInput) ? 'pointer' : 'not-allowed',
            }}>Load</button>
          </div>
        )}

        <div ref={containerRef} style={{ borderRadius: 10, overflow: 'hidden', background: '#000', minHeight: videoId ? 400 : 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!videoId && <span style={{ color: '#6b7280', fontSize: 14 }}>Paste a YouTube link above to start watching together</span>}
        </div>

        {videoId && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              type="text"
              placeholder="Load a different video..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoadUrl()}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, padding: '8px 12px', color: '#e8e8f0', fontSize: 13, outline: 'none',
              }}
            />
            <button onClick={handleLoadUrl} disabled={!extractVideoId(urlInput)} style={{
              background: extractVideoId(urlInput) ? '#7c3aed' : 'rgba(124,58,237,0.3)',
              color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13,
              fontWeight: 600, cursor: extractVideoId(urlInput) ? 'pointer' : 'not-allowed',
            }}>Load</button>
          </div>
        )}
      </div>
    </div>
  );
}
