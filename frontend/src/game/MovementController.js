/**
 * MovementController — Gather-style: velocity-based, no diagonal boost,
 * stop during interaction, directional animation, clamp to map bounds, collision-safe.
 */

import Phaser from 'phaser';
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } from './config.js';

const DIRECTIONS = ['left', 'right', 'up', 'down'];

/**
 * @param {Phaser.Scene} scene
 * @param {Object} options
 * @param {Phaser.GameObjects.Container} options.player
 * @param {() => boolean} options.canWalk
 * @param {(gx: number, gy: number) => boolean} options.canMoveTo
 * @param {number} [options.speed=120]
 * @param {(direction: string, isWalking: boolean) => void} [options.onDirectionChange]
 */
export class MovementController {
  constructor(scene, { player, canWalk, canMoveTo, speed = 120, onDirectionChange = null }) {
    this.scene = scene;
    this.player = player;
    this.canWalk = canWalk;
    this.canMoveTo = canMoveTo;
    this.speed = speed;
    this.onDirectionChange = onDirectionChange;

    this.cursors = null;
    this.lastDirection = 'down';
    this.walkFrameCounter = 0;
  }

  /** Call from scene create() after player exists. */
  setup() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    if (this.onDirectionChange) {
      this.onDirectionChange('down', false);
    }
  }

  /**
   * Get current tile of player (feet). Assumes player origin at feet or center.
   * @returns {{ gx: number, gy: number }}
   */
  getPlayerTile() {
    const x = this.player.x;
    const y = this.player.y;
    const gx = Math.floor(x / TILE_SIZE);
    const gy = Math.floor(y / TILE_SIZE);
    return { gx, gy };
  }

  /**
   * Clamp tile to map bounds (inclusive).
   * @param {number} gx
   * @param {number} gy
   */
  clampTile(gx, gy) {
    const cx = Phaser.Math.Clamp(gx, 0, MAP_WIDTH - 1);
    const cy = Phaser.Math.Clamp(gy, 0, MAP_HEIGHT - 1);
    return { gx: cx, gy: cy };
  }

  /**
   * Get velocity from input. Diagonal normalized so speed is same as cardinal (no diagonal boost).
   * @param {number} dt delta in ms
   * @returns {{ vx: number, vy: number, direction: string }}
   */
  getInputVelocity(dt) {
    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown) vx -= 1;
    if (this.cursors.right.isDown) vx += 1;
    if (this.cursors.up.isDown) vy -= 1;
    if (this.cursors.down.isDown) vy += 1;

    let direction = this.lastDirection;
    if (vx !== 0 || vy !== 0) {
      if (vy < 0) direction = 'up';
      else if (vy > 0) direction = 'down';
      else if (vx < 0) direction = 'left';
      else if (vx > 0) direction = 'right';
    }

    const scale = dt / 1000 * this.speed;
    if (vx !== 0 && vy !== 0) {
      const norm = Math.sqrt(2);
      vx = (vx / norm) * scale;
      vy = (vy / norm) * scale;
    } else {
      vx *= scale;
      vy *= scale;
    }
    return { vx, vy, direction };
  }

  /**
   * Try to move player by (vx, vy). Collision-safe: allow only if target tile passable; slide along walls.
   * @param {number} vx
   * @param {number} vy
   */
  applyMovement(vx, vy) {
    const x = this.player.x;
    const y = this.player.y;
    const cur = this.getPlayerTile();
    const newX = x + vx;
    const newY = y + vy;
    const gx = Math.floor(newX / TILE_SIZE);
    const gy = Math.floor(newY / TILE_SIZE);
    const targetOk = this.canMoveTo(gx, gy) && gx >= 0 && gx < MAP_WIDTH && gy >= 0 && gy < MAP_HEIGHT;

    let outX = x;
    let outY = y;
    if (targetOk) {
      outX = Phaser.Math.Clamp(newX, 0, MAP_WIDTH * TILE_SIZE - 1);
      outY = Phaser.Math.Clamp(newY, 0, MAP_HEIGHT * TILE_SIZE - 1);
    } else {
      const tryGx = Math.floor(newX / TILE_SIZE);
      const tryGy = Math.floor(newY / TILE_SIZE);
      const slideX = this.canMoveTo(tryGx, cur.gy) && tryGx >= 0 && tryGx < MAP_WIDTH;
      const slideY = this.canMoveTo(cur.gx, tryGy) && tryGy >= 0 && tryGy < MAP_HEIGHT;
      if (slideX) outX = Phaser.Math.Clamp(newX, 0, MAP_WIDTH * TILE_SIZE - 1);
      else outX = x;
      if (slideY) outY = Phaser.Math.Clamp(newY, 0, MAP_HEIGHT * TILE_SIZE - 1);
      else outY = y;
    }
    this.player.x = outX;
    this.player.y = outY;
  }

  /**
   * Call from scene update(). Stops movement when !canWalk(); otherwise moves and updates direction.
   * @param {number} [dt] delta ms (from scene, or use 1000/60 if not passed)
   */
  update(dt = 1000 / 60) {
    if (!this.player || !this.canWalk) return;

    if (!this.canWalk()) {
      if (this.onDirectionChange) this.onDirectionChange(this.lastDirection, false);
      return;
    }

    const { vx, vy, direction } = this.getInputVelocity(dt);
    const isWalking = vx !== 0 || vy !== 0;

    if (direction !== this.lastDirection || isWalking) {
      this.lastDirection = direction;
      if (this.onDirectionChange) this.onDirectionChange(direction, isWalking);
    }

    if (isWalking) {
      this.walkFrameCounter += dt;
      this.applyMovement(vx, vy);
    } else {
      this.walkFrameCounter = 0;
    }
  }

  /** Current direction for animation. */
  getDirection() {
    return this.lastDirection;
  }

  /** Walk cycle frame index (0 or 1) for 2-frame walk. */
  getWalkFrame() {
    const period = 200;
    return Math.floor(this.walkFrameCounter / period) % 2;
  }

  getIsWalking() {
    if (!this.cursors) return false;
    return this.cursors.left.isDown || this.cursors.right.isDown ||
      this.cursors.up.isDown || this.cursors.down.isDown;
  }
}
