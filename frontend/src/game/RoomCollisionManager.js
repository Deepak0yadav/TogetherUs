/**
 * RoomCollisionManager — wall collision layer separate from furniture.
 * Manages door open/close state; collision disabled when door is open.
 */

// Wall segments: vertical (x, y1, y2) and horizontal (y, x1, x2)
// Doors: gaps in segments that can be open (passable) or closed (blocked)
export const WALL_SEGMENTS = {
  vertical: [
    { x: 8, y1: 0, y2: 6, door: { y1: 3, y2: 6 } },
    { x: 19, y1: 0, y2: 6, door: { y1: 2, y2: 6 } },
    { x: 21, y1: 0, y2: 6, door: { y1: 2, y2: 6 } },
    { x: 7, y1: 10, y2: 23, door: { y1: 13, y2: 16 } },
    { x: 33, y1: 10, y2: 23, door: { y1: 13, y2: 16 } },
  ],
  horizontal: [
    { y: 7, x1: 0, x2: 20, door: { x1: 3, x2: 20 } },
    { y: 10, x1: 0, x2: 6, door: { x1: 2, x2: 6 } },
    { y: 10, x1: 33, x2: 37, door: { x1: 33, x2: 37 } },
  ],
};

export class RoomCollisionManager {
  constructor() {
    this.doorStates = new Map();
  }

  /** Get door key for a segment's door */
  _doorKey(seg, axis) {
    if (axis === 'v') return `v_${seg.x}_${seg.door.y1}_${seg.door.y2}`;
    return `h_${seg.y}_${seg.door.x1}_${seg.door.x2}`;
  }

  /** Doors start open (passable). Toggle with toggleDoor. */
  isDoorOpen(seg, axis) {
    const key = this._doorKey(seg, axis);
    return this.doorStates.get(key) !== false;
  }

  toggleDoor(seg, axis) {
    const key = this._doorKey(seg, axis);
    const next = !this.isDoorOpen(seg, axis);
    this.doorStates.set(key, next);
    return next;
  }

  /** Build vWall and hWall sets from segments; doors are passable when open */
  buildWallSets() {
    const vWall = new Set();
    const hWall = new Set();

    WALL_SEGMENTS.vertical.forEach((seg) => {
      const doorOpen = this.isDoorOpen(seg, 'v');
      for (let y = seg.y1; y <= seg.y2; y++) {
        const inDoor = seg.door && y >= seg.door.y1 && y <= seg.door.y2;
        if (inDoor && doorOpen) continue;
        vWall.add(`${seg.x},${y}`);
      }
    });

    WALL_SEGMENTS.horizontal.forEach((seg) => {
      const doorOpen = this.isDoorOpen(seg, 'h');
      for (let x = seg.x1; x <= seg.x2; x++) {
        const inDoor = seg.door && x >= seg.door.x1 && x <= seg.door.x2;
        if (inDoor && doorOpen) continue;
        hWall.add(`${x},${seg.y}`);
      }
    });

    return { vWall, hWall };
  }

  /** All tile coords that are part of wall segments (for clearing blocked when doors toggle). */
  getAllWallTileCoords() {
    const coords = [];
    WALL_SEGMENTS.vertical.forEach((seg) => {
      for (let y = seg.y1; y <= seg.y2; y++) {
        coords.push({ tx: seg.x, ty: y });
      }
    });
    WALL_SEGMENTS.horizontal.forEach((seg) => {
      for (let x = seg.x1; x <= seg.x2; x++) {
        coords.push({ tx: x, ty: seg.y });
      }
    });
    return coords;
  }

  /** Tile coords that should be blocked right now (wall + closed doors). */
  getWallBlockedTiles() {
    const coords = [];
    WALL_SEGMENTS.vertical.forEach((seg) => {
      const doorOpen = this.isDoorOpen(seg, 'v');
      for (let y = seg.y1; y <= seg.y2; y++) {
        const inDoor = seg.door && y >= seg.door.y1 && y <= seg.door.y2;
        if (inDoor && doorOpen) continue;
        coords.push({ tx: seg.x, ty: y });
      }
    });
    WALL_SEGMENTS.horizontal.forEach((seg) => {
      const doorOpen = this.isDoorOpen(seg, 'h');
      for (let x = seg.x1; x <= seg.x2; x++) {
        const inDoor = seg.door && x >= seg.door.x1 && x <= seg.door.x2;
        if (inDoor && doorOpen) continue;
        coords.push({ tx: x, ty: seg.y });
      }
    });
    return coords;
  }
}
