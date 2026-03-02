/**
 * ObjectRegistry — Gather-style interaction object schema.
 *
 * Each interactive object:
 * { id, interactionType, interactionZone, snapPosition, animationState, requiresKeyPress: true }
 * Behavior: Enter zone → show hint only. Key X → lock, tween to snap, change state, play animation. Second X → exit.
 */

import { FURNITURE } from './config.js';
import { WALL_SEGMENTS } from './RoomCollisionManager.js';

export const INTERACTION_TYPES = { SIT: 'sit', SLEEP: 'sleep', DOOR: 'door' };

const SIT_TYPES = new Set(['chair', 'chair_r', 'balcony_chair', 'office_chair', 'couch_l', 'couch_side']);
const SLEEP_TYPES = new Set(['bed_double']);

export const INTERACTION_SNAP = {
  bed_double: { interactionSnapX: 2, interactionSnapY: 14, interactionDepthOffset: 0, interactionDirection: 'right' },
};

function buildDoorRegistry() {
  const doors = [];
  let id = 0;
  WALL_SEGMENTS.vertical.forEach((seg) => {
    if (!seg.door) return;
    const zone = new Set();
    for (let y = seg.door.y1; y <= seg.door.y2; y++) {
      if (seg.x > 0) zone.add(`${seg.x - 1},${y}`);
      zone.add(`${seg.x + 1},${y}`);
    }
    if (zone.size) {
      doors.push({
        id: `door_v_${id++}`,
        furnitureType: 'door',
        interactionType: 'door',
        interactionZone: zone,
        snapPosition: null,
        animationState: null,
        requiresKeyPress: true,
        hintText: 'Press X to Open',
        doorData: { seg, axis: 'v' },
        positions: new Map(),
      });
    }
  });
  WALL_SEGMENTS.horizontal.forEach((seg) => {
    if (!seg.door) return;
    const zone = new Set();
    for (let x = seg.door.x1; x <= seg.door.x2; x++) {
      zone.add(`${x},${seg.y - 1}`);
      zone.add(`${x},${seg.y + 1}`);
    }
    if (zone.size) {
      doors.push({
        id: `door_h_${id++}`,
        furnitureType: 'door',
        interactionType: 'door',
        interactionZone: zone,
        snapPosition: null,
        animationState: null,
        requiresKeyPress: true,
        hintText: 'Press X to Open',
        doorData: { seg, axis: 'h' },
        positions: new Map(),
      });
    }
  });
  return doors;
}

export function buildObjectRegistry() {
  const registry = [];
  let id = 0;
  registry.push(...buildDoorRegistry());

  FURNITURE.forEach((f) => {
    let interactionType = null;
    let hintText = '';
    if (SIT_TYPES.has(f.type)) {
      interactionType = 'sit';
      hintText = 'Press X to Sit';
    } else if (SLEEP_TYPES.has(f.type)) {
      interactionType = 'sleep';
      hintText = 'Press X to Sleep';
    }
    if (!interactionType) return;

    const w = f.w || 1, h = f.h || 1;
    const zone = new Set();
    const positions = new Map();
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const gx = f.x + dx, gy = f.y + dy;
        zone.add(`${gx},${gy}`);
        positions.set(`${gx},${gy}`, [gx, gy]);
      }
    }

    const snap = INTERACTION_SNAP[f.type];
    const hasExplicitSnap = snap && snap.interactionSnapX != null;
    const snapPosition = hasExplicitSnap ? [snap.interactionSnapX, snap.interactionSnapY] : [f.x, f.y];
    const animationState = interactionType === 'sit' ? 'sitting' : 'sleeping';

    const entry = {
      id: `obj_${id++}`,
      furnitureType: f.type,
      interactionType,
      interactionZone: zone,
      snapPosition,
      animationState,
      requiresKeyPress: true,
      hintText,
      positions,
    };
    if (snap) {
      entry.interactionSnapX = snap.interactionSnapX;
      entry.interactionSnapY = snap.interactionSnapY;
      entry.interactionDepthOffset = snap.interactionDepthOffset ?? 0;
      entry.interactionDirection = snap.interactionDirection ?? 'right';
    }
    registry.push(entry);
  });
  return registry;
}
