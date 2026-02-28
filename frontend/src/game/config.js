/**
 * TogetherOS — Gather Town-quality apartment map config
 * 26×18 tiles @ 32px = 832×576 logical (scales with viewport)
 *
 * Zones (Gather Town style):
 *   TL  = Kitchen/dining area    (tile floor)
 *   TC  = Living/lounge area     (carpet + rug)
 *   TR  = Garden/balcony area    (grass)
 *   BL  = Bedroom area           (carpet)
 *   BC  = Open hall              (wood)
 *   BR  = Office/desk area       (wood)
 */

export const TILE_SIZE = 32;
export const MAP_WIDTH = 26;
export const MAP_HEIGHT = 18;

// Floor type constants
export const FLOOR_WOOD = 0;
export const FLOOR_CARPET = 1;
export const FLOOR_TILE = 2;
export const FLOOR_GRASS = 3;
export const FLOOR_DARK = 4; // dark wood / accent

// ─── Rich Gather Town color palette ──────────────────────────────────────────
export const COLORS = {
  // Floors
  wood: 0xe8dcc8,
  woodDark: 0xd9ccb4,
  woodLine: 0xc4b59a,
  woodAccent: 0xb8a48a,

  carpet: 0x9b7fb6,   // purple-tinted carpet (living room)
  carpetDark: 0x7a5f96,
  carpetHL: 0xb898cc,

  tile: 0xd4e0e8,   // light grey-blue kitchen tile
  tileDark: 0xb8c8d4,
  tileLine: 0x9ab0be,
  tileGrout: 0xa8b8c4,

  grass: 0x6bbf5a,
  grassDark: 0x509a42,
  grassMid: 0x7acc68,
  grassDot: 0x45963a,

  darkWood: 0xb89a72,
  darkWoodDark: 0x9a7e58,
  darkWoodLine: 0x7a6040,

  // Walls
  wall: 0x5a6680,
  wallLight: 0x7a8aa8,
  wallDark: 0x3a4460,
  wallboard: 0xd8e0e8,   // light paint / wainscot
  wallTrim: 0xb8c4cc,

  // Rug / mat
  rug: 0xc44c3c,   // red rug
  rugDark: 0x9a3428,
  rugHL: 0xe06050,
  rugBorder: 0x7a2418,
  rugPattern: 0xdc8070,

  rugBlue: 0x3a6cbf,
  rugBlueDark: 0x2a4e8a,
  rugBlueHL: 0x5a8cdf,

  // Furniture — natural wood
  desk: 0xc4883c,
  deskDark: 0xa06828,
  deskTop: 0xdda050,
  deskHL: 0xeab860,
  deskLeg: 0x7a5020,

  // Furniture — dark walnut
  walnut: 0x6b4423,
  walnutDark: 0x4e3018,
  walnutTop: 0x8a5a2e,

  // Couch
  couch: 0x4a6880,
  couchDark: 0x344e64,
  couchCushion: 0x6a8aab,
  couchHL: 0x8aaccc,
  couchArm: 0x3a5870,
  couchBack: 0x2a4050,
  couchLeg: 0x3a3028,

  // Kitchen
  kitCounter: 0xe0c898,
  kitCounterDk: 0xc0a878,
  kitCabinet: 0xdae0e8,
  kitCabinetDk: 0xb8c0cc,
  kitCabinetTm: 0x9098a8,
  kitSink: 0xc0c8d0,
  kitSinkInner: 0xa0b0bc,
  kitStove: 0x505868,
  kitStoveTp: 0x383f48,
  kitStoveBrn: 0x8B4513,

  // Bed
  bed: 0xf0e8dc,
  bedSheet: 0xe8d8c8,
  bedPillow: 0xfafafc,
  bedFrame: 0x8a6a42,
  bedFrameDk: 0x6a4e2c,
  bedBlanket: 0xa8c4d8,
  bedBlanketDk: 0x7898b2,

  // Monitor / tech
  monitor: 0x252830,
  monitorBez: 0x3a3d48,
  monitorScr: 0x3a6090,
  monitorGlow: 0x5a8ab8,
  keyboard: 0x48505c,
  keyboardKey: 0x60686e,
  speaker: 0x404850,

  // Plants
  plant: 0x3da832,
  plantDark: 0x2a8022,
  plantHL: 0x5acc48,
  pot: 0xc06030,
  potDark: 0x9a4820,
  soil: 0x5a3818,

  // Bookshelves
  shelf: 0x9a7a4a,
  shelfDark: 0x7a5c30,
  shelfHL: 0xbaa060,
  book1: 0xc44444,
  book2: 0x4474c4,
  book3: 0x44a44c,
  book4: 0xc4a444,
  book5: 0x9444c4,

  // Misc decoration
  lamp: 0xd8c070,
  lampShade: 0xe8d898,
  lampBase: 0x888060,
  tv: 0x282a30,
  tvScr: 0x2a4878,
  frame: 0x6a5030,
  frameHL: 0x8a6848,

  // Rug teal
  rugTeal: 0x3aac9c,
  rugTealDk: 0x2a8070,
};

// ─── Floor map (26 × 18) ─────────────────────────────────────────────────────
// 0=wood, 1=carpet(purple), 2=tile, 3=grass, 4=darkWood
export const FLOOR_MAP = [
  //  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25
  [2, 2, 2, 2, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0], // row 0
  [2, 2, 2, 2, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0], // row 1
  [2, 2, 2, 2, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0], // row 2
  [2, 2, 2, 2, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0], // row 3
  [2, 2, 2, 2, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0], // row 4
  [2, 2, 2, 2, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 5
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 6
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 7
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 8
  [4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 9
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4], // row 10
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4], // row 11
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4], // row 12
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4], // row 13
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4], // row 14
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4], // row 15
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 16
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 17
];

// ─── Furniture list ───────────────────────────────────────────────────────────
// Each entry: { type, x, y, w, h }  (x/y in tile coordinates)
export const FURNITURE = [
  // ── Kitchen area (top-left, tile floor) ───────────────────────────────────
  { type: 'kitchen_counter_h', x: 0, y: 0, w: 5, h: 1 },   // top wall counter
  { type: 'kitchen_counter_v', x: 0, y: 1, w: 1, h: 4 },   // left wall counter + stove
  { type: 'kitchen_sink', x: 1, y: 0, w: 1, h: 1 },   // sink inset in counter
  { type: 'fridge', x: 4, y: 1, w: 1, h: 2 },
  { type: 'kitchen_table', x: 1, y: 2, w: 2, h: 2 },
  { type: 'chair', x: 1, y: 4, w: 1, h: 1 },
  { type: 'chair_r', x: 3, y: 3, w: 1, h: 1 },

  // ── Living room / lounge (top-center, carpet) ──────────────────────────────
  { type: 'tv_stand', x: 8, y: 0, w: 4, h: 1 },
  { type: 'couch_l', x: 7, y: 3, w: 5, h: 2 },  // large L-couch
  { type: 'couch_side', x: 12, y: 2, w: 1, h: 3 },
  { type: 'coffee_table', x: 9, y: 3, w: 2, h: 1 },
  { type: 'rug', x: 8, y: 2, w: 5, h: 3 },
  { type: 'lamp_floor', x: 7, y: 1, w: 1, h: 1 },
  { type: 'plant_big', x: 13, y: 0, w: 1, h: 1 },

  // ── Garden / balcony (top-right, grass) ────────────────────────────────────
  { type: 'balcony_plant', x: 19, y: 0, w: 1, h: 1 },
  { type: 'balcony_plant_lg', x: 24, y: 0, w: 1, h: 1 },
  { type: 'balcony_plant', x: 21, y: 2, w: 1, h: 1 },
  { type: 'balcony_chair', x: 20, y: 1, w: 1, h: 1 },
  { type: 'balcony_chair', x: 22, y: 1, w: 1, h: 1 },
  { type: 'balcony_table', x: 21, y: 1, w: 1, h: 1 },
  { type: 'stone_path', x: 20, y: 3, w: 3, h: 1 },

  // ── Bedroom (bottom-left, carpet) ─────────────────────────────────────────
  { type: 'bed_double', x: 0, y: 10, w: 3, h: 4 },
  { type: 'nightstand', x: 3, y: 10, w: 1, h: 1 },
  { type: 'nightstand', x: 3, y: 13, w: 1, h: 1 },
  { type: 'wardrobe', x: 0, y: 9, w: 2, h: 1 },
  { type: 'dresser', x: 4, y: 11, w: 1, h: 2 },
  { type: 'rug_blue', x: 0, y: 13, w: 4, h: 2 },
  { type: 'lamp_table', x: 3, y: 10, w: 1, h: 1 },

  // ── Office / desk area (bottom-right, dark wood) ───────────────────────────
  { type: 'desk_large', x: 22, y: 10, w: 4, h: 2 },
  { type: 'office_chair', x: 23, y: 12, w: 1, h: 1 },
  { type: 'monitor', x: 23, y: 10, w: 1, h: 1 },
  { type: 'monitor', x: 24, y: 10, w: 1, h: 1 },
  { type: 'bookshelf_large', x: 22, y: 14, w: 4, h: 2 },
  { type: 'desk_plant', x: 25, y: 10, w: 1, h: 1 },
  { type: 'speaker', x: 22, y: 10, w: 1, h: 1 },
  { type: 'whiteboard', x: 22, y: 9, w: 4, h: 1 },
];

// ─── Passable furniture (player can walk over these) ─────────────────────────
export const PASSABLE_FURNITURE = new Set([
  'rug', 'rug_blue', 'stone_path',
  'chair', 'chair_r', 'balcony_chair', 'office_chair',
  'lamp_table', 'lamp_floor', 'desk_plant', 'kitchen_sink',
  'monitor', 'speaker',
]);

// ─── Interaction zones ────────────────────────────────────────────────────────
export const ROOM_CONFIG = {
  zones: [
    { id: 'kitchen', x: 0, y: 0, width: 5, height: 5, label: '🍳 Kitchen', color: 0xf59e0b },
    { id: 'lounge', x: 7, y: 0, width: 7, height: 6, label: '🛋️ Lounge', color: 0x8b5cf6 },
    { id: 'garden', x: 19, y: 0, width: 6, height: 5, label: '🌿 Garden', color: 0x22c55e },
    { id: 'bedroom', x: 0, y: 9, width: 6, height: 7, label: '🛏️ Bedroom', color: 0xec4899 },
    { id: 'office', x: 22, y: 9, width: 4, height: 7, label: '💻 Office', color: 0x14b8a6 },
  ],
  defaultTheme: 'day',
};
