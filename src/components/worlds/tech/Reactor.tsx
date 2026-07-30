'use client'

/**
 * Reactor — the giant holographic engineering reactor at the heart of the
 * Engineering Forge. It is the visual hero: a slowly rotating core with
 * orbiting rings, an energy pulse, and data beams.
 *
 * Pure CSS, GPU-composited. Every animation targets transform/opacity only —
 * the rings rotate, the core breathes, the beams sweep — so it stays at 60fps
 * with no shaders, no canvas, no per-frame work. Sits behind the artifacts.
 */
export default function Reactor() {
  return (
    <div className="forge-reactor" aria-hidden="true">
      {/* Ambient energy field behind the core */}
      <span className="forge-reactor-haze" />

      {/* Data beams radiating outward (static spokes, slow opacity pulse) */}
      <span className="forge-reactor-beams" />

      {/* Orbiting rings — different sizes, speeds, and tilts */}
      <span className="forge-ring forge-ring-1" />
      <span className="forge-ring forge-ring-2" />
      <span className="forge-ring forge-ring-3" />

      {/* The core — layered glow + a rotating energy gradient */}
      <span className="forge-core">
        <span className="forge-core-swirl" />
        <span className="forge-core-pulse" />
        <span className="forge-core-label font-mono">HK·CORE</span>
      </span>
    </div>
  )
}
