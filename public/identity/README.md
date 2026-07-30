# HK Core World — holographic presence asset

The HK Core World (Home World) renders the operator as a **hologram**, not a
photo. To use a real likeness, drop a **background-removed, transparent PNG
cutout** of the subject here:

```
public/identity/harsh-hologram.png
```

## Requirements for the source cutout

- Format: PNG with a **transparent background** (alpha channel).
- Subject only: remove the entire original background — mall, railings,
  lighting, floor, people, all architecture. Isolate just the person.
- Framing: full standing figure, centered, generous transparent margins.
- Resolution: ~1000–1600px tall is plenty (it's displayed small and tinted).

The app then treats this cutout as a hologram automatically — cyan duotone,
chromatic indigo/cyan edge separation, scan lines, edge bloom, and slight
transparency. **The raw photo is never shown**: there is no rectangular frame,
no card, and the original colors are fully recolored by the holographic
treatment in `src/components/worlds/home/HoloPresence.tsx`.

## No asset? No problem.

Until this file exists (or if it fails to load), the world renders a dignified
abstract **identity core** — concentric energy rings + an HK sigil — so the
experience is always complete and never shows a generic placeholder figure.

## How to produce the cutout

Use any background remover (e.g. remove.bg, Photoshop "Remove Background",
or `rembg`), export as PNG with transparency, name it `harsh-hologram.png`,
and place it in this folder. The hologram appears on the next load.
