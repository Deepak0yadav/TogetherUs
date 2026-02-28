import { useState, useEffect, useRef } from 'react';

export default function ChatPanel({ socket, open, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit('chat:history', null, (history) => {
      if (Array.isArray(history)) setMessages(history);
    });

    const handler = (msg) => {
      setMessages((prev) => [...prev.slice(-99), msg]);
    };
    socket.on('chat:message', handler);
    return () => socket.off('chat:message', handler);
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function send() {
    const t = text.trim();
    if (!t || !socket) return;
    socket.emit('chat:message', { text: t });
    setText('');
  }

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', right: 16, bottom: 100, width: 340, maxHeight: 480,
      background: 'rgba(10,10,22,0.94)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
      display: 'flex', flexDirection: 'column', zIndex: 200,
      boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ color: '#e8e8f0', fontWeight: 600, fontSize: 14 }}>Chat</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16,
        }}>x</button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 14px', minHeight: 200, maxHeight: 340,
      }}>
        {messages.length === 0 && (
          <div style={{ color: '#4b5563', fontSize: 12, textAlign: 'center', marginTop: 40 }}>
            No messages yet. Say hi!
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
              <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: 12 }}>{m.userName}</span>
              <span style={{ color: '#4b5563', fontSize: 10 }}>
                {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div style={{ color: '#d1d5db', fontSize: 13, lineHeight: 1.5, marginTop: 2, wordBreak: 'break-word' }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', gap: 8,
      }}>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          style={{
            flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '10px 14px', color: '#e8e8f0', fontSize: 13, outline: 'none',
          }}
        />
        <button onClick={send} style={{
          background: '#7c3aed', border: 'none', borderRadius: 10, padding: '0 16px',
          color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14,
        }}>Send</button>
      </div>
    </div>
  );
}
