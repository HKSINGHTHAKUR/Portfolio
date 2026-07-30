'use client'

import { OBJECTIVES } from '@/lib/missionData'

interface MissionMapProps {
  accent: string
}

/**
 * MissionMap — subtle connection lines threading the command table to the four
 * mission objectives, reading as the strategic mission paths radiating from
 * the core. Pure SVG over a 0–100 space; only `stroke-dashoffset` animates, so
 * it is effectively free.
 *
 * The objective cards are laid out at the four corners; the table sits at the
 * centre (50,50). Lines flow centre → each objective with a staggered pulse.
 */
export default function MissionMap({ accent }: MissionMapProps) {
  const core = { x: 50, y: 50 }

  return (
    <svg
      className="mc-map"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="mc-core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={`${accent}33`} />
          <stop offset="100%" stopColor={`${accent}00`} />
        </radialGradient>
      </defs>

      <circle cx={core.x} cy={core.y} r="18" fill="url(#mc-core-glow)" />

      {OBJECTIVES.map((o, i) => (
        <g key={o.id}>
          <line
            x1={core.x} y1={core.y} x2={o.position.x} y2={o.position.y}
            stroke={`${accent}26`} strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <line
            className="mc-map-flow"
            x1={core.x} y1={core.y} x2={o.position.x} y2={o.position.y}
            stroke={`${accent}aa`} strokeWidth={1.1}
            vectorEffect="non-scaling-stroke"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
          <circle
            cx={o.position.x} cy={o.position.y} r="0.8"
            fill={accent}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}

      <circle cx={core.x} cy={core.y} r="1.3" fill={accent} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
