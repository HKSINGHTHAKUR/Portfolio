'use client'

import HoloPortrait from './HoloPortrait'

/**
 * IdentityReconstruction — the LEFT side of HK Core: the architect's identity
 * module, presented as a classified interstellar identity terminal.
 *
 * The face is the undisputed hero. NOTHING is ever drawn over the facial area:
 *   • Status module sits ABOVE the portrait (SUBJECT VERIFIED).
 *   • Coordinate readout sits to the LEFT, well clear of the frame.
 *   • Scan status sits BELOW the portrait.
 *   • Corner brackets frame the portrait (corners only — engineered, not
 *     decorative). No reticle, no crosshair, no telemetry over the face.
 *
 * Behind the portrait: faint orbital identity rings, a dashed radar ring, a
 * slow scanning pulse, and tiny orbiting particles — all strictly BEHIND the
 * image. Everything is GPU-composited transform/opacity.
 */
export default function IdentityReconstruction() {
  return (
    <div className="hkc-recon">
      {/* Energy haze — separation glow behind the figure */}
      <div className="hkc-haze" aria-hidden="true" />

      {/* Coordinate module — far to the left, low opacity, clear of the face */}
      <div className="hkc-coords" aria-hidden="true">
        <span>X 42.118</span>
        <span>Y 19.774</span>
        <span>Z -08.66</span>
      </div>

      {/* Identity stack — status · portrait · scan, vertically composed */}
      <div className="hkc-identity-stack">
        {/* Status module — ABOVE the portrait */}
        <div className="hkc-status" aria-hidden="true">
          <span className="hkc-status-line">
            <span className="hkc-blink" style={{ color: '#6ee7b7' }}>●</span>
            Subject Verified
          </span>
          <span className="hkc-status-sub">Identity Confirmed · HK System Core</span>
        </div>

        {/* Portrait stage — orbital rings (behind) + framed portrait */}
        <div className="hkc-portrait-stage">
          {/* Orbital identity rings — strictly behind the portrait */}
          <span className="hkc-orbit-ring hkc-orbit-1" aria-hidden="true" />
          <span className="hkc-orbit-ring hkc-orbit-2" aria-hidden="true" />
          <span className="hkc-orbit-pulse" aria-hidden="true" />
          <span className="hkc-orbit-particles" aria-hidden="true">
            <span /><span /><span /><span />
          </span>

          {/* Face frame — the portrait + corner brackets only */}
          <div className="hkc-face-frame relative">
            <HoloPortrait />

            {/* Corner brackets — engineered containment frame */}
            <span className="hkc-bracket hkc-bracket-tl" aria-hidden="true" />
            <span className="hkc-bracket hkc-bracket-tr" aria-hidden="true" />
            <span className="hkc-bracket hkc-bracket-bl" aria-hidden="true" />
            <span className="hkc-bracket hkc-bracket-br" aria-hidden="true" />

            {/* Scan line — sweeps the frame (not a marker over the face) */}
            <span className="hkc-scanbar" aria-hidden="true" />
          </div>
        </div>

        {/* Scan module — BELOW the portrait */}
        <div className="hkc-scan" aria-hidden="true">
          <span className="hkc-scan-id">HK_CORE_CONNECTED</span>
          <span className="hkc-scan-row">
            <span>Reconstruction 99.8%</span>
            <span className="hkc-blink" style={{ color: '#6ee7b7' }}>● Scan Active</span>
          </span>
        </div>
      </div>
    </div>
  )
}
