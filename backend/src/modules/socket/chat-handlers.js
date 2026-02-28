const chatHistory = new Map();
const MAX_HISTORY = 100;

export function registerChatHandlers(io, socket) {
  socket.on('chat:message', ({ text }) => {
    if (!socket.roomId || !text?.trim()) return;

    const msg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: socket.user.id,
      userName: socket.user.name || socket.user.email?.split('@')[0] || 'Anon',
      text: text.trim().slice(0, 500),
      ts: Date.now(),
    };

    if (!chatHistory.has(socket.roomId)) chatHistory.set(socket.roomId, []);
    const history = chatHistory.get(socket.roomId);
    history.push(msg);
    if (history.length > MAX_HISTORY) history.shift();

    io.to(socket.roomId).emit('chat:message', msg);
  });

  socket.on('chat:history', (_, cb) => {
    if (typeof cb !== 'function') return;
    const history = chatHistory.get(socket.roomId) || [];
    cb(history.slice(-50));
  });

  socket.on('chat:reaction', ({ emoji }) => {
    if (!socket.roomId || !emoji) return;
    io.to(socket.roomId).emit('chat:reaction', {
      userId: socket.user.id,
      emoji: emoji.slice(0, 4),
    });
  });

  // Screen share signaling relay
  socket.on('screen:offer', ({ offer }) => {
    if (!socket.roomId) return;
    socket.to(socket.roomId).emit('screen:offer', { offer, from: socket.user.id });
  });
  socket.on('screen:answer', ({ answer }) => {
    if (!socket.roomId) return;
    socket.to(socket.roomId).emit('screen:answer', { answer, from: socket.user.id });
  });
  socket.on('screen:ice', ({ candidate }) => {
    if (!socket.roomId) return;
    socket.to(socket.roomId).emit('screen:ice', { candidate, from: socket.user.id });
  });
  socket.on('screen:stop', () => {
    if (!socket.roomId) return;
    socket.to(socket.roomId).emit('screen:stop', { from: socket.user.id });
  });
}
