import { useState, useRef, useEffect, useCallback } from 'react';

export default function ScreenShare({ socket, open, onClose }) {
  const [sharing, setSharing] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const pcRef = useRef(null);

  const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    setSharing(false);
    setRemoteStream(null);
    socket?.emit('screen:stop');
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const onOffer = async ({ offer, from }) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;
      pc.onicecandidate = (e) => {
        if (e.candidate) socket.emit('screen:ice', { candidate: e.candidate });
      };
      pc.ontrack = (e) => setRemoteStream(e.streams[0]);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('screen:answer', { answer: pc.localDescription });
    };

    const onAnswer = async ({ answer }) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const onIce = async ({ candidate }) => {
      try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    };

    const onStop = () => {
      pcRef.current?.close();
      pcRef.current = null;
      setRemoteStream(null);
    };

    socket.on('screen:offer', onOffer);
    socket.on('screen:answer', onAnswer);
    socket.on('screen:ice', onIce);
    socket.on('screen:stop', onStop);

    return () => {
      socket.off('screen:offer', onOffer);
      socket.off('screen:answer', onAnswer);
      socket.off('screen:ice', onIce);
      socket.off('screen:stop', onStop);
    };
  }, [socket]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  async function startSharing() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      streamRef.current = stream;
      setSharing(true);

      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.onicecandidate = (e) => {
        if (e.candidate) socket.emit('screen:ice', { candidate: e.candidate });
      };

      pc.ontrack = (e) => setRemoteStream(e.streams[0]);

      stream.getVideoTracks()[0].onended = () => cleanup();

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('screen:offer', { offer: pc.localDescription });
    } catch {
      setSharing(false);
    }
  }

  function handleClose() {
    cleanup();
    onClose?.();
  }

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 250,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgba(10,10,22,0.96)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, width: '90%', maxWidth: 720, padding: 24,
        boxShadow: '0 16px 64px rgba(0,0,0,0.7)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: '#e8e8f0', fontWeight: 600, fontSize: 16 }}>Screen Share</span>
          <button onClick={handleClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', color: '#9ca3af',
            borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
          }}>Close</button>
        </div>

        {!sharing && !remoteStream && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🖥️</div>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 20 }}>
              Share your screen with your partner
            </p>
            <button onClick={startSharing} style={{
              background: '#7c3aed', border: 'none', borderRadius: 12, padding: '12px 32px',
              color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
            }}>Start Sharing</button>
          </div>
        )}

        {sharing && (
          <div>
            <video ref={localVideoRef} autoPlay muted playsInline style={{
              width: '100%', borderRadius: 12, background: '#000', maxHeight: 400,
            }} />
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button onClick={cleanup} style={{
                background: '#ef4444', border: 'none', borderRadius: 10, padding: '10px 24px',
                color: '#fff', fontWeight: 600, cursor: 'pointer',
              }}>Stop Sharing</button>
            </div>
          </div>
        )}

        {remoteStream && !sharing && (
          <div>
            <p style={{ color: '#4ade80', fontSize: 12, marginBottom: 8 }}>Partner is sharing their screen</p>
            <video ref={remoteVideoRef} autoPlay playsInline style={{
              width: '100%', borderRadius: 12, background: '#000', maxHeight: 400,
            }} />
          </div>
        )}
      </div>
    </div>
  );
}
