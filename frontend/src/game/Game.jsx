import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import RoomScene from './scenes/RoomScene';
import { useAuthStore } from '../store/authStore';

const GAME_W = 1216;  // 38 tiles × 32px
const GAME_H = 768;   // 24 tiles × 32px
const config = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#1a1d28',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_W,
    height: GAME_H,
  },
  scene: [RoomScene],
  physics: { default: 'arcade' },
};

export default function Game({ roomId, layoutJson, socket, character }) {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!containerRef.current || !roomId || !user?.id || !socket) return;
    const game = new Phaser.Game({
      ...config,
      callbacks: {
        postBoot: (gameInstance) => {
          const sceneData = {
            layout: layoutJson || { furniture: [], theme: 'day' },
            socket,
            myUserId: user.id,
            myUserName: user.name || user.email || 'You',
            positions: {},
            character: character || { gender: 'male', palette: 'amber' },
          };
          let started = false;
          const startScene = (positions = {}) => {
            if (started) return;
            started = true;
            gameInstance.scene.start('RoomScene', { ...sceneData, positions });
          };
          startScene({});
          let fallbackId;
          const onJoin = (res) => {
            if (fallbackId) clearTimeout(fallbackId);
            if (res?.error) console.error('room:join', res.error);
            if (!started) startScene(res?.positions ?? {});
            else gameInstance.scene.getScene('RoomScene').restorePositions?.(res?.positions ?? {});
          };
          socket.emit('room:join', roomId, onJoin);
          fallbackId = setTimeout(() => {
            if (!started) startScene({});
          }, 2500);
          gameInstance.events.once('shutdown', () => { if (fallbackId) clearTimeout(fallbackId); });
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
      style={{
        width: '100%',
        height: '100%',
        minHeight: 400,
        background: '#1a1d28',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
}
