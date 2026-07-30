'use client'

import { PROJECTS, FLAGSHIP } from '@/lib/projectsData'

/**
 * NetworkLines — the animated technical connection mesh of the Projects World.
 *
 * Draws hub-and-spoke links from the flagship node (Strocter) out to every
 * other system, reading like a system-topology / architecture diagram rather
 * than decoration. Pure SVG with `non-scaling-stroke`, so a single 0–100
 * coordinate space maps cleanly onto the responsive network box at any size.
 *
 * Motion is a slow dash-flow along each spoke — the only animated property is
 * `stroke-dashoffset` on four short paths, which is effectively free.
 */
export default function NetworkLines() {
  const hub   = FLAGSHIP.position
  const spokes = PROJECTS.filter((p) => !p.flagship)

  return (
    <svg
      className="proj-lines"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="proj-hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(34,211,238,0.35)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </radialGradient>
      </defs>

      {/* Soft halo behind the hub */}
      <circle cx={hub.x} cy={hub.y} r="22" fill="url(#proj-hub-glow)" />

      {spokes.map((p, i) => (
        <g key={p.id}>
          {/* Static faint base line — the "wire" */}
          <line
            x1={hub.x} y1={hub.y}
            x2={p.position.x} y2={p.position.y}
            stroke={`${p.accent}22`}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          {/* Animated energy flow along the wire */}
          <line
            className="proj-line"
            x1={hub.x} y1={hub.y}
            x2={p.position.x} y2={p.position.y}
            stroke={`${p.accent}aa`}
            strokeWidth={1.25}
            vectorEffect="non-scaling-stroke"
            style={{ animationDelay: `${i * 0.45}s` }}
          />
          {/* Connection terminal at the remote node */}
          <circle
            cx={p.position.x} cy={p.position.y} r="0.9"
            fill={p.accent}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}

      {/* Hub terminal */}
      <circle
        cx={hub.x} cy={hub.y} r="1.4"
        fill={FLAGSHIP.accent}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
