# Optional: Gather Town–style assets

To make the map look **exactly** like Gather Town, you can add 32×32 PNG assets here. The game will use them if present.

## Recommended (free) packs

- **Pixel Art Top Down - Basic** (Cainos, itch.io) – name your price $0  
  - 32×32 tiles and characters, very Gather-like
- **Pipoya FREE RPG Tileset 32x32** (itch.io)  
- **Gather.town Compatible** collections on itch.io – search “Gathertown compatible”

## Files (place in `public/`)

| File            | Description                    | Size   |
|-----------------|--------------------------------|--------|
| `tileset.png`   | Floor + furniture tiles        | 32×32 per tile, grid layout |
| `characters.png`| Character sprites (optional)   | 32×32 per frame, 4 directions |

If only `tileset.png` is present, the game will use it for floors; characters stay built-in.  
If `characters.png` is present and valid, it can be used for avatars (see game config).

## Built-in style

The UI uses Gather-style purple name tag and light wood floor. With no extra files, **built-in pixel art** (32×32 characters, tile colors, and furniture) that mimics Gather’s look. Add the files above only if you want custom art.
