'use client'

import {
  useAppStore,
  selectWorldState,
  selectWorldProgress,
  selectActiveWorld,
} from '@/store/useAppStore'
import { PLANETS } from '@/lib/planets'

/**
 * WorldPortalTransition — the cinematic portal that masks every dive→world cut.
 *
 * Driven by `worldProgress` (0..1) during 'entering' and 'exiting'. As the
 * camera pierces the active planet, this overlay blooms to a bright veil that
 * peaks right as the planet fills the frame, then dissolves to reveal the
 * chamber. The bloom is tinted to the ACTIVE planet's glow colour, so Home
 * dives feel indigo and Projects dives feel cyan — one shared system, themed
 * per destination.
 *
 * Pure CSS / GPU-composited. No postprocessing passes.
 */

/** Parse a #rrggbb hex into an "r, g, b" string for rgba() interpolation. */
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

export default function WorldPortalTransition() {
  const worldState  = useAppStore(selectWorldState)
  const progress    = useAppStore(selectWorldProgress)
  const activeWorld = useAppStore(selectActiveWorld)

  // Only render during the dive phases
  if (worldState !== 'entering' && worldState !== 'exiting') return null
  if (!activeWorld) return null

  // Bloom envelope: ramps up with progress, brightest near the end of the
  // dive (planet fills frame). A gentle ease keeps it from flashing harshly.
  const bloom = Math.pow(progress, 1.8)

  const glow = PLANETS[activeWorld].glow
  const rgb  = hexToRgb(glow)

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[45] pointer-events-none"
      style={{
        background:
          `radial-gradient(circle at 50% 50%, ` +
          `rgba(235, 240, 255, ${bloom * 0.5}) 0%, ` +
          `rgba(${rgb}, ${bloom * 0.34}) 28%, ` +
          `rgba(${rgb}, ${bloom * 0.18}) 55%, ` +
          `transparent 75%)`,
        opacity: 0.4 + bloom * 0.6,
        transition: 'opacity 120ms linear',
      }}
    >
      {/* Chromatic edge ring — expands outward with the dive */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width:  `${20 + bloom * 160}vmax`,
          height: `${20 + bloom * 160}vmax`,
          transform: 'translate(-50%, -50%)',
          border: `2px solid rgba(${rgb}, ${bloom * 0.45})`,
          boxShadow: `0 0 80px rgba(${rgb}, ${bloom * 0.5})`,
          opacity: bloom,
        }}
      />
    </div>
  )
}
