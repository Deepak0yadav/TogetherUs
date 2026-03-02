/**
 * DepthManager — Gather-style dynamic depth sorting.
 * Rules: player.depth = player.y, object.depth = object.y, foreground above player.
 */

import { MAP_HEIGHT, TILE_SIZE } from './config.js';

/** Depth for foreground layer (doors, overlays) — always render above players. */
export const FOREGROUND_LAYER_DEPTH = (MAP_HEIGHT + 2) * TILE_SIZE;

/**
 * Set player depth by Y so lower Y (top of map) draws behind higher Y (bottom).
 * Call every frame or when player moves.
 * @param {Phaser.GameObjects.Container|Phaser.GameObjects.GameObject} player
 */
export function setPlayerDepth(player) {
  if (player && typeof player.y === 'number') {
    player.depth = player.y;
  }
}

/**
 * Set a single object's depth by its Y (e.g. furniture graphic).
 * @param {Phaser.GameObjects.GameObject} obj
 */
export function setObjectDepth(obj) {
  if (obj && typeof obj.y === 'number') {
    obj.depth = obj.y;
  }
}

/**
 * Set depth of all children in a container by their Y.
 * Use for objectLayer: each child (furniture, etc.) sorts by its y.
 * @param {Phaser.GameObjects.Container} container
 */
export function setContainerChildrenDepthByY(container) {
  if (!container || !container.list) return;
  container.list.forEach((child) => {
    if (typeof child.y === 'number') child.depth = child.y;
  });
}

/**
 * Set a layer's depth so it renders above the player.
 * Use for foreground layer (doors, overlays). Walls can use a fixed depth between floor and player.
 * @param {Phaser.GameObjects.Layer|Phaser.GameObjects.Container} layer
 * @param {number} [depth=FOREGROUND_LAYER_DEPTH]
 */
export function setForegroundLayerDepth(layer, depth = FOREGROUND_LAYER_DEPTH) {
  if (layer) layer.depth = depth;
}

/**
 * One-shot update: player depth by y, optional object container by children y, optional foreground layer.
 * Call from scene update().
 * @param {Object} options
 * @param {Phaser.GameObjects.GameObject} [options.player]
 * @param {Phaser.GameObjects.Container} [options.objectLayer]
 * @param {Phaser.GameObjects.Container|Phaser.GameObjects.Layer} [options.foregroundLayer]
 */
export function updateDepths({ player, objectLayer, foregroundLayer }) {
  if (player) setPlayerDepth(player);
  if (objectLayer) setContainerChildrenDepthByY(objectLayer);
  if (foregroundLayer) setForegroundLayerDepth(foregroundLayer);
}
