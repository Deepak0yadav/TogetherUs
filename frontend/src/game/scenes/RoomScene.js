/**
 * RoomScene — main game scene. Uses DepthManager and MovementController (Gather-style).
 * player.depth = player.y; objects by y; foreground above player. Velocity-based movement, no diagonal boost.
 */

import Phaser from 'phaser';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from '../config.js';
import { setPlayerDepth } from '../DepthManager.js';
import { MovementController } from '../MovementController.js';
import { PlayerStateMachine } from '../PlayerStateMachine.js';
import { RoomCollisionManager } from '../RoomCollisionManager.js';
import { InteractionManager } from '../InteractionManager.js';
import { drawPixelCharacter, AVATAR_WIDTH, AVATAR_PIXEL_SIZE } from '../characters.js';

export default class RoomScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RoomScene' });
  }

  init(data) {
    this.sceneData = data || {};
  }

  create() {
    try {
      const data = this.sceneData || {};
      this.tileSize = TILE_SIZE;
      this.roomCollisionManager = new RoomCollisionManager();
      this.stateMachine = new PlayerStateMachine();
      this.blocked = this.buildBlockedMap();

      this.drawBackground();

      const spawn = this.findSpawnTile();
      this.myAvatar = this.createPlayer(spawn.x, spawn.y, data.character);
      this.add.existing(this.myAvatar);

      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
      this.interactionManager = new InteractionManager(this, this.stateMachine, this.roomCollisionManager);

      this.movementController = new MovementController(this, {
        player: this.myAvatar,
        canWalk: () => this.stateMachine.canWalk(),
        canMoveTo: (gx, gy) => this.canMoveTo(gx, gy),
        speed: 120,
        onDirectionChange: (direction, isWalking) => this.updatePlayerVisual(direction, isWalking),
      });
      this.movementController.setup();

      this.avatarDirection = 'down';
      this.avatarWalkFrame = 0;
      this.avatarEmote = null;
      this.updatePlayerVisual('down', false);
    } catch (err) {
      console.error('[RoomScene] create error:', err);
      this.tileSize = TILE_SIZE;
      this.myAvatar = null;
      this.movementController = null;
      this.interactionManager = null;
      this.stateMachine = new PlayerStateMachine();
      this.drawBackground();
      this.add.text(this.scale.width / 2, this.scale.height / 2, 'Scene load error', { fontSize: 16, color: '#f87171' }).setOrigin(0.5);
    }
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillStyle(0x1a1d28, 1);
    g.fillRect(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    g.setDepth(-1);
  }

  buildBlockedMap() {
    const blocked = Array(MAP_HEIGHT).fill(null).map(() => Array(MAP_WIDTH).fill(false));
    return blocked;
  }

  findSpawnTile() {
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        if (this.canMoveTo(tx, ty)) {
          return { x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2 };
        }
      }
    }
    return { x: TILE_SIZE / 2, y: TILE_SIZE / 2 };
  }

  canMoveTo(gx, gy) {
    if (gx < 0 || gx >= MAP_WIDTH || gy < 0 || gy >= MAP_HEIGHT) return false;
    if (this.blocked[gy] && this.blocked[gy][gx]) return false;
    return true;
  }

  createPlayer(worldX, worldY, character = {}) {
    const container = this.add.container(worldX, worldY);
    const palette = character.palette || 'amber';
    const gender = character.gender || 'male';
    const g = drawPixelCharacter(this, -AVATAR_WIDTH / 2, -AVATAR_PIXEL_SIZE, palette, 'down', gender, 0, null);
    container.add(g);
    container.characterGraphic = g;
    container.palette = palette;
    container.gender = gender;
    return container;
  }

  updatePlayerVisual(direction, isWalking) {
    this.avatarDirection = direction;
    const frame = this.movementController ? this.movementController.getWalkFrame() : 0;
    this.avatarWalkFrame = frame;
    const emote = this.stateMachine.isInteracting() ? (this.stateMachine.state === 'sleeping' ? 'sleeping' : 'sitting') : null;
    this.avatarEmote = emote;
    if (!this.myAvatar.characterGraphic) return;
    const g = this.myAvatar.characterGraphic;
    g.destroy();
    const palette = this.myAvatar.palette || 'amber';
    const gender = this.myAvatar.gender || 'male';
    const newG = drawPixelCharacter(this, -AVATAR_WIDTH / 2, -AVATAR_PIXEL_SIZE, palette, direction, gender, isWalking ? frame : 0, emote);
    this.myAvatar.add(newG);
    this.myAvatar.characterGraphic = newG;
  }

  update(time, delta) {
    if (!this.myAvatar || !this.movementController || !this.interactionManager) return;
    const gx = Math.floor(this.myAvatar.x / this.tileSize);
    const gy = Math.floor(this.myAvatar.y / this.tileSize);
    const result = this.interactionManager.update(gx, gy);
    if (result.shouldLock && result.position) {
      this.stateMachine.enterInteracting(result.object?.id);
      this.tweens.add({
        targets: this.myAvatar,
        x: result.position[0] * this.tileSize + this.tileSize / 2,
        y: result.position[1] * this.tileSize + this.tileSize / 2,
        duration: 200,
        onComplete: () => this.updatePlayerVisual(this.avatarDirection, false),
      });
    }
    this.movementController.update(delta);
    setPlayerDepth(this.myAvatar);
  }

  restorePositions(positions) {
    if (positions && this.myAvatar && positions[this.sceneData?.myUserId]) {
      const p = positions[this.sceneData.myUserId];
      if (p && typeof p.x === 'number' && typeof p.y === 'number') {
        this.myAvatar.x = p.x;
        this.myAvatar.y = p.y;
      }
    }
  }
}
