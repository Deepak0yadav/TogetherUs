/**
 * Gather Town-quality pixel art avatars — 16×24 logical pixels, drawn at 3× scale = 48×72px on screen
 * Each avatar has: hair, face (eyes, nose), skin, body (shirt), arms, pants, shoes
 *
 * Pixel key:
 *   0  = transparent
 *   1  = hair (dark)
 *   2  = skin
 *   3  = shirt (main color)
 *   4  = pants
 *   5  = shoes
 *   6  = eyes (dark)
 *   7  = hair highlight
 *   8  = shirt shadow
 *   9  = skin shadow (neck/cheek)
 *   10 = shirt highlight
 */

const W = 16; // logical width
const H = 24; // logical height

// Helper: pad/trim to W
function r(...cells) {
  const row = Array(W).fill(0);
  cells.forEach((v, i) => { if (i < W) row[i] = v; });
  return row;
}

// ─── FACING DOWN ─────────────────────────────────────────────────────────────
const DOWN_GRID = [
  // Hair top
  r(0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0),
  r(0, 0, 0, 1, 7, 7, 7, 7, 7, 7, 1, 1, 0, 0, 0, 0),
  r(0, 0, 1, 7, 7, 7, 7, 7, 7, 7, 7, 1, 1, 0, 0, 0),
  // Face
  r(0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0),
  r(0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0),
  r(0, 0, 1, 2, 6, 2, 2, 2, 2, 2, 6, 2, 1, 0, 0, 0), // eyes
  r(0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0),
  r(0, 0, 1, 9, 2, 2, 2, 9, 2, 2, 2, 9, 1, 0, 0, 0), // cheeks + subtle mouth
  // Hair sides
  r(0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0),
  r(0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0),
  // Neck + shoulders
  r(0, 0, 0, 0, 3, 9, 9, 9, 9, 9, 3, 0, 0, 0, 0, 0),
  r(0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0),
  // Body (shirt)
  r(0, 2, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 2, 0, 0), // arms
  r(0, 2, 3, 3, 10, 3, 3, 3, 3, 10, 3, 3, 3, 2, 0, 0),
  r(0, 2, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 2, 0, 0),
  r(0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0),
  // Waist
  r(0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0),
  // Pants / legs
  r(0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0),
  // Shoes
  r(0, 0, 5, 5, 5, 5, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0),
  r(0, 5, 5, 5, 5, 5, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0),
  r(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
];

// ─── FACING UP ───────────────────────────────────────────────────────────────
const UP_GRID = [
  // Hair back of head (all hair, no face)
  r(0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0),
  r(0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0),
  r(0, 0, 1, 1, 7, 7, 7, 7, 7, 7, 1, 1, 1, 0, 0, 0),
  r(0, 0, 1, 1, 7, 7, 7, 7, 7, 7, 1, 1, 1, 0, 0, 0),
  r(0, 0, 1, 1, 7, 7, 7, 7, 7, 7, 1, 1, 1, 0, 0, 0),
  r(0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0),
  r(0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0),
  r(0, 0, 0, 1, 1, 1, 9, 9, 9, 1, 1, 1, 0, 0, 0, 0), // neck skin peek
  r(0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0),
  r(0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0),
  // Neck
  r(0, 0, 0, 0, 3, 9, 9, 9, 9, 9, 3, 0, 0, 0, 0, 0),
  r(0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0),
  r(0, 2, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 2, 0, 0),
  r(0, 2, 3, 3, 10, 3, 3, 3, 3, 10, 3, 3, 3, 2, 0, 0),
  r(0, 2, 8, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 2, 0, 0),
  r(0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0),
  r(0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0),
  r(0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 5, 5, 5, 5, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0),
  r(0, 5, 5, 5, 5, 5, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0),
  r(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
];

// ─── FACING LEFT ─────────────────────────────────────────────────────────────
const LEFT_GRID = [
  r(0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 0, 0, 1, 7, 7, 7, 7, 1, 0, 0, 0),
  r(0, 0, 0, 0, 0, 0, 1, 7, 7, 7, 7, 7, 1, 0, 0, 0),
  r(0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0),
  r(0, 0, 0, 0, 0, 0, 1, 2, 6, 2, 2, 2, 1, 0, 0, 0), // eye
  r(0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0),
  r(0, 0, 0, 0, 0, 0, 1, 2, 9, 2, 2, 9, 1, 0, 0, 0), // mouth
  r(0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 1, 1, 1, 0, 0, 0),
  r(0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 0, 0, 3, 9, 9, 3, 0, 0, 0, 0, 0), // neck
  r(0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0),
  r(2, 2, 2, 0, 0, 3, 3, 3, 10, 3, 3, 3, 0, 0, 0, 0), // left arm out
  r(2, 2, 2, 0, 0, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0),
  r(0, 2, 2, 0, 0, 8, 3, 3, 3, 3, 3, 8, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 4, 4, 0, 4, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 4, 4, 0, 4, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 4, 4, 0, 4, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 4, 4, 0, 4, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 4, 4, 0, 4, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 5, 5, 5, 0, 5, 5, 5, 0, 0, 0, 0, 0),
  r(0, 0, 0, 5, 5, 5, 5, 0, 5, 5, 5, 5, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
];

// ─── FACING RIGHT ────────────────────────────────────────────────────────────
const RIGHT_GRID = [
  r(0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0),
  r(0, 0, 0, 1, 7, 7, 7, 7, 1, 0, 0, 0, 0, 0, 0, 0),
  r(0, 0, 0, 1, 7, 7, 7, 7, 7, 1, 0, 0, 0, 0, 0, 0),
  r(0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0),
  r(0, 0, 0, 1, 2, 2, 2, 6, 2, 1, 0, 0, 0, 0, 0, 0), // eye
  r(0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0),
  r(0, 0, 0, 1, 9, 2, 2, 9, 2, 1, 0, 0, 0, 0, 0, 0), // mouth
  r(0, 0, 0, 1, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 3, 9, 9, 3, 0, 0, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 3, 3, 3, 10, 3, 3, 0, 2, 2, 2, 0, 0),
  r(0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 2, 2, 2, 0, 0),
  r(0, 0, 0, 0, 8, 3, 3, 3, 3, 8, 0, 2, 2, 0, 0, 0),
  r(0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 4, 4, 4, 0, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 4, 4, 4, 0, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 4, 4, 4, 0, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 4, 4, 4, 0, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 4, 4, 4, 0, 4, 4, 0, 0, 0, 0, 0),
  r(0, 0, 0, 0, 0, 5, 5, 5, 0, 5, 5, 5, 0, 0, 0, 0),
  r(0, 0, 0, 0, 5, 5, 5, 5, 0, 5, 5, 5, 5, 0, 0, 0),
  r(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
];

function ensureGrid(grid) {
  const out = [];
  for (let i = 0; i < H; i++) {
    const r = grid[i];
    out.push(Array.isArray(r) && r.length >= W ? r.slice(0, W) : Array(W).fill(0));
  }
  return out;
}

const SPRITES = {
  down: ensureGrid(DOWN_GRID),
  up: ensureGrid(UP_GRID),
  left: ensureGrid(LEFT_GRID),
  right: ensureGrid(RIGHT_GRID),
};

// Gather Town-quality palettes — shirt, pants, shoes, hair, skin must all harmonize
export const PALETTES = {
  amber: {
    hair: 0x3d2b1f, hairHL: 0x6b4226,
    skin: 0xf5c5a3, skinShadow: 0xe8a882,
    eye: 0x2c1810,
    shirt: 0x3b82f6, shirtShadow: 0x2563eb, shirtHL: 0x60a5fa,
    pants: 0x1e3a5f,
    shoes: 0x1c1917,
  },
  rose: {
    hair: 0x7c1d4e, hairHL: 0xb45c82,
    skin: 0xfcd5b8, skinShadow: 0xf0a878,
    eye: 0x1a0a10,
    shirt: 0xf472b6, shirtShadow: 0xdb2777, shirtHL: 0xfca5c0,
    pants: 0x4c1d35,
    shoes: 0x1a0a10,
  },
  teal: {
    hair: 0x1a3340, hairHL: 0x2d6070,
    skin: 0xe8d5b8, skinShadow: 0xd4b890,
    eye: 0x0a1820,
    shirt: 0x14b8a6, shirtShadow: 0x0d9488, shirtHL: 0x5eead4,
    pants: 0x134e4a,
    shoes: 0x0d1a1a,
  },
  violet: {
    hair: 0x2d1b69, hairHL: 0x5b3b9e,
    skin: 0xf0d8c8, skinShadow: 0xd4b09b,
    eye: 0x1a0d3d,
    shirt: 0x8b5cf6, shirtShadow: 0x7c3aed, shirtHL: 0xc4b5fd,
    pants: 0x2e1065,
    shoes: 0x1a0d3d,
  },
  sage: {
    hair: 0x1a2e1a, hairHL: 0x3d6b3d,
    skin: 0xdde8c8, skinShadow: 0xb8cc98,
    eye: 0x0d1a0d,
    shirt: 0x4ade80, shirtShadow: 0x16a34a, shirtHL: 0x86efac,
    pants: 0x14532d,
    shoes: 0x0d1a0d,
  },
  coral: {
    hair: 0x4a1c1c, hairHL: 0x8b4040,
    skin: 0xfbd0aa, skinShadow: 0xf0a87a,
    eye: 0x2c1010,
    shirt: 0xf97316, shirtShadow: 0xea580c, shirtHL: 0xfb923c,
    pants: 0x431407,
    shoes: 0x1c0a0a,
  },
};

const PIXEL_SCALE = 3; // 3× gives 48×72px — visible, Gather-quality size

export function drawPixelCharacter(scene, x, y, paletteKey = 'amber', direction = 'down') {
  const pal = PALETTES[paletteKey] || PALETTES.amber;

  // Color lookup by pixel key
  const colorMap = {
    1: pal.hair,
    7: pal.hairHL,
    2: pal.skin,
    9: pal.skinShadow,
    6: pal.eye,
    3: pal.shirt,
    8: pal.shirtShadow,
    10: pal.shirtHL,
    4: pal.pants,
    5: pal.shoes,
  };

  const grid = SPRITES[direction] || SPRITES.down;
  const g = scene.add.graphics();
  g.x = x;
  g.y = y;
  const p = PIXEL_SCALE;

  for (let row = 0; row < H; row++) {
    for (let col = 0; col < W; col++) {
      const cell = grid[row][col];
      if (!cell) continue;
      const color = colorMap[cell];
      if (color === undefined) continue;
      g.fillStyle(color, 1);
      g.fillRect(col * p, row * p, p, p);
    }
  }
  return g;
}

export const AVATAR_PIXEL_SIZE = H * PIXEL_SCALE; // 72px height
export const AVATAR_WIDTH = W * PIXEL_SCALE;       // 48px width
export const CHARACTER_PALETTES = Object.keys(PALETTES);
