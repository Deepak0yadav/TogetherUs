import Phaser from 'phaser';
import { ROOM_CONFIG, FLOOR_MAP, FURNITURE, PASSABLE_FURNITURE, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, COLORS, FLOOR_WOOD, FLOOR_CARPET, FLOOR_TILE, FLOOR_GRASS, FLOOR_DARK } from '../config';
import { drawPixelCharacter, CHARACTER_PALETTES, AVATAR_PIXEL_SIZE, AVATAR_WIDTH } from '../characters';

export default class RoomScene extends Phaser.Scene {
  constructor() { super({ key: 'RoomScene' }); }

  init(data) {
    this.layout = data?.layout || { furniture: [], theme: 'day' };
    this.socket = data?.socket;
    this.myUserId = data?.myUserId;
    this.myUserName = data?.myUserName || 'You';
    this.avatars = {};
    this.avatarGridPos = {};
    this.initialPositions = data?.positions || {};
    this.myDirection = 'down';
    this.currentZone = null;
  }

  create() {
    const ts = TILE_SIZE;
    this.tileSize = ts;
    this.mapWidth = MAP_WIDTH;
    this.mapHeight = MAP_HEIGHT;
    const worldW = MAP_WIDTH * ts;
    const worldH = MAP_HEIGHT * ts;

    this.drawBackground(ts);
    this.drawFloor(ts);
    this.drawWalls(ts);
    this.drawFurniture(ts);
    this.drawZoneLabels(ts);
    this.buildCollisionMap();

    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setBackgroundColor(0x1a1d28);

    const spawn = this.findSpawnTile(13, 7);
    const startX = spawn.x * ts + ts / 2;
    const startY = spawn.y * ts + ts / 2;
    this.myAvatar = this.createAvatar(startX, startY, 'amber', this.myUserName, true);
    this.myAvatar.setData('userId', this.myUserId);
    this.cameras.main.startFollow(this.myAvatar, true, 0.1, 0.1);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S, left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D });
    this.lastMove = 0;
    this.MOVE_THROTTLE = 80;

    if (this.socket) {
      this.socket.on('avatar:move', (data) => this.onRemoteMove(data));
      this.socket.on('avatar:left', (data) => this.removeAvatar(data.userId));
    }
    this.restorePositions(this.initialPositions);
  }

  drawBackground(ts) {
    const g = this.add.graphics();
    g.fillStyle(0x1a1d28, 1);
    g.fillRect(0, 0, MAP_WIDTH * ts, MAP_HEIGHT * ts);
  }

  drawFloor(ts) {
    const g = this.add.graphics();
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const type = FLOOR_MAP[y]?.[x] ?? FLOOR_WOOD;
        const tx = x * ts, ty = y * ts;
        if (type === FLOOR_WOOD) {
          const shade = (x + y) % 2 === 0 ? 0 : 8;
          const base = COLORS.wood;
          const r = Math.min(255, ((base >> 16) & 0xff) - shade);
          const gr = Math.min(255, ((base >> 8) & 0xff) - shade);
          const b = Math.min(255, (base & 0xff) - shade);
          g.fillStyle((r << 16) | (gr << 8) | b, 1);
          g.fillRect(tx, ty, ts, ts);
          g.lineStyle(1, COLORS.woodLine, 0.3);
          g.lineBetween(tx, ty + 10, tx + ts, ty + 10);
          g.lineBetween(tx, ty + 21, tx + ts, ty + 21);
        } else if (type === FLOOR_CARPET) {
          const shade = (x + y) % 2 === 0 ? 0 : 10;
          const base = COLORS.carpet;
          const r = Math.max(0, ((base >> 16) & 0xff) - shade);
          const gr = Math.max(0, ((base >> 8) & 0xff) - shade);
          const b = Math.max(0, (base & 0xff) - shade);
          g.fillStyle((r << 16) | (gr << 8) | b, 1);
          g.fillRect(tx, ty, ts, ts);
          // pile texture
          g.fillStyle(COLORS.carpetHL, 0.06);
          g.fillRect(tx + 2, ty + 2, ts - 4, ts - 4);
        } else if (type === FLOOR_TILE) {
          const shade = (x + y) % 2 === 0 ? 0 : 12;
          const base = COLORS.tile;
          const r = Math.min(255, ((base >> 16) & 0xff) + shade);
          const gr2 = Math.min(255, ((base >> 8) & 0xff) + shade);
          const b = Math.min(255, (base & 0xff) + shade);
          g.fillStyle((r << 16) | (gr2 << 8) | b, 1);
          g.fillRect(tx, ty, ts, ts);
          g.lineStyle(1, COLORS.tileGrout, 0.5);
          g.strokeRect(tx + 1, ty + 1, ts - 2, ts - 2);
        } else if (type === FLOOR_GRASS) {
          const shade = ((x * 3 + y * 7) % 3) * 6;
          const base = COLORS.grass;
          const r = Math.max(0, ((base >> 16) & 0xff) - shade);
          const gr3 = Math.max(0, ((base >> 8) & 0xff) - shade);
          const b = Math.max(0, (base & 0xff) - shade);
          g.fillStyle((r << 16) | (gr3 << 8) | b, 1);
          g.fillRect(tx, ty, ts, ts);
          // grass blades
          g.fillStyle(COLORS.grassDark, 0.35);
          g.fillRect(tx + 4, ty + 6, 2, 8);
          g.fillRect(tx + 12, ty + 4, 2, 10);
          g.fillRect(tx + 22, ty + 8, 2, 7);
          g.fillStyle(COLORS.grassMid, 0.25);
          g.fillRect(tx + 8, ty + 10, 2, 6);
          g.fillRect(tx + 18, ty + 5, 2, 9);
        } else if (type === FLOOR_DARK) {
          const shade = (x + y) % 2 === 0 ? 0 : 8;
          const base = COLORS.darkWood;
          const r = Math.max(0, ((base >> 16) & 0xff) - shade);
          const gr4 = Math.max(0, ((base >> 8) & 0xff) - shade);
          const b = Math.max(0, (base & 0xff) - shade);
          g.fillStyle((r << 16) | (gr4 << 8) | b, 1);
          g.fillRect(tx, ty, ts, ts);
          g.lineStyle(1, COLORS.darkWoodLine, 0.25);
          g.lineBetween(tx, ty + 10, tx + ts, ty + 10);
          g.lineBetween(tx, ty + 22, tx + ts, ty + 22);
        }
      }
    }
  }

  drawWalls(ts) {
    const g = this.add.graphics();
    const W = MAP_WIDTH * ts, H = MAP_HEIGHT * ts;
    // Outer wall shadow
    g.fillStyle(0x000000, 0.3);
    g.fillRect(0, 0, W, 4);
    g.fillRect(0, 0, 4, H);
    // Outer border
    g.lineStyle(4, COLORS.wall, 1);
    g.strokeRoundedRect(2, 2, W - 4, H - 4, 4);
    // Room dividers (vertical)
    g.lineStyle(2, COLORS.wallLight, 0.4);
    // Kitchen | living
    g.lineBetween(5 * ts, 0, 5 * ts, 6 * ts);
    // Living | garden gap (column 14-19)
    g.lineBetween(14 * ts, 0, 14 * ts, 6 * ts);
    g.lineBetween(19 * ts, 0, 19 * ts, 5 * ts);
    // Bedroom | hall
    g.lineBetween(6 * ts, 9 * ts, 6 * ts, H);
    // Hall | office
    g.lineBetween(22 * ts, 9 * ts, 22 * ts, H);
    // Horizontal room dividers
    g.lineBetween(0, 6 * ts, 19 * ts, 6 * ts);     // top zone bottom edge
    g.lineBetween(0, 9 * ts, 6 * ts, 9 * ts);      // bedroom top
    g.lineBetween(22 * ts, 9 * ts, W, 9 * ts);     // office top
    // Door openings (lighter)
    g.lineStyle(2, COLORS.wallboard, 0.6);
    g.lineBetween(5 * ts, 3 * ts, 5 * ts, 5 * ts);
    g.lineBetween(6 * ts, 12 * ts, 6 * ts, 14 * ts);
    g.lineBetween(22 * ts, 12 * ts, 22 * ts, 14 * ts);
  }

  drawFurniture(ts) {
    const g = this.add.graphics();
    FURNITURE.forEach(f => {
      const x = f.x * ts, y = f.y * ts;
      const w = (f.w || 1) * ts, h = (f.h || 1) * ts;
      this.drawItem(g, f.type, x, y, w, h, ts);
    });
  }

  drawItem(g, type, x, y, w, h, ts) {
    const C = COLORS;
    // Drop shadow for all solid furniture
    const shadow = (sx, sy, sw, sh) => { g.fillStyle(0x000000, 0.12); g.fillRect(sx + 2, sy + 2, sw, sh); };

    switch (type) {

      case 'kitchen_counter_h':
        shadow(x, y, w, h);
        g.fillStyle(C.kitCabinetDk, 1); g.fillRoundedRect(x, y, w, h, 2);
        g.fillStyle(C.kitCabinet, 1); g.fillRoundedRect(x + 1, y + 1, w - 2, h - 3, 2);
        g.fillStyle(C.kitCounter, 1); g.fillRect(x + 2, y + 1, w - 4, 6);
        g.fillStyle(0xffffff, 0.1); g.fillRect(x + 2, y + 1, w - 4, 2);
        for (let i = 0; i < Math.floor(w / ts); i++) {
          g.lineStyle(1, C.kitCabinetTm, 0.4);
          g.strokeRect(x + i * ts + 4, y + 10, ts - 8, h - 14);
          g.fillStyle(0xc0b898, 0.5); g.fillCircle(x + i * ts + ts / 2, y + h / 2 + 4, 2);
        }
        break;

      case 'kitchen_counter_v':
        shadow(x, y, w, h);
        g.fillStyle(C.kitCabinetDk, 1); g.fillRoundedRect(x, y, w, h, 2);
        g.fillStyle(C.kitCabinet, 1); g.fillRect(x + 1, y + 1, w - 2, h - 2);
        g.fillStyle(C.kitCounter, 1); g.fillRect(x + 1, y + 1, 6, h - 2);
        g.fillStyle(C.kitStove, 1); g.fillRoundedRect(x + 2, y + 4, w - 4, 22, 2);
        g.fillStyle(C.kitStoveTp, 1); g.fillRect(x + 3, y + 5, w - 6, 20);
        g.fillStyle(0x1a1a1a, 1);
        g.fillCircle(x + w / 2 - 4, y + 11, 5); g.fillCircle(x + w / 2 + 6, y + 11, 5);
        g.fillCircle(x + w / 2 - 4, y + 23, 5); g.fillCircle(x + w / 2 + 6, y + 23, 5);
        g.fillStyle(0xcc3300, 0.4); g.fillCircle(x + w / 2 - 4, y + 11, 2);
        break;

      case 'kitchen_sink':
        g.fillStyle(C.kitSink, 1); g.fillRoundedRect(x + 4, y + 3, w - 8, h - 6, 3);
        g.fillStyle(C.kitSinkInner, 1); g.fillRoundedRect(x + 6, y + 5, w - 12, h - 10, 2);
        g.fillStyle(0xb0c4d0, 0.5); g.fillRect(x + w / 2 - 1, y + 2, 2, 6);
        break;

      case 'fridge':
        shadow(x + 2, y, w - 4, h);
        g.fillStyle(C.kitCabinetDk, 1); g.fillRoundedRect(x + 2, y, w - 4, h, 3);
        g.fillStyle(C.kitCabinet, 1); g.fillRoundedRect(x + 3, y + 1, w - 6, h - 2, 3);
        g.fillStyle(0xffffff, 0.08); g.fillRect(x + 4, y + 2, w - 8, 4);
        g.lineStyle(1, C.kitCabinetTm, 0.7); g.lineBetween(x + 4, y + h * 0.4, x + w - 4, y + h * 0.4);
        g.fillStyle(0xa0b0c0, 0.5); g.fillRoundedRect(x + w - 8, y + 6, 3, 10, 1);
        g.fillStyle(0xa0b0c0, 0.5); g.fillRoundedRect(x + w - 8, y + h * 0.4 + 4, 3, 10, 1);
        break;

      case 'kitchen_table':
        shadow(x + 2, y + 2, w - 4, h - 4);
        g.fillStyle(C.deskLeg, 1);
        g.fillRect(x + 6, y + 6, 4, h - 8); g.fillRect(x + w - 10, y + 6, 4, h - 8);
        g.fillStyle(C.deskDark, 1); g.fillRoundedRect(x + 2, y + 2, w - 4, h - 4, 3);
        g.fillStyle(C.deskTop, 1); g.fillRoundedRect(x + 1, y + 1, w - 2, h - 2, 4);
        g.fillStyle(C.deskHL, 0.35); g.fillRect(x + 4, y + 2, w - 8, 3);
        g.fillStyle(0xffffff, 0.06); g.fillRoundedRect(x + 4, y + 4, w - 8, h - 8, 3);
        g.fillStyle(0xf0e8d8, 1); g.fillCircle(x + w / 2 - 8, y + h / 2, 8);
        g.fillStyle(0xe0d4c0, 1); g.fillCircle(x + w / 2 - 8, y + h / 2, 6);
        g.fillStyle(0xffffff, 0.15); g.fillCircle(x + w / 2 - 9, y + h / 2 - 1, 3);
        g.fillStyle(0x8b6b4a, 1); g.fillCircle(x + w / 2 + 10, y + h / 2 - 2, 4);
        g.fillStyle(0x5c3d1e, 0.7); g.fillCircle(x + w / 2 + 10, y + h / 2 - 2, 2);
        break;

      case 'chair':
      case 'chair_r': {
        const facing = type === 'chair' ? 1 : -1;
        g.fillStyle(C.deskLeg, 1);
        g.fillRect(x + 6, y + h - 6, 3, 6); g.fillRect(x + w - 9, y + h - 6, 3, 6);
        g.fillStyle(C.couchDark, 1); g.fillRoundedRect(x + 3, y + 8, w - 6, h - 12, 3);
        g.fillStyle(C.couchCushion, 1); g.fillRoundedRect(x + 5, y + 10, w - 10, h - 16, 3);
        g.fillStyle(0xffffff, 0.08); g.fillRect(x + 6, y + 10, w - 12, 3);
        g.fillStyle(C.couchBack, 1); g.fillRoundedRect(x + 4, y + 2, w - 8, 8, 3);
        g.fillStyle(C.couchArm, 0.6); g.fillRect(x + 4, y + 4, 4, h - 8);
        break;
      }

      case 'tv_stand':
        shadow(x + 2, y + 2, w - 4, h - 2);
        g.fillStyle(C.walnut, 1); g.fillRoundedRect(x, y + h - 6, w, 6, 2);
        g.fillStyle(C.walnutTop, 1); g.fillRect(x + 2, y + h - 5, w - 4, 4);
        g.fillStyle(C.tv, 1); g.fillRoundedRect(x + 4, y + 1, w - 8, h - 6, 3);
        g.fillStyle(C.monitor, 1); g.fillRoundedRect(x + 5, y, w - 10, h - 7, 2);
        g.fillStyle(C.monitorScr, 1); g.fillRect(x + 7, y + 2, w - 14, h - 11);
        g.fillStyle(0x5090c0, 0.25); g.fillRect(x + 7, y + 2, w - 14, 4);
        g.fillStyle(C.monitorGlow, 0.15); g.fillRect(x + 7, y + 2, (w - 14) / 2, h - 11);
        g.fillStyle(0x22ee44, 1); g.fillCircle(x + w - 10, y + h - 8, 2);
        break;

      case 'couch_l':
        shadow(x, y, w, h);
        g.fillStyle(C.couchBack, 1); g.fillRoundedRect(x, y, w, 12, 4);
        g.fillStyle(C.couch, 1); g.fillRoundedRect(x, y + 8, w, h - 8, 4);
        g.fillStyle(C.couchArm, 1);
        g.fillRoundedRect(x, y, 10, h, 4); g.fillRoundedRect(x + w - 10, y, 10, h, 4);
        g.fillStyle(C.couchCushion, 1);
        for (let i = 0; i < Math.floor(w / ts); i++) {
          g.fillRoundedRect(x + i * ts + 5, y + 14, ts - 10, h - 20, 5);
          g.fillStyle(C.couchHL, 0.12);
          g.fillRect(x + i * ts + 7, y + 15, ts - 14, 4);
          g.fillStyle(C.couchCushion, 1);
        }
        g.fillStyle(C.couchLeg, 1);
        g.fillRect(x + 4, y + h - 3, 5, 3); g.fillRect(x + w - 9, y + h - 3, 5, 3);
        break;

      case 'couch_side':
        shadow(x, y, w, h);
        g.fillStyle(C.couchBack, 1); g.fillRoundedRect(x, y, 12, h, 4);
        g.fillStyle(C.couch, 1); g.fillRoundedRect(x + 8, y, w - 8, h, 4);
        g.fillStyle(C.couchArm, 1);
        g.fillRoundedRect(x, y, w, 10, 4); g.fillRoundedRect(x, y + h - 10, w, 10, 4);
        g.fillStyle(C.couchCushion, 1);
        for (let i = 0; i < Math.floor(h / ts); i++) {
          g.fillRoundedRect(x + 14, y + i * ts + 5, w - 20, ts - 10, 5);
        }
        break;

      case 'coffee_table':
        shadow(x + 2, y + 2, w - 4, h - 4);
        g.fillStyle(C.walnutDark, 1);
        g.fillRect(x + 6, y + 4, 4, h - 6); g.fillRect(x + w - 10, y + 4, 4, h - 6);
        g.fillStyle(C.walnutDark, 1); g.fillRoundedRect(x + 2, y + 3, w - 4, h - 5, 3);
        g.fillStyle(C.walnutTop, 1); g.fillRoundedRect(x + 1, y + 1, w - 2, h - 4, 4);
        g.fillStyle(0xffffff, 0.1); g.fillRect(x + 4, y + 2, w - 8, 3);
        g.fillStyle(0x2a2a2a, 1); g.fillRoundedRect(x + 6, y + 6, 16, 7, 2);
        g.fillStyle(0x404040, 0.5); g.fillRect(x + 8, y + 8, 12, 3);
        g.fillStyle(0xf0e0c8, 1); g.fillCircle(x + w - 12, y + h / 2 - 1, 5);
        g.fillStyle(0x8b6b4a, 0.7); g.fillCircle(x + w - 12, y + h / 2 - 1, 3);
        break;

      case 'rug':
        g.fillStyle(C.rugDark, 1); g.fillRoundedRect(x + 1, y + 1, w - 2, h - 2, 2);
        g.fillStyle(C.rug, 1); g.fillRoundedRect(x + 2, y + 2, w - 4, h - 4, 1);
        g.lineStyle(2, C.rugBorder, 0.9); g.strokeRect(x + 4, y + 4, w - 8, h - 8);
        g.lineStyle(1, C.rugPattern, 0.4); g.strokeRect(x + 10, y + 10, w - 20, h - 20);
        g.fillStyle(C.rugPattern, 0.2);
        g.fillRect(x + w / 2 - 8, y + 6, 16, 3);
        g.fillRect(x + w / 2 - 8, y + h - 9, 16, 3);
        for (let i = 0; i < 3; i++) { g.fillRect(x + 8 + i * 10, y + h / 2, 6, 2); }
        break;

      case 'rug_blue':
        g.fillStyle(C.rugBlueDark, 1); g.fillRoundedRect(x + 1, y + 1, w - 2, h - 2, 2);
        g.fillStyle(C.rugBlue, 1); g.fillRoundedRect(x + 2, y + 2, w - 4, h - 4, 1);
        g.lineStyle(2, C.rugBlueDark, 0.8); g.strokeRect(x + 4, y + 4, w - 8, h - 8);
        g.lineStyle(1, C.rugBlueHL, 0.25); g.strokeRect(x + 10, y + 10, w - 20, h - 20);
        break;

      case 'lamp_floor':
        g.fillStyle(0xffeeaa, 0.06); g.fillCircle(x + w / 2, y + 14, 22);
        g.fillStyle(C.lampBase, 0.8); g.fillEllipse(x + w / 2, y + h - 4, 14, 5);
        g.lineStyle(2, C.lampBase, 0.9); g.lineBetween(x + w / 2, y + 12, x + w / 2, y + h - 4);
        g.fillStyle(C.lampShade, 1); g.fillTriangle(x + w / 2 - 10, y + 14, x + w / 2 + 10, y + 14, x + w / 2, y + 1);
        g.fillStyle(C.lamp, 0.5); g.fillTriangle(x + w / 2 - 8, y + 13, x + w / 2 + 8, y + 13, x + w / 2, y + 3);
        g.fillStyle(0xffeeaa, 0.15); g.fillCircle(x + w / 2, y + 14, 8);
        break;

      case 'lamp_table':
        g.fillStyle(C.lampBase, 0.7); g.fillRect(x + w / 2 - 2, y + h / 2, 4, h / 2 - 2);
        g.fillStyle(C.lampShade, 1); g.fillTriangle(x + w / 2 - 7, y + h / 2, x + w / 2 + 7, y + h / 2, x + w / 2, y + 4);
        g.fillStyle(0xffeeaa, 0.08); g.fillCircle(x + w / 2, y + h / 2, 10);
        break;

      case 'plant_big':
        g.fillStyle(C.potDark, 1); g.fillRoundedRect(x + w / 2 - 7, y + h - 9, 14, 9, 3);
        g.fillStyle(C.pot, 1); g.fillRoundedRect(x + w / 2 - 8, y + h - 10, 16, 10, 3);
        g.fillStyle(C.soil, 1); g.fillRoundedRect(x + w / 2 - 5, y + h - 10, 10, 3, 1);
        g.fillStyle(C.plantDark, 1); g.fillEllipse(x + w / 2 + 4, y + h - 18, 20, 18);
        g.fillStyle(C.plantDark, 1); g.fillEllipse(x + w / 2 - 6, y + h - 22, 18, 16);
        g.fillStyle(C.plant, 1); g.fillEllipse(x + w / 2, y + h - 22, 22, 20);
        g.fillStyle(C.plantHL, 0.7); g.fillEllipse(x + w / 2 - 4, y + h - 26, 12, 10);
        break;

      case 'balcony_plant':
        g.fillStyle(C.potDark, 1); g.fillRoundedRect(x + 7, y + h - 7, 10, 7, 2);
        g.fillStyle(C.pot, 1); g.fillRoundedRect(x + 6, y + h - 8, 12, 8, 2);
        g.fillStyle(C.plantDark, 1); g.fillEllipse(x + w / 2, y + h - 14, 16, 14);
        g.fillStyle(C.plant, 1); g.fillEllipse(x + w / 2 - 2, y + h - 17, 12, 10);
        g.fillStyle(C.plantHL, 0.8); g.fillEllipse(x + w / 2 - 3, y + h - 19, 7, 6);
        break;

      case 'balcony_plant_lg':
        g.fillStyle(C.potDark, 1); g.fillRoundedRect(x + 5, y + h - 9, 14, 9, 3);
        g.fillStyle(C.pot, 1); g.fillRoundedRect(x + 4, y + h - 10, 16, 10, 3);
        g.fillStyle(C.plantDark, 1); g.fillEllipse(x + w / 2, y + h - 16, 22, 18);
        g.fillStyle(C.plant, 1); g.fillEllipse(x + w / 2 - 2, y + h - 20, 16, 14);
        g.fillStyle(C.plantHL, 0.8); g.fillEllipse(x + w / 2 - 3, y + h - 23, 9, 8);
        break;

      case 'balcony_chair':
        g.fillStyle(0x5a7050, 1);
        g.fillRect(x + 6, y + h - 4, 3, 4); g.fillRect(x + w - 9, y + h - 4, 3, 4);
        g.fillStyle(0x7a9868, 1); g.fillRoundedRect(x + 4, y + 8, w - 8, h - 12, 4);
        g.fillStyle(0xb0d8a0, 1); g.fillRoundedRect(x + 6, y + 10, w - 12, h - 16, 3);
        g.fillStyle(0xffffff, 0.08); g.fillRect(x + 7, y + 10, w - 14, 3);
        g.fillStyle(0x6a9060, 1); g.fillRoundedRect(x + 4, y + 2, w - 8, 8, 3);
        break;

      case 'balcony_table':
        shadow(x + 2, y + 2, w - 4, h - 4);
        g.fillStyle(0x7a9068, 1);
        g.fillRect(x + w / 2 - 2, y + h / 2, 4, h / 2);
        g.fillStyle(0x8aa878, 1); g.fillRoundedRect(x + 2, y + 2, w - 4, h - 6, 4);
        g.fillStyle(0xb0cca0, 1); g.fillRoundedRect(x + 3, y + 1, w - 6, h - 8, 3);
        g.fillStyle(0xffffff, 0.08); g.fillRect(x + 5, y + 2, w - 10, 3);
        g.fillStyle(0xf8f4f0, 1); g.fillRoundedRect(x + w / 2 - 4, y + 5, 8, 8, 2);
        g.fillStyle(0x6b4226, 0.6); g.fillRoundedRect(x + w / 2 - 3, y + 7, 6, 4, 1);
        break;

      case 'stone_path':
        for (let i = 0; i < Math.floor(w / ts); i++) {
          g.fillStyle(0xa0a8b0, 0.3); g.fillRoundedRect(x + i * ts + 4, y + 5, ts - 8, h - 10, 4);
          g.fillStyle(0xb8c0c8, 1); g.fillRoundedRect(x + i * ts + 3, y + 4, ts - 6, h - 8, 4);
          g.fillStyle(0xffffff, 0.1); g.fillRect(x + i * ts + 5, y + 5, ts - 10, 3);
        }
        break;

      case 'bed_double': {
        shadow(x + 2, y + 4, w - 4, h - 4);
        g.fillStyle(C.bedFrameDk, 1); g.fillRoundedRect(x + 2, y + 4, w - 4, h - 4, 3);
        g.fillStyle(C.bedFrame, 1); g.fillRoundedRect(x + 3, y + 5, w - 6, h - 6, 2);
        g.fillStyle(C.walnutDark, 1); g.fillRoundedRect(x + 1, y, w - 2, 16, 4);
        g.fillStyle(C.walnut, 1); g.fillRoundedRect(x + 2, y + 1, w - 4, 14, 3);
        g.fillStyle(C.walnutTop, 0.3); g.fillRect(x + 4, y + 2, w - 8, 4);
        g.fillStyle(C.bedSheet, 1); g.fillRect(x + 6, y + 18, w - 12, h - 26);
        g.fillStyle(C.bedBlanket, 1); g.fillRoundedRect(x + 5, y + 18, w - 10, 24, 2);
        g.fillStyle(C.bedBlanketDk, 0.3);
        for (let i = 1; i < Math.floor((w - 10) / 22); i++) g.fillRect(x + 5 + i * 22, y + 18, 1, 24);
        g.fillStyle(0xffffff, 0.06); g.fillRect(x + 6, y + 18, w - 12, 4);
        const pw = (w - 18) / 2;
        g.fillStyle(C.bedPillow, 1);
        g.fillRoundedRect(x + 7, y + 18, pw, 15, 4);
        g.fillRoundedRect(x + 11 + pw, y + 18, pw, 15, 4);
        g.fillStyle(0xffffff, 0.15);
        g.fillRect(x + 9, y + 19, pw - 4, 4);
        g.fillRect(x + 13 + pw, y + 19, pw - 4, 4);
        break;
      }

      case 'nightstand':
        shadow(x + 2, y + 2, w - 4, h - 4);
        g.fillStyle(C.walnutDark, 1); g.fillRoundedRect(x + 2, y + 3, w - 4, h - 3, 2);
        g.fillStyle(C.walnut, 1); g.fillRoundedRect(x + 1, y + 1, w - 2, h - 4, 2);
        g.fillStyle(C.walnutTop, 1); g.fillRoundedRect(x, y, w, 6, 2);
        g.fillStyle(0xffffff, 0.08); g.fillRect(x + 2, y + 1, w - 4, 2);
        g.lineStyle(1, C.walnutDark, 0.5); g.lineBetween(x + 3, y + h / 2, x + w - 3, y + h / 2);
        g.fillStyle(0xd4c060, 0.7); g.fillCircle(x + w / 2, y + h / 2 - 4, 2);
        g.fillStyle(0xd4c060, 0.7); g.fillCircle(x + w / 2, y + h / 2 + 6, 2);
        break;

      case 'wardrobe':
        shadow(x + 1, y + 1, w - 2, h - 1);
        g.fillStyle(C.walnutDark, 1); g.fillRoundedRect(x, y, w, h, 2);
        g.fillStyle(C.walnut, 1);
        g.fillRect(x + 2, y + 2, w / 2 - 3, h - 3);
        g.fillRect(x + w / 2 + 1, y + 2, w / 2 - 3, h - 3);
        g.fillStyle(C.walnutTop, 0.15); g.fillRect(x + 2, y + 2, w - 4, 3);
        g.lineStyle(1, C.walnutDark, 1); g.lineBetween(x + w / 2, y + 2, x + w / 2, y + h - 1);
        g.fillStyle(0xd4c060, 1);
        g.fillCircle(x + w / 2 - 4, y + h / 2, 2);
        g.fillCircle(x + w / 2 + 4, y + h / 2, 2);
        break;

      case 'dresser':
        shadow(x + 1, y + 1, w - 2, h - 1);
        g.fillStyle(C.walnutDark, 1); g.fillRoundedRect(x, y, w, h, 2);
        g.fillStyle(C.walnut, 1); g.fillRect(x + 2, y + 2, w - 4, h - 4);
        g.fillStyle(C.walnutTop, 1); g.fillRoundedRect(x, y, w, 5, 2);
        g.fillStyle(0xffffff, 0.06); g.fillRect(x + 2, y + 1, w - 4, 2);
        const drawerH = Math.floor((h - 6) / 3);
        for (let i = 0; i < 3; i++) {
          const dy = y + 6 + i * drawerH;
          g.lineStyle(1, C.walnutDark, 0.6); g.strokeRect(x + 3, dy, w - 6, drawerH - 1);
          g.fillStyle(0xd4c060, 0.8); g.fillCircle(x + w / 2, dy + drawerH / 2, 2);
        }
        break;

      case 'desk_large':
        shadow(x, y, w, h);
        g.fillStyle(C.deskLeg, 1);
        g.fillRect(x + 4, y + 8, 5, h - 8); g.fillRect(x + w - 9, y + 8, 5, h - 8);
        g.fillStyle(C.deskDark, 1); g.fillRoundedRect(x + 2, y + 3, w - 4, 8, 2);
        g.fillStyle(C.deskTop, 1); g.fillRoundedRect(x, y, w, 8, 3);
        g.fillStyle(C.deskHL, 0.3); g.fillRect(x + 3, y + 1, w - 6, 3);
        g.fillStyle(0xffffff, 0.06); g.fillRect(x + 2, y + 1, w - 4, 2);
        g.fillStyle(C.desk, 0.5); g.fillRect(x + w - 30, y + 10, 24, h - 12);
        g.lineStyle(1, C.deskDark, 0.3); g.strokeRect(x + w - 30, y + 10, 24, h - 12);
        break;

      case 'office_chair':
        g.fillStyle(0x252830, 1); g.fillEllipse(x + w / 2, y + h - 1, w - 6, 5);
        g.fillStyle(0x303440, 0.6); g.fillRect(x + w / 2 - 2, y + h / 2, 4, h / 2 - 2);
        g.fillStyle(0x303440, 1); g.fillRoundedRect(x + 4, y + 6, w - 8, h - 14, 5);
        g.fillStyle(0x484e60, 1); g.fillRoundedRect(x + 6, y + 8, w - 12, h - 18, 4);
        g.fillStyle(0xffffff, 0.05); g.fillRect(x + 7, y + 8, w - 14, 3);
        g.fillStyle(0x303440, 1); g.fillRoundedRect(x + 4, y + 1, w - 8, 7, 3);
        break;

      case 'monitor':
        g.fillStyle(C.monitorBez, 1); g.fillRect(x + w / 2 - 3, y + h - 4, 6, 4);
        g.fillStyle(C.monitorBez, 1); g.fillEllipse(x + w / 2, y + h - 1, 14, 4);
        g.fillStyle(C.monitor, 1); g.fillRoundedRect(x + 3, y + 1, w - 6, h - 6, 2);
        g.fillStyle(C.monitorScr, 1); g.fillRect(x + 5, y + 3, w - 10, h - 10);
        g.fillStyle(C.monitorGlow, 0.2); g.fillRect(x + 5, y + 3, w - 10, 4);
        g.fillStyle(0xffffff, 0.04); g.fillRect(x + 5, y + 3, (w - 10) / 3, h - 10);
        break;

      case 'keyboard':
        g.fillStyle(C.keyboard, 1); g.fillRoundedRect(x + 1, y + 4, w - 2, h - 6, 2);
        g.fillStyle(C.keyboardKey, 0.5);
        for (let row = 0; row < 3; row++) for (let col = 0; col < 5; col++) g.fillRoundedRect(x + 3 + col * 5, y + 6 + row * 5, 3, 3, 1);
        break;

      case 'speaker':
        g.fillStyle(C.speaker, 1); g.fillRoundedRect(x + 4, y + 2, w - 8, h - 4, 4);
        g.fillStyle(0x252830, 1); g.fillCircle(x + w / 2, y + 8, 4);
        g.fillStyle(0x252830, 1); g.fillCircle(x + w / 2, y + h - 8, 6);
        g.fillStyle(0x404850, 1); g.fillCircle(x + w / 2, y + h - 8, 4);
        g.fillStyle(C.monitorGlow, 0.15); g.fillCircle(x + w / 2, y + h - 8, 2);
        break;

      case 'bookshelf_large': {
        shadow(x + 1, y + 1, w - 2, h - 1);
        const bookColors = [C.book1, C.book2, C.book3, C.book4, C.book5];
        g.fillStyle(C.shelfDark, 1); g.fillRoundedRect(x, y, w, h, 2);
        g.fillStyle(C.shelf, 1); g.fillRect(x + 2, y + 2, w - 4, h - 4);
        const shelfH = Math.floor(h / 4);
        for (let s = 0; s < 4; s++) {
          const sy = y + 2 + s * shelfH;
          g.fillStyle(C.shelfHL, 1); g.fillRect(x + 2, sy + shelfH - 2, w - 4, 2);
          g.fillStyle(C.shelfDark, 0.3); g.fillRect(x + 2, sy + shelfH - 3, w - 4, 1);
          let bx = x + 4;
          const maxBooks = Math.floor((w - 8) / 6);
          for (let b = 0; b < maxBooks; b++) {
            const bw = 3 + (b % 3);
            const bh2 = shelfH - 5 - (b % 2) * 2;
            g.fillStyle(bookColors[(b + s * 3) % bookColors.length], 1);
            g.fillRect(bx, sy + shelfH - 2 - bh2, bw, bh2);
            g.fillStyle(0xffffff, 0.12); g.fillRect(bx, sy + shelfH - 2 - bh2, 1, bh2);
            g.fillStyle(0x000000, 0.08); g.fillRect(bx + bw - 1, sy + shelfH - 2 - bh2, 1, bh2);
            bx += bw + 1;
            if (bx > x + w - 5) break;
          }
        }
        break;
      }

      case 'desk_plant':
        g.fillStyle(C.potDark, 1); g.fillRoundedRect(x + w / 2 - 4, y + h - 5, 8, 5, 2);
        g.fillStyle(C.pot, 1); g.fillRoundedRect(x + w / 2 - 5, y + h - 6, 10, 6, 2);
        g.fillStyle(C.plantDark, 1); g.fillEllipse(x + w / 2, y + h - 10, 12, 10);
        g.fillStyle(C.plant, 1); g.fillEllipse(x + w / 2 - 1, y + h - 12, 9, 8);
        g.fillStyle(C.plantHL, 0.7); g.fillEllipse(x + w / 2 - 2, y + h - 14, 5, 4);
        break;

      case 'whiteboard':
        shadow(x + 2, y + 2, w - 4, h - 4);
        g.fillStyle(C.walnut, 1); g.fillRoundedRect(x + 1, y + 2, w - 2, h - 3, 2);
        g.fillStyle(0xf8f8f4, 1); g.fillRect(x + 3, y + 4, w - 6, h - 7);
        g.fillStyle(0xffffff, 0.15); g.fillRect(x + 3, y + 4, w - 6, 3);
        g.lineStyle(1, 0x4a6090, 0.4);
        g.lineBetween(x + 6, y + 8, x + 28, y + 8);
        g.lineBetween(x + 6, y + 12, x + 20, y + 12);
        g.lineStyle(1, 0xc04040, 0.3);
        g.lineBetween(x + w - 20, y + 8, x + w - 8, y + 8);
        g.fillStyle(C.walnut, 1); g.fillRect(x + 4, y + h - 3, w - 8, 2);
        g.fillStyle(0xcc3333, 0.8); g.fillRect(x + 6, y + h - 4, 6, 3);
        g.fillStyle(0x3366cc, 0.8); g.fillRect(x + 14, y + h - 4, 6, 3);
        break;

      default:
        shadow(x + 2, y + 2, w - 4, h - 4);
        g.fillStyle(C.desk, 1); g.fillRoundedRect(x + 2, y + 2, w - 4, h - 4, 4);
        g.lineStyle(1, C.deskDark, 0.5); g.strokeRoundedRect(x + 2, y + 2, w - 4, h - 4, 4);
    }
  }

  drawZoneLabels(ts) {
    ROOM_CONFIG.zones.forEach(z => {
      // Subtle zone tint fill
      const g = this.add.graphics();
      g.fillStyle(z.color, 0.04);
      g.fillRect(z.x * ts, z.y * ts, z.width * ts, z.height * ts);
      g.lineStyle(1, z.color, 0.18);
      g.strokeRect(z.x * ts, z.y * ts, z.width * ts, z.height * ts);
    });
  }

  buildCollisionMap() {
    this.blocked = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(false));

    FURNITURE.forEach(f => {
      if (PASSABLE_FURNITURE.has(f.type)) return;
      const fw = f.w || 1, fh = f.h || 1;
      for (let dy = 0; dy < fh; dy++) {
        for (let dx = 0; dx < fw; dx++) {
          const tx = f.x + dx, ty = f.y + dy;
          if (tx >= 0 && tx < MAP_WIDTH && ty >= 0 && ty < MAP_HEIGHT) {
            this.blocked[ty][tx] = true;
          }
        }
      }
    });

    // Wall edge collision: prevents crossing between adjacent tiles.
    // vWall "x,y" = can't cross horizontally between column x-1 and column x at row y
    // hWall "x,y" = can't cross vertically between row y-1 and row y at column x
    this.vWall = new Set();
    this.hWall = new Set();

    // Vertical walls with wide door openings
    const vSegments = [
      { x: 5,  y1: 0, y2: 5,  doors: [[2, 5]] },       // kitchen|corridor
      { x: 14, y1: 0, y2: 5,  doors: [[1, 5]] },       // living|right area (mostly open)
      { x: 19, y1: 0, y2: 4,  doors: [[1, 4]] },       // area|garden (mostly open)
      { x: 6,  y1: 9, y2: 17, doors: [[10, 15]] },     // bedroom|hall (wide doorway)
      { x: 22, y1: 9, y2: 17, doors: [[10, 15]] },     // hall|office (wide doorway)
    ];
    vSegments.forEach(seg => {
      for (let y = seg.y1; y <= seg.y2; y++) {
        const isDoor = seg.doors.some(([d1, d2]) => y >= d1 && y <= d2);
        if (!isDoor) this.vWall.add(`${seg.x},${y}`);
      }
    });

    // Horizontal walls with wide door openings
    const hSegments = [
      { y: 6, x1: 0, x2: 18, doors: [[2, 18]] },       // top rooms→hall (almost fully open)
      { y: 9, x1: 0, x2: 5,  doors: [[2, 5]] },        // hall→bedroom
      { y: 9, x1: 22, x2: 25, doors: [[22, 25]] },     // hall→office (whiteboard blocks tiles anyway)
    ];
    hSegments.forEach(seg => {
      for (let x = seg.x1; x <= seg.x2; x++) {
        const isDoor = seg.doors.some(([d1, d2]) => x >= d1 && x <= d2);
        if (!isDoor) this.hWall.add(`${x},${seg.y}`);
      }
    });
  }

  findSpawnTile(preferX, preferY) {
    if (!this.blocked[preferY]?.[preferX]) return { x: preferX, y: preferY };
    for (let r = 1; r < Math.max(MAP_WIDTH, MAP_HEIGHT); r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const tx = preferX + dx, ty = preferY + dy;
          if (tx >= 0 && tx < MAP_WIDTH && ty >= 0 && ty < MAP_HEIGHT && !this.blocked[ty][tx]) {
            return { x: tx, y: ty };
          }
        }
      }
    }
    return { x: preferX, y: preferY };
  }

  canMoveTo(fromX, fromY, toX, toY) {
    if (toX < 0 || toX >= MAP_WIDTH || toY < 0 || toY >= MAP_HEIGHT) return false;
    if (this.blocked[toY][toX]) return false;

    const dx = toX - fromX, dy = toY - fromY;
    if (dx === 1 && this.vWall.has(`${toX},${fromY}`)) return false;
    if (dx === -1 && this.vWall.has(`${fromX},${fromY}`)) return false;
    if (dy === 1 && this.hWall.has(`${fromX},${toY}`)) return false;
    if (dy === -1 && this.hWall.has(`${fromX},${fromY}`)) return false;

    for (const pos of Object.values(this.avatarGridPos)) {
      if (pos.x === toX && pos.y === toY) return false;
    }
    return true;
  }

  shortName(name) {
    const n = (name || 'Partner').trim();
    if (n.includes('@')) return n.split('@')[0];
    return n.length > 12 ? n.slice(0, 10) + '…' : n;
  }

  drawNameBubble(scene, name) {
    const displayName = this.shortName(name);
    const padding = 10, iconW = 14, bh = 22;
    const nameY = -AVATAR_PIXEL_SIZE - 10;
    const text = scene.add.text(0, 0, displayName, { fontSize: 11, fontFamily: '"Inter", system-ui', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5);
    const bw = Math.max(70, text.width + iconW + padding * 2);
    const g = scene.add.graphics();
    const left = -bw / 2, top = nameY - bh;
    text.setPosition(left + iconW + 6, nameY - bh / 2);
    g.fillStyle(0x5b21b6, 0.95); g.fillRoundedRect(left, top, bw, bh, 11);
    g.lineStyle(1, 0x7c3aed, 0.9); g.strokeRoundedRect(left, top, bw, bh, 11);
    g.fillStyle(0xffffff, 0.9); g.fillCircle(left + 11, nameY - bh / 2, 5);
    g.fillStyle(0xffffff, 0.5); g.fillEllipse(left + 11, nameY - bh / 2 + 6, 8, 4);
    g.fillStyle(0x5b21b6, 0.95); g.fillTriangle(-4, nameY - 4, 4, nameY - 4, 0, nameY + 2);
    return { g, text, bw };
  }

  createAvatar(px, py, paletteKey, name, isMe) {
    const container = this.add.container(px, py);
    const sprite = drawPixelCharacter(this, -AVATAR_WIDTH / 2, -AVATAR_PIXEL_SIZE, paletteKey, 'down');
    container.add(sprite);
    container.setData('sprite', sprite);
    container.setData('paletteKey', paletteKey);
    if (isMe) {
      const ring = this.add.graphics();
      ring.lineStyle(3, 0x60a5fa, 0.85);
      ring.strokeCircle(0, -AVATAR_PIXEL_SIZE / 2, AVATAR_PIXEL_SIZE / 2 + 4);
      container.addAt(ring, 0);
    }
    const { g: bubble, text } = this.drawNameBubble(this, name);
    container.add([bubble, text]);
    container.setData('bubble', bubble);
    container.setData('label', text);
    container.setData('labelText', name);
    return container;
  }

  setAvatarDirection(container, direction) {
    const sprite = container.getData('sprite');
    const paletteKey = container.getData('paletteKey') || 'amber';
    if (sprite) sprite.destroy();
    const newSprite = drawPixelCharacter(this, -AVATAR_WIDTH / 2, -AVATAR_PIXEL_SIZE, paletteKey, direction);
    container.addAt(newSprite, 0);
    container.setData('sprite', newSprite);
  }

  restorePositions(positions) {
    if (!positions || typeof positions !== 'object') return;
    Object.entries(positions).forEach(([userId, raw]) => {
      if (userId === this.myUserId) return;
      try {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        this.updateOrCreateAvatar(userId, data.name, data.x, data.y, data.direction);
      } catch (_) { }
    });
  }

  updateOrCreateAvatar(userId, name, x, y, direction) {
    if (userId === this.myUserId) return;
    const ts = this.tileSize;
    let avatar = this.avatars[userId];
    const px = x * ts + ts / 2, py = y * ts + ts / 2;
    if (!avatar) {
      const palettes = CHARACTER_PALETTES.filter(p => p !== 'amber');
      const paletteKey = palettes[Object.keys(this.avatars).length % palettes.length];
      avatar = this.createAvatar(px, py, paletteKey, name || 'Partner', false);
      this.avatars[userId] = avatar;
    }
    avatar.setPosition(px, py);
    this.avatarGridPos[userId] = { x, y };
    if (direction) this.setAvatarDirection(avatar, direction);
  }

  removeAvatar(userId) {
    const avatar = this.avatars[userId];
    if (avatar) { avatar.destroy(); delete this.avatars[userId]; }
    delete this.avatarGridPos[userId];
  }

  onRemoteMove(data) {
    this.updateOrCreateAvatar(data.userId, data.name, data.x, data.y, data.direction);
  }

  getGridPosition() {
    const ts = this.tileSize;
    return {
      x: Math.max(0, Math.min(Math.floor(this.myAvatar.x / ts), this.mapWidth - 1)),
      y: Math.max(0, Math.min(Math.floor(this.myAvatar.y / ts), this.mapHeight - 1)),
    };
  }

  update(time) {
    const ts = this.tileSize;
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.wasd.left.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
    else if (this.cursors.up.isDown || this.wasd.up.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) dy = 1;
    if (dx === 0 && dy === 0) return;

    const dir = dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : 'right';
    if (dir !== this.myDirection) {
      this.myDirection = dir;
      this.setAvatarDirection(this.myAvatar, dir);
    }
    if (time - this.lastMove < this.MOVE_THROTTLE) return;
    this.lastMove = time;

    const { x: gx, y: gy } = this.getGridPosition();
    const nx = gx + dx;
    const ny = gy + dy;
    if (!this.canMoveTo(gx, gy, nx, ny)) return;
    this.myAvatar.x = nx * ts + ts / 2;
    this.myAvatar.y = ny * ts + ts / 2;
    if (this.socket) this.socket.emit('move', { x: nx, y: ny, direction: dir });
    this.checkZone(nx, ny);
  }

  checkZone(gx, gy) {
    let inZone = null;
    for (const z of ROOM_CONFIG.zones) {
      if (gx >= z.x && gx < z.x + z.width && gy >= z.y && gy < z.y + z.height) {
        inZone = z.id;
        break;
      }
    }
    if (inZone === this.currentZone) return;
    if (this.currentZone && this.socket) {
      this.socket.emit('zone:leave', { zone: this.currentZone });
      if (this.socket._zoneCallback) this.socket._zoneCallback(null);
    }
    this.currentZone = inZone;
    if (inZone && this.socket) {
      this.socket.emit('zone:enter', { zone: inZone });
      if (this.socket._zoneCallback) this.socket._zoneCallback(inZone);
    }
  }
}
