/**
 * RoomScene — main game scene. Uses DepthManager and MovementController (Gather-style).
 * player.depth = player.y; objects by y; foreground above player. Velocity-based movement, no diagonal boost.
 */

import Phaser from 'phaser';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, FLOOR_MAP, COLORS, FURNITURE, PASSABLE_FURNITURE, ROOM_CONFIG } from '../config.js';
import { WALL_SEGMENTS } from '../RoomCollisionManager.js';
import { setPlayerDepth } from '../DepthManager.js';
import { MovementController } from '../MovementController.js';
import { PlayerStateMachine } from '../PlayerStateMachine.js';
import { RoomCollisionManager } from '../RoomCollisionManager.js';
import { InteractionManager } from '../InteractionManager.js';
import { drawPixelCharacter, AVATAR_WIDTH, AVATAR_PIXEL_SIZE } from '../characters.js';

class RoomScene extends Phaser.Scene {
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
      this.drawFloor();
      this.drawFurniture();
      this.drawWalls();

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
      this.currentZone = null;
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

  drawFloor() {
    const ts = TILE_SIZE;
    const floorColors = [
      COLORS.wood,
      COLORS.carpet,
      COLORS.tile,
      COLORS.grass,
      COLORS.darkWood,
    ];
    const g = this.add.graphics();
    for (let row = 0; row < FLOOR_MAP.length; row++) {
      const tileRow = FLOOR_MAP[row];
      if (!tileRow) continue;
      for (let col = 0; col < tileRow.length; col++) {
        const tile = tileRow[col];
        const color = floorColors[tile] ?? COLORS.wood;
        g.fillStyle(color, 1);
        g.fillRect(col * ts, row * ts, ts, ts);
        g.lineStyle(1, 0x000000, 0.08);
        g.strokeRect(col * ts, row * ts, ts, ts);
      }
    }
    g.setDepth(0);
  }

  getFurnitureColors(type) {
    const map = {
      kitchen_counter_h: [COLORS.kitCounter, COLORS.kitCounterDk], kitchen_counter_v: [COLORS.kitCounter, COLORS.kitCounterDk],
      kitchen_sink: [COLORS.kitSink, COLORS.kitSinkInner], fridge: [COLORS.kitCabinet, COLORS.kitCabinetDk],
      kitchen_table: [COLORS.walnutTop, COLORS.walnutDark], chair: [COLORS.couchCushion, COLORS.couchBack],
      chair_r: [COLORS.couchCushion, COLORS.couchBack], balcony_chair: [COLORS.couchCushion, COLORS.couchBack],
      office_chair: [COLORS.desk, COLORS.deskDark], tv_stand: [COLORS.walnutTop, COLORS.walnutDark],
      couch_l: [COLORS.couchCushion, COLORS.couchBack], couch_side: [COLORS.couchCushion, COLORS.couchArm],
      coffee_table: [COLORS.walnutTop, COLORS.walnutDark], rug: [COLORS.rug, COLORS.rugBorder],
      rug_blue: [COLORS.rugBlue, COLORS.rugBlueDark], lamp_floor: [COLORS.lampShade, COLORS.lampBase],
      lamp_table: [COLORS.lampShade, COLORS.lampBase], plant_big: [COLORS.plant, COLORS.plantDark],
      balcony_plant: [COLORS.plant, COLORS.plantDark], balcony_plant_lg: [COLORS.plant, COLORS.plantDark],
      desk_plant: [COLORS.plant, COLORS.pot], balcony_table: [COLORS.walnutTop, COLORS.walnutDark],
      stone_path: [COLORS.tile, COLORS.tileDark], bed_double: [COLORS.bedSheet, COLORS.bedFrame],
      nightstand: [COLORS.walnutTop, COLORS.walnutDark], wardrobe: [COLORS.kitCabinet, COLORS.kitCabinetDk],
      dresser: [COLORS.walnutTop, COLORS.walnutDark], desk_large: [COLORS.deskTop, COLORS.deskLeg],
      monitor: [COLORS.monitorScr, COLORS.monitorBez], bookshelf_large: [COLORS.shelf, COLORS.shelfDark],
      speaker: [COLORS.speaker], whiteboard: [COLORS.wallboard, COLORS.wallTrim],
    };
    const pair = map[type];
    return pair ? { main: pair[0], dark: pair[1] ?? pair[0] } : { main: COLORS.walnutTop, dark: COLORS.walnutDark };
  }

  drawFurniture() {
    const ts = TILE_SIZE;
    const rugTypes = new Set(['rug', 'rug_blue', 'stone_path']);
    const gRugs = this.add.graphics();
    const gFurn = this.add.graphics();
    FURNITURE.forEach((f) => {
      const w = (f.w || 1) * ts, h = (f.h || 1) * ts;
      const x = f.x * ts, y = f.y * ts;
      const { main, dark } = this.getFurnitureColors(f.type);
      const g = rugTypes.has(f.type) ? gRugs : gFurn;
      if (rugTypes.has(f.type)) {
        g.fillStyle(main, 1);
        g.fillRect(x + 2, y + 2, w - 4, h - 4);
        g.lineStyle(2, dark, 0.5);
        g.strokeRect(x, y, w, h);
      } else {
        g.fillStyle(dark, 1);
        g.fillRect(x, y, w, h);
        g.fillStyle(main, 1);
        g.fillRect(x + 2, y + 2, w - 4, h - 4);
        g.fillStyle(0xffffff, 0.15);
        g.fillRect(x + 2, y + 2, w - 4, 3);
        g.lineStyle(1, dark, 0.8);
        g.strokeRect(x, y, w, h);
      }
    });
    gRugs.setDepth(1);
    gFurn.setDepth(5);
  }

  drawWalls() {
    if (this.wallGraphics) this.wallGraphics.destroy();
    const ts = TILE_SIZE;
    const g = this.add.graphics();
    this.wallGraphics = g;
    WALL_SEGMENTS.vertical.forEach((seg) => {
      const doorOpen = this.roomCollisionManager.isDoorOpen(seg, 'v');
      for (let y = seg.y1; y <= seg.y2; y++) {
        const inDoor = seg.door && y >= seg.door.y1 && y <= seg.door.y2;
        if (inDoor && doorOpen) continue;
        const px = seg.x * ts, py = y * ts;
        g.fillStyle(COLORS.wallDark, 1);
        g.fillRect(px, py, ts, ts);
        g.fillStyle(COLORS.wall, 1);
        g.fillRect(px + 1, py + 1, ts - 2, ts - 2);
        g.lineStyle(1, COLORS.wallLight, 0.4);
        g.strokeRect(px, py, ts, ts);
      }
    });
    WALL_SEGMENTS.horizontal.forEach((seg) => {
      const doorOpen = this.roomCollisionManager.isDoorOpen(seg, 'h');
      for (let x = seg.x1; x <= seg.x2; x++) {
        const inDoor = seg.door && x >= seg.door.x1 && x <= seg.door.x2;
        if (inDoor && doorOpen) continue;
        const px = x * ts, py = seg.y * ts;
        g.fillStyle(COLORS.wallDark, 1);
        g.fillRect(px, py, ts, ts);
        g.fillStyle(COLORS.wall, 1);
        g.fillRect(px + 1, py + 1, ts - 2, ts - 2);
        g.lineStyle(1, COLORS.wallLight, 0.4);
        g.strokeRect(px, py, ts, ts);
      }
    });
    g.setDepth(10);
  }

  rebuildWallCollision() {
    this.blocked = this.buildBlockedMap();
    this.drawWalls();
  }

  buildBlockedMap() {
    const blocked = Array(MAP_HEIGHT).fill(null).map(() => Array(MAP_WIDTH).fill(false));
    FURNITURE.forEach((f) => {
      if (PASSABLE_FURNITURE.has(f.type)) return;
      const w = f.w || 1, h = f.h || 1;
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          const gx = f.x + dx, gy = f.y + dy;
          if (gy >= 0 && gy < MAP_HEIGHT && gx >= 0 && gx < MAP_WIDTH) blocked[gy][gx] = true;
        }
      }
    });
    WALL_SEGMENTS.vertical.forEach((seg) => {
      const doorOpen = this.roomCollisionManager.isDoorOpen(seg, 'v');
      for (let y = seg.y1; y <= seg.y2; y++) {
        const inDoor = seg.door && y >= seg.door.y1 && y <= seg.door.y2;
        if (inDoor && doorOpen) continue;
        if (y >= 0 && y < MAP_HEIGHT && seg.x >= 0 && seg.x < MAP_WIDTH) blocked[y][seg.x] = true;
      }
    });
    WALL_SEGMENTS.horizontal.forEach((seg) => {
      const doorOpen = this.roomCollisionManager.isDoorOpen(seg, 'h');
      for (let x = seg.x1; x <= seg.x2; x++) {
        const inDoor = seg.door && x >= seg.door.x1 && x <= seg.door.x2;
        if (inDoor && doorOpen) continue;
        if (seg.y >= 0 && seg.y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) blocked[seg.y][x] = true;
      }
    });
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

  /** Which zone (id) contains tile (gx, gy), or null if none. */
  getZoneAt(gx, gy) {
    for (const z of ROOM_CONFIG.zones) {
      if (gx >= z.x && gx < z.x + z.width && gy >= z.y && gy < z.y + z.height) {
        return z.id;
      }
    }
    return null;
  }

  updateZoneState(gx, gy) {
    const socket = this.sceneData?.socket;
    if (!socket) return;
    const zone = this.getZoneAt(gx, gy);
    if (zone === this.currentZone) return;
    if (this.currentZone) {
      socket.emit('zone:leave', {});
    }
    this.currentZone = zone || null;
    if (zone) {
      socket.emit('zone:enter', { zone });
    }
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
    this.updateZoneState(gx, gy);
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

export default RoomScene;
