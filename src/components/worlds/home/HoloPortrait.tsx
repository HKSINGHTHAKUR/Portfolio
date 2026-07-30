'use client'

import { useState } from 'react'

/**
 * HoloPortrait — the real portrait rendered as a holographic projection.
 *
 * Identity recognition is the priority: the actual photo (a pre-cropped,
 * background-removed transparent PNG) is the PRIMARY visual element, so eyes,
 * glasses, beard, hair and facial proportions are preserved exactly. The
 * futuristic feel comes from treatment layered ON TOP of the real image:
 *
 *   • Duotone holographic tint (cyan/indigo) via blend layers — keeps the
 *     person recognisable while reading as a projection, not a flat photo.
 *   • Scan lines + a sweeping scan beam.
 *   • Soft cyan/indigo glow + energy haze behind the figure.
 *   • Subtle particle breakup near the edges.
 *   • A periodic "reconstruction" flicker/glitch — brief, very subtle.
 *   • Slow breathing float + micro chromatic drift.
 *
 * All effects are GPU-composited CSS. The image decodes once; everything else
 * is transforms/opacity. No canvas, no shaders, no postprocessing.
 */

const SRC = '/identity/port.jpeg'

export default function HoloPortrait() {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="hkc-fallback" aria-label="HK identity core" role="img">
        <span>HK</span>
      </div>
    )
  }

  return (
    <div className="hkc-portrait">
      {/* Base portrait — the real, recognisable image (holographically tinted) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SRC}
        alt="Holographic portrait of Harsh K. Singh"
        className="hkc-portrait-img hkc-portrait-base"
        draggable={false}
        onError={() => setFailed(true)}
      />

      {/* Cyan + indigo chromatic ghosts — recoloured copies for the projection
          look. Decorative; aria-hidden. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SRC}
        alt=""
        aria-hidden="true"
        className="hkc-portrait-img hkc-portrait-cyan"
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SRC}
        alt=""
        aria-hidden="true"
        className="hkc-portrait-img hkc-portrait-indigo"
        draggable={false}
      />

      {/* Scan lines clipped to the figure via the image as a mask */}
      <div
        className="hkc-portrait-scanlines"
        aria-hidden="true"
        style={{
          maskImage: `url(${SRC})`,
          WebkitMaskImage: `url(${SRC})`,
        }}
      />

      {/* Particle breakup near edges — masked to the figure silhouette */}
      <div
        className="hkc-portrait-particles"
        aria-hidden="true"
        style={{
          maskImage: `url(${SRC})`,
          WebkitMaskImage: `url(${SRC})`,
        }}
      />

      {/* Reconstruction sweep band — masked to the figure */}
      <div
        className="hkc-portrait-sweep"
        aria-hidden="true"
        style={{
          maskImage: `url(${SRC})`,
          WebkitMaskImage: `url(${SRC})`,
        }}
      />
    </div>
  )
}
