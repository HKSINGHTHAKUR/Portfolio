'use client'

/**
 * CommunicationCore — the QUANTUM COMMUNICATION CORE: the heart of HK Galaxy.
 *
 * The unmistakable visual focus: a large circular relay with rotating
 * transmission rings, concentric communication circles, expanding signal-wave
 * pulses, signal-frequency ripples, a slow radar sweep arm, and an energy
 * pulse every ~4 seconds. Sized and lit to instantly draw the eye on entry.
 *
 * Pure CSS, GPU-composited (transform/opacity only) — no shaders, no canvas.
 * Reads as a NASA Deep Space Network dish crossed with a sci-fi relay.
 */
export default function CommunicationCore() {
  return (
    <div className="cx-core" aria-hidden="true">
      {/* Projection haze */}
      <span className="cx-core-haze" />

      {/* Concentric communication circles */}
      <span className="cx-circle cx-circle-1" />
      <span className="cx-circle cx-circle-2" />
      <span className="cx-circle cx-circle-3" />

      {/* Signal-frequency ripples — faint fast-ish rings near the core */}
      <span className="cx-freq" style={{ animationDelay: '0s' }} />
      <span className="cx-freq" style={{ animationDelay: '1.3s' }} />

      {/* Expanding signal-wave pulses (staggered, slow) */}
      <span className="cx-wave" style={{ animationDelay: '0s' }} />
      <span className="cx-wave" style={{ animationDelay: '2s' }} />
      <span className="cx-wave" style={{ animationDelay: '4s' }} />

      {/* Rotating transmission rings */}
      <span className="cx-ring cx-ring-a" />
      <span className="cx-ring cx-ring-b" />
      <span className="cx-ring cx-ring-c" />

      {/* Radar sweep arm — slow rotation */}
      <span className="cx-radar">
        <span className="cx-radar-arm" />
      </span>

      {/* Core body + energy pulse (every ~4s) */}
      <span className="cx-core-body">
        <span className="cx-core-pulse" />
        <span className="cx-core-energy" />
        <span className="cx-core-glyph font-mono">QCC</span>
        <span className="cx-core-sub font-mono">Quantum Comm Core</span>
      </span>
    </div>
  )
}
