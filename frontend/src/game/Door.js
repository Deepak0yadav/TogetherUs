/**
 * Door — Gather-style: collider, open/close state, interaction key, no trapping.
 * Toggle collision via wall layer; ensure player is not overlapping before closing.
 */

import { WALL_SEGMENTS } from './RoomCollisionManager.js';

/**
 * @typedef {import('./RoomCollisionManager.js').WallSegment} WallSegment
 */

export class Door {
  /**
   * @param {string} id
   * @param {WallSegment} seg
   * @param {'v'|'h'} axis
   * @param {import('./RoomCollisionManager.js').RoomCollisionManager} roomCollisionManager
   * @param {() => void} [onColliderChange] Called after open/close (e.g. scene.rebuildWallCollision)
   */
  constructor(id, seg, axis, roomCollisionManager, onColliderChange = null) {
    this.id = id;
    this.seg = seg;
    this.axis = axis;
    this.roomCollisionManager = roomCollisionManager;
    this.onColliderChange = onColliderChange;
    this.sprite = null; // optional visual; collision is via wall layer
    this._interactionZone = null;
    this._doorTiles = null;
  }

  get isOpen() {
    return this.roomCollisionManager.isDoorOpen(this.seg, this.axis);
  }

  /** Set of "gx,gy" strings for tiles adjacent to door (where player can press X). */
  get interactionZone() {
    if (this._interactionZone) return this._interactionZone;
    const zone = new Set();
    if (this.axis === 'v') {
      for (let y = this.seg.door.y1; y <= this.seg.door.y2; y++) {
        if (this.seg.x > 0) zone.add(`${this.seg.x - 1},${y}`);
        zone.add(`${this.seg.x + 1},${y}`);
      }
    } else {
      for (let x = this.seg.door.x1; x <= this.seg.door.x2; x++) {
        zone.add(`${x},${this.seg.y - 1}`);
        zone.add(`${x},${this.seg.y + 1}`);
      }
    }
    this._interactionZone = zone;
    return zone;
  }

  /** Set of "gx,gy" for tiles that are the door (blocked when closed). */
  get doorTiles() {
    if (this._doorTiles) return this._doorTiles;
    const tiles = new Set();
    if (this.axis === 'v') {
      for (let y = this.seg.door.y1; y <= this.seg.door.y2; y++) {
        tiles.add(`${this.seg.x},${y}`);
      }
    } else {
      for (let x = this.seg.door.x1; x <= this.seg.door.x2; x++) {
        tiles.add(`${x},${this.seg.y}`);
      }
    }
    this._doorTiles = tiles;
    return tiles;
  }

  /**
   * True if we can close without trapping the player (player not standing on door tiles).
   * @param {number} playerGx
   * @param {number} playerGy
   */
  canClose(playerGx, playerGy) {
    return !this.doorTiles.has(`${playerGx},${playerGy}`);
  }

  /** Open door: disable collider, then notify. */
  open() {
    const key = this.roomCollisionManager._doorKey(this.seg, this.axis);
    if (this.roomCollisionManager.doorStates.get(key) === false) {
      this.roomCollisionManager.doorStates.set(key, true);
      this.onColliderChange?.();
    }
  }

  /** Close door: enable collider, then notify. Call only when canClose(player) is true. */
  close() {
    const key = this.roomCollisionManager._doorKey(this.seg, this.axis);
    if (this.roomCollisionManager.doorStates.get(key) !== false) {
      this.roomCollisionManager.doorStates.set(key, false);
      this.onColliderChange?.();
    }
  }

  /**
   * Toggle door. If closing, only close when player is not on door tiles.
   * @param {number} playerGx
   * @param {number} playerGy
   * @returns {{ toggled: boolean, blockedReason?: string }}
   */
  toggle(playerGx, playerGy) {
    if (this.isOpen) {
      if (!this.canClose(playerGx, playerGy)) {
        return { toggled: false, blockedReason: 'Step away to close door' };
      }
      this.close();
    } else {
      this.open();
    }
    return { toggled: true };
  }

  /**
   * Find a safe tile adjacent to the door (for tweening player out before close).
   * Prefers tile in direction of segment; returns first non-door tile in interaction zone.
   */
  getSafeTileNearDoor() {
    if (this.axis === 'v') {
      const x = this.seg.x - 1 >= 0 ? this.seg.x - 1 : this.seg.x + 1;
      const y = this.seg.door.y1;
      return { gx: x, gy: y };
    }
    const x = this.seg.door.x1;
    const y = this.seg.y - 1 >= 0 ? this.seg.y - 1 : this.seg.y + 1;
    return { gx: x, gy: y };
  }
}

/**
 * Build Door instances from wall segments.
 * @param {import('./RoomCollisionManager.js').RoomCollisionManager} roomCollisionManager
 * @param {() => void} onColliderChange
 * @param {{ vertical: WallSegment[], horizontal: WallSegment[] }} [segments]
 */
export function buildDoors(roomCollisionManager, onColliderChange, segments = null) {
  const segs = segments || WALL_SEGMENTS;
  const doors = [];
  let id = 0;
  segs.vertical.forEach((seg) => {
    if (!seg.door) return;
    doors.push(new Door(`door_v_${id++}`, seg, 'v', roomCollisionManager, onColliderChange));
  });
  segs.horizontal.forEach((seg) => {
    if (!seg.door) return;
    doors.push(new Door(`door_h_${id++}`, seg, 'h', roomCollisionManager, onColliderChange));
  });
  return doors;
}
