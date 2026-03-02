/**
 * InteractionManager — Gather-style: interaction zone + prompt UI + key trigger only.
 * No collision-triggered animation: show "Press X to Sit/Sleep" in zone; only on X lock movement,
 * tween to snapPosition, change state, play animation; second X exits to idle.
 */

import Phaser from 'phaser';
import { buildObjectRegistry } from './ObjectRegistry.js';

const INTERACT_KEY = 'X';

export class InteractionManager {
  constructor(scene, stateMachine, roomCollisionManager = null) {
    this.scene = scene;
    this.stateMachine = stateMachine;
    this.roomCollisionManager = roomCollisionManager;
    this.registry = buildObjectRegistry();
    this.hintText = null;
    this.hintBg = null;
  }

  /** Resolve hint text (doors have dynamic hint). */
  getHintText(obj) {
    if (obj.interactionType === 'door' && obj.doorData && this.roomCollisionManager) {
      const open = this.roomCollisionManager.isDoorOpen(obj.doorData.seg, obj.doorData.axis);
      return open ? 'Press X to Close' : 'Press X to Open';
    }
    return obj.hintText;
  }

  /**
   * Find the object at given grid position (if any).
   */
  getObjectAt(gx, gy) {
    const key = `${gx},${gy}`;
    for (const obj of this.registry) {
      if (obj.interactionZone.has(key)) return obj;
    }
    return null;
  }

  /**
   * Show floating "Press X to …" hint above player.
   */
  showHint(text) {
    this.hideHint();
    if (!text) return;

    const ts = this.scene.tileSize;
    const hintY = -ts * 2.2;

    this.hintText = this.scene.add.text(0, hintY, text, {
      fontSize: 11,
      fontFamily: '"Inter", system-ui',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    const w = this.hintText.width + 16;
    const h = 20;
    this.hintBg = this.scene.add.graphics();
    this.hintBg.fillStyle(0x1a1d28, 0.92);
    this.hintBg.fillRoundedRect(-w / 2, hintY - h / 2, w, h, 6);
    this.hintBg.lineStyle(1, 0x60a5fa, 0.7);
    this.hintBg.strokeRoundedRect(-w / 2, hintY - h / 2, w, h, 6);

    this.scene.myAvatar.add([this.hintBg, this.hintText]);
  }

  hideHint() {
    if (this.hintText) {
      this.hintText.destroy();
      this.hintText = null;
    }
    if (this.hintBg) {
      this.hintBg.destroy();
      this.hintBg = null;
    }
  }

  /**
   * Check if interact key (X) is pressed this frame.
   */
  isInteractKeyDown() {
    const key = this.scene.interactKey;
    return key && Phaser.Input.Keyboard.JustDown(key);
  }

  /**
   * Update: detect zone, show hint or trigger interaction.
   * @returns {{ inZone: boolean, object: object|null, shouldLock: boolean }}
   */
  update(gx, gy) {
    const obj = this.getObjectAt(gx, gy);
    const inZone = !!obj;
    const isInteracting = this.stateMachine.isInteracting();

    if (isInteracting) {
      this.hideHint();
      return { inZone: false, object: null, shouldLock: true };
    }

    if (inZone && obj) {
      this.showHint(this.getHintText(obj));

      if (this.isInteractKeyDown()) {
        if (obj.interactionType === 'door' && obj.doorData && this.roomCollisionManager) {
          this.roomCollisionManager.toggleDoor(obj.doorData.seg, obj.doorData.axis);
          this.scene.rebuildWallCollision?.();
          return { inZone, object: obj, shouldLock: false };
        }
        const pos = obj.interactionSnapX != null
          ? [obj.interactionSnapX, obj.interactionSnapY]
          : (obj.positions.get(`${gx},${gy}`) || obj.snapPosition);
        if (pos) {
          if (obj.interactionType === 'sit') {
            this.stateMachine.enterSitting(obj.id);
          } else if (obj.interactionType === 'sleep') {
            this.stateMachine.enterSleeping(obj.id);
          }
          return { inZone: true, object: obj, shouldLock: true, position: pos };
        }
      }
    } else {
      this.hideHint();
    }

    return { inZone, object: obj, shouldLock: false };
  }
}
