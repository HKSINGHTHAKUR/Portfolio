'use client'

import { ACTIVE_TARGET } from '@/lib/missionData'

/**
 * CommandTable — the STRATEGIC COMMAND CORE at the heart of Mission Control.
 *
 * The visual hero: a large holographic command sphere with a slow rotation,
 * cyan energy glow, orbit rings, a soft pulse, internal moving energy lines,
 * and a soft light projection beneath. It reads its active target (Strocter)
 * from mission data so the centre always shows what the universe is focused on.
 *
 * Pure CSS, GPU-composited. Every animation targets transform/opacity only —
 * no shaders, no canvas — so it holds 60fps.
 */
export default function CommandTable() {
  return (
    <div className="mc-table" aria-hidden="true">
      {/* Ambient projection haze under the core */}
      <span className="mc-table-haze" />

      {/* The projected operations disc (tilted in 3D) — the light projection */}
      <span className="mc-disc">
        <span className="mc-disc-grid" />
        <span className="mc-disc-ring mc-disc-ring-1" />
        <span className="mc-disc-ring mc-disc-ring-2" />
        <span className="mc-disc-sweep" />
      </span>

      {/* Orbiting mission markers (slow, evenly spaced on the ring) */}
      <span className="mc-orbit">
        <span className="mc-marker mc-marker-n" />
        <span className="mc-marker mc-marker-e" />
        <span className="mc-marker mc-marker-s" />
        <span className="mc-marker mc-marker-w" />
      </span>

      {/* ── Strategic Command Core — the holographic command sphere ──── */}
      <div className="mc-sphere">
        {/* Vertical orbit rings around the sphere */}
        <span className="mc-sphere-ring mc-sphere-ring-a" />
        <span className="mc-sphere-ring mc-sphere-ring-b" />
        <span className="mc-sphere-ring mc-sphere-ring-c" />

        {/* The glowing body + internal moving energy lines */}
        <span className="mc-sphere-body">
          <span className="mc-sphere-energy" />
          <span className="mc-sphere-shine" />
        </span>

        {/* Soft expanding pulse */}
        <span className="mc-sphere-pulse" />

        {/* Core readout */}
        <div className="mc-sphere-label">
          <span className="mc-sphere-title font-mono">Mission Core</span>
          <span className="mc-sphere-sub font-mono">Active Target</span>
          <span className="mc-sphere-target font-mono">{ACTIVE_TARGET}</span>
        </div>
      </div>
    </div>
  )
}
