import { useEffect, useRef, useState, useCallback } from 'react';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

const overlayStyle = {
  position: 'fixed', bottom: 100, right: 20, zIndex: 500,
  display: 'flex', flexDirection: 'column', gap: 8,
  background: '#16162a', borderRadius: 16, padding: 16,
  boxShadow: '0 8px 40px rgba(0,0,0,0.6)', border: '1px solid rgba(34,197,94,0.3)',
  width: 300,
};

const videoStyle = {
  borderRadius: 10, background: '#000', width: '100%', objectFit: 'cover',
};

export default function ProximityVideo({ socket, onClose, onStreamReady, micOn, camOn, onToggleMic, onToggleCam }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setConnected(false);
  }, []);

  useEffect(() => {
    if (!socket) return;
    let mounted = true;

    async function initCall() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        onStreamReady?.(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (e) => {
          if (e.candidate) socket.emit('webrtc:ice-candidate', { candidate: e.candidate });
        };

        pc.ontrack = (e) => {
          if (remoteVideoRef.current && e.streams[0]) {
            remoteVideoRef.current.srcObject = e.streams[0];
            setConnected(true);
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            setConnected(false);
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', { offer: pc.localDescription });
      } catch (e) {
        console.error('[webrtc] init error:', e);
        setError(e.message || 'Camera/mic access denied');
      }
    }

    const onOffer = async ({ offer }) => {
      try {
        if (!pcRef.current) return;
        const pc = pcRef.current;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc:answer', { answer: pc.localDescription });
      } catch (e) {
        console.error('[webrtc] answer error:', e);
      }
    };

    const onAnswer = async ({ answer }) => {
      try {
        if (!pcRef.current) return;
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (e) {
        console.error('[webrtc] remote desc error:', e);
      }
    };

    const onIce = async ({ candidate }) => {
      try {
        if (pcRef.current && candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {
        console.error('[webrtc] ice error:', e);
      }
    };

    const onHangup = () => cleanup();

    socket.on('webrtc:offer', onOffer);
    socket.on('webrtc:answer', onAnswer);
    socket.on('webrtc:ice-candidate', onIce);
    socket.on('webrtc:hangup', onHangup);

    initCall();

    return () => {
      mounted = false;
      socket.off('webrtc:offer', onOffer);
      socket.off('webrtc:answer', onAnswer);
      socket.off('webrtc:ice-candidate', onIce);
      socket.off('webrtc:hangup', onHangup);
      socket.emit('webrtc:hangup');
      cleanup();
    };
  }, [socket, cleanup, onStreamReady]);

  function handleClose() {
    socket?.emit('webrtc:hangup');
    cleanup();
    onStreamReady?.(null);
    onClose?.();
  }

  const smallBtn = {
    background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8,
    width: 36, height: 36, cursor: 'pointer', fontSize: 16, color: '#e8e8f0',
  };

  return (
    <div style={overlayStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ color: '#e8e8f0', fontWeight: 600, fontSize: 14 }}>Video Chat</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: connected ? '#22c55e' : '#f59e0b',
            boxShadow: connected ? '0 0 6px #22c55e' : '0 0 6px #f59e0b',
          }} />
          <span style={{ color: '#6b7280', fontSize: 11 }}>
            {error ? 'Error' : connected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 8, padding: '8px 10px', fontSize: 12 }}>
          {error}
        </div>
      )}

      <video ref={remoteVideoRef} autoPlay playsInline style={{ ...videoStyle, height: 170 }} />
      <video ref={localVideoRef} autoPlay playsInline muted style={{ ...videoStyle, height: 90, opacity: 0.85 }} />

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 4 }}>
        <button onClick={onToggleMic} style={{
          ...smallBtn,
          background: micOn ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.2)',
          color: micOn ? '#e8e8f0' : '#f87171',
        }}>{micOn ? '🎤' : '🔇'}</button>
        <button onClick={onToggleCam} style={{
          ...smallBtn,
          background: camOn ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.2)',
          color: camOn ? '#e8e8f0' : '#f87171',
        }}>{camOn ? '📷' : '🚫'}</button>
        <button onClick={handleClose} style={{
          ...smallBtn, background: 'rgba(239,68,68,0.2)', color: '#f87171',
        }}>✕</button>
      </div>
    </div>
  );
}
