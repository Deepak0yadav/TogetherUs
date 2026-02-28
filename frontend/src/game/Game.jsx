import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import RoomScene from './scenes/RoomScene';
import { useAuthStore } from '../store/authStore';

const GAME_W = 832;
const GAME_H = 576;
const config = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_W,
    height: GAME_H,
  },
  scene: [RoomScene],
  physics: { default: 'arcade' },
};

export default function Game({ roomId, layoutJson, socket }) {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!containerRef.current || !roomId || !user?.id || !socket) return;
    const game = new Phaser.Game({
      ...config,
      callbacks: {
        postBoot: (gameInstance) => {
          const startScene = () => {
            socket.emit('room:join', roomId, (res) => {
              if (res?.error) { console.error('room:join', res.error); return; }
              gameInstance.scene.start('RoomScene', {
                layout: layoutJson || { furniture: [], theme: 'night' },
                socket,
                myUserId: user.id,
                myUserName: user.name || user.email || 'You',
                positions: res.positions || {},
              });
            });
          };
          if (socket.connected) startScene();
          else socket.on('connect', startScene);
        },
      },
    });
    gameRef.current = game;
    return () => { game.destroy(true); gameRef.current = null; };
  }, [roomId, user?.id, socket]);

  return (
    <div
      id="phaser-container"
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#0a0a12', position: 'relative' }}
    />
  );
}
