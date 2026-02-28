export function registerWebRTCHandlers(io, socket) {
  socket.on('webrtc:offer', ({ offer }) => {
    if (!socket.roomId) return;
    socket.to(socket.roomId).emit('webrtc:offer', {
      offer,
      from: socket.user.id,
    });
  });

  socket.on('webrtc:answer', ({ answer }) => {
    if (!socket.roomId) return;
    socket.to(socket.roomId).emit('webrtc:answer', {
      answer,
      from: socket.user.id,
    });
  });

  socket.on('webrtc:ice-candidate', ({ candidate }) => {
    if (!socket.roomId) return;
    socket.to(socket.roomId).emit('webrtc:ice-candidate', {
      candidate,
      from: socket.user.id,
    });
  });

  socket.on('webrtc:hangup', () => {
    if (!socket.roomId) return;
    socket.to(socket.roomId).emit('webrtc:hangup', { from: socket.user.id });
  });
}
