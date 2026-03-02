/**
 * TogetherOS — Gather Town-style apartment map
 * 38×24 tiles @ 32px = 1216×768 (spacious layout)
 *
 * Zones: Kitchen | Lounge | Garden (large) | Bedroom | Hall | Office
 */

export const TILE_SIZE = 32;
export const MAP_WIDTH = 38;
export const MAP_HEIGHT = 24;

// Floor type constants
export const FLOOR_WOOD = 0;
export const FLOOR_CARPET = 1;
export const FLOOR_TILE = 2;
export const FLOOR_GRASS = 3;
export const FLOOR_DARK = 4;

export const COLORS = {
  wood: 0xe8dcc8, woodDark: 0xd9ccb4, woodLine: 0xc4b59a, woodAccent: 0xb8a48a,
  carpet: 0x9b7fb6, carpetDark: 0x7a5f96, carpetHL: 0xb898cc,
  tile: 0xd4e0e8, tileDark: 0xb8c8d4, tileLine: 0x9ab0be, tileGrout: 0xa8b8c4,
  grass: 0x6bbf5a, grassDark: 0x509a42, grassMid: 0x7acc68, grassDot: 0x45963a,
  darkWood: 0xb89a72, darkWoodDark: 0x9a7e58, darkWoodLine: 0x7a6040,
  wall: 0x5a6680, wallLight: 0x7a8aa8, wallDark: 0x3a4460, wallboard: 0xd8e0e8, wallTrim: 0xb8c4cc,
  rug: 0xc44c3c, rugDark: 0x9a3428, rugHL: 0xe06050, rugBorder: 0x7a2418, rugPattern: 0xdc8070,
  rugBlue: 0x3a6cbf, rugBlueDark: 0x2a4e8a, rugBlueHL: 0x5a8cdf,
  desk: 0xc4883c, deskDark: 0xa06828, deskTop: 0xdda050, deskHL: 0xeab860, deskLeg: 0x7a5020,
  walnut: 0x6b4423, walnutDark: 0x4e3018, walnutTop: 0x8a5a2e,
  couch: 0x4a6880, couchDark: 0x344e64, couchCushion: 0x6a8aab, couchHL: 0x8aaccc, couchArm: 0x3a5870, couchBack: 0x2a4050, couchLeg: 0x3a3028,
  kitCounter: 0xe0c898, kitCounterDk: 0xc0a878, kitCabinet: 0xdae0e8, kitCabinetDk: 0xb8c0cc, kitCabinetTm: 0x9098a8,
  kitSink: 0xc0c8d0, kitSinkInner: 0xa0b0bc, kitStove: 0x505868, kitStoveTp: 0x383f48,
  bed: 0xf0e8dc, bedSheet: 0xe8d8c8, bedPillow: 0xfafafc, bedFrame: 0x8a6a42, bedFrameDk: 0x6a4e2c, bedBlanket: 0xa8c4d8, bedBlanketDk: 0x7898b2,
  monitor: 0x252830, monitorBez: 0x3a3d48, monitorScr: 0x3a6090, monitorGlow: 0x5a8ab8,
  keyboard: 0x48505c, keyboardKey: 0x60686e, speaker: 0x404850,
  plant: 0x3da832, plantDark: 0x2a8022, plantHL: 0x5acc48,
  pot: 0xc06030, potDark: 0x9a4820, soil: 0x5a3818,
  shelf: 0x9a7a4a, shelfDark: 0x7a5c30, shelfHL: 0xbaa060,
  book1: 0xc44444, book2: 0x4474c4, book3: 0x44a44c, book4: 0xc4a444, book5: 0x9444c4,
  lamp: 0xd8c070, lampShade: 0xe8d898, lampBase: 0x888060,
  tv: 0x282a30, tvScr: 0x2a4878, frame: 0x6a5030,
  rugTeal: 0x3aac9c, rugTealDk: 0x2a8070,
};

// Floor map (38 × 24) — Kitchen | Lounge | Garden (large) | Bedroom | Hall | Office
export const FLOOR_MAP = [
  [2,2,2,2,2,2,2,2,0,0,1,1,1,1,1,1,1,1,1,0,0,0,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0],
  [2,2,2,2,2,2,2,2,0,0,1,1,1,1,1,1,1,1,1,0,0,0,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0],
  [2,2,2,2,2,2,2,2,0,0,1,1,1,1,1,1,1,1,1,0,0,0,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0],
  [2,2,2,2,2,2,2,2,0,0,1,1,1,1,1,1,1,1,1,0,0,0,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0],
  [2,2,2,2,2,2,2,2,0,0,1,1,1,1,1,1,1,1,1,0,0,0,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0],
  [2,2,2,2,2,2,2,2,0,0,1,1,1,1,1,1,1,1,1,0,0,0,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0],
  [2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4],
  [4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4],
  [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4],
  [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4],
  [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4],
  [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4],
  [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4],
  [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Furniture — Gather Town style: larger tables, chairs, garden elements
export const FURNITURE = [
  // Kitchen (enlarged)
  { type: 'kitchen_counter_h', x: 0, y: 0, w: 8, h: 1 },
  { type: 'kitchen_counter_v', x: 0, y: 1, w: 1, h: 6 },
  { type: 'kitchen_sink', x: 2, y: 0, w: 1, h: 1 },
  { type: 'fridge', x: 7, y: 1, w: 1, h: 2 },
  { type: 'kitchen_table', x: 2, y: 3, w: 3, h: 3 },
  { type: 'chair', x: 1, y: 5, w: 1, h: 1 },
  { type: 'chair', x: 2, y: 6, w: 1, h: 1 },
  { type: 'chair_r', x: 4, y: 4, w: 1, h: 1 },
  { type: 'chair_r', x: 5, y: 5, w: 1, h: 1 },

  // Lounge (larger)
  { type: 'tv_stand', x: 12, y: 0, w: 6, h: 1 },
  { type: 'couch_l', x: 10, y: 4, w: 7, h: 3 },
  { type: 'couch_side', x: 17, y: 3, w: 1, h: 4 },
  { type: 'coffee_table', x: 12, y: 4, w: 3, h: 2 },
  { type: 'rug', x: 11, y: 2, w: 7, h: 4 },
  { type: 'lamp_floor', x: 10, y: 2, w: 1, h: 1 },
  { type: 'plant_big', x: 18, y: 0, w: 1, h: 1 },

  // Garden (expanded — 11×6 grass tiles)
  { type: 'balcony_plant_lg', x: 22, y: 0, w: 1, h: 1 },
  { type: 'balcony_plant_lg', x: 28, y: 0, w: 1, h: 1 },
  { type: 'balcony_plant_lg', x: 32, y: 0, w: 1, h: 1 },
  { type: 'balcony_plant', x: 24, y: 2, w: 1, h: 1 },
  { type: 'balcony_plant', x: 30, y: 2, w: 1, h: 1 },
  { type: 'balcony_chair', x: 23, y: 1, w: 1, h: 1 },
  { type: 'balcony_chair', x: 26, y: 1, w: 1, h: 1 },
  { type: 'balcony_chair', x: 29, y: 1, w: 1, h: 1 },
  { type: 'balcony_table', x: 24, y: 1, w: 2, h: 1 },
  { type: 'balcony_table', x: 28, y: 1, w: 2, h: 1 },
  { type: 'stone_path', x: 23, y: 4, w: 5, h: 1 },
  { type: 'balcony_chair', x: 31, y: 2, w: 1, h: 1 },

  // Bedroom
  { type: 'bed_double', x: 0, y: 12, w: 4, h: 5 },
  { type: 'nightstand', x: 4, y: 12, w: 1, h: 1 },
  { type: 'nightstand', x: 4, y: 16, w: 1, h: 1 },
  { type: 'wardrobe', x: 0, y: 10, w: 2, h: 1 },
  { type: 'dresser', x: 5, y: 13, w: 1, h: 2 },
  { type: 'rug_blue', x: 0, y: 16, w: 5, h: 2 },
  { type: 'lamp_table', x: 4, y: 12, w: 1, h: 1 },

  // Office
  { type: 'desk_large', x: 34, y: 12, w: 4, h: 2 },
  { type: 'office_chair', x: 35, y: 14, w: 1, h: 1 },
  { type: 'monitor', x: 34, y: 12, w: 1, h: 1 },
  { type: 'monitor', x: 35, y: 12, w: 1, h: 1 },
  { type: 'monitor', x: 36, y: 12, w: 1, h: 1 },
  { type: 'bookshelf_large', x: 34, y: 17, w: 4, h: 2 },
  { type: 'desk_plant', x: 37, y: 12, w: 1, h: 1 },
  { type: 'speaker', x: 34, y: 12, w: 1, h: 1 },
  { type: 'whiteboard', x: 34, y: 10, w: 4, h: 1 },
];

export const PASSABLE_FURNITURE = new Set([
  'rug', 'rug_blue', 'stone_path',
  'chair', 'chair_r', 'balcony_chair', 'office_chair',
  'couch_l', 'couch_side', 'bed_double',
  'lamp_table', 'lamp_floor', 'desk_plant', 'kitchen_sink',
  'monitor', 'speaker',
]);

// Gather Town-style: furniture interaction types (sit/sleep when standing on tile)
export const SIT_FURNITURE = new Set(['chair', 'chair_r', 'balcony_chair', 'office_chair', 'couch_l', 'couch_side']);
export const SLEEP_FURNITURE = new Set(['bed_double']);

/** Build map of (gx,gy) -> 'sitting' | 'sleeping' for interaction tiles */
export function buildTileEmoteMap() {
  const map = new Map();
  FURNITURE.forEach((f) => {
    let emote = null;
    if (SIT_FURNITURE.has(f.type)) emote = 'sitting';
    else if (SLEEP_FURNITURE.has(f.type)) emote = 'sleeping';
    if (!emote) return;
    const w = f.w || 1, h = f.h || 1;
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        map.set(`${f.x + dx},${f.y + dy}`, emote);
  });
  return map;
}

export const ROOM_CONFIG = {
  zones: [
    { id: 'kitchen', x: 0, y: 0, width: 8, height: 7, label: 'Kitchen', color: 0xf59e0b },
    { id: 'lounge', x: 10, y: 0, width: 9, height: 6, label: 'Lounge', color: 0x8b5cf6 },
    { id: 'garden', x: 22, y: 0, width: 12, height: 6, label: 'Garden', color: 0x22c55e },
    { id: 'bedroom', x: 0, y: 10, width: 7, height: 8, label: 'Bedroom', color: 0xec4899 },
    { id: 'office', x: 34, y: 10, width: 4, height: 8, label: 'Office', color: 0x14b8a6 },
  ],
  defaultTheme: 'day',
};
