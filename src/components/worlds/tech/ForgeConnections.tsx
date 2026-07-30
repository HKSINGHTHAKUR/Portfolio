'use client'

import { TECH_PROJECTS, type Technology, type TechProjectId } from '@/lib/techData'

interface ForgeConnectionsProps {
  /** The currently active technology, or null when nothing is selected. */
  tech:     Technology | null
  /** Map of techId → {x,y} artifact centre (percentages over the canvas). */
  techPos:  Record<string, { x: number; y: number }>
}

/**
 * ForgeConnections — the project-connection system + core energy routing.
 *
 * When a technology is active:
 *   • A slow cyan/blue energy beam routes from the reactor core (50,50) out to
 *     the selected artifact — "the core is routing energy to this technology".
 *   • Animated energy lines then run from that artifact to every project node
 *     that actually uses it, reading as data travelling tech → project.
 *
 * Pure SVG over a 0–100 coordinate space; only `stroke-dashoffset` and a small
 * travelling pulse animate, so it stays effectively free.
 */
export default function ForgeConnections({ tech, techPos }: ForgeConnectionsProps) {
  if (!tech) return null
  const from = techPos[tech.id]
  if (!from) return null

  const connected = new Set<TechProjectId>(tech.projects)

  // Core → tech routing beam geometry.
  const core = { x: 50, y: 50 }
  const len  = Math.hypot(from.x - core.x, from.y - core.y) || 1

  return (
    <svg
      className="forge-connections"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* ── Core → selected technology energy routing ────────────────── */}
      <line
        x1={core.x} y1={core.y} x2={from.x} y2={from.y}
        stroke="rgba(125,211,252,0.25)" strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <line
        className="forge-core-route"
        x1={core.x} y1={core.y} x2={from.x} y2={from.y}
        stroke="rgba(56,189,248,0.95)" strokeWidth={1.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ strokeDasharray: `6 ${len}`, ['--route-len' as string]: `${len + 6}` }}
      />

      {/* ── Selected technology → connected projects ─────────────────── */}
      {TECH_PROJECTS.filter((p) => connected.has(p.id)).map((p, i) => (
        <g key={p.id}>
          {/* Faint base wire */}
          <line
            x1={from.x} y1={from.y} x2={p.position.x} y2={p.position.y}
            stroke={`${p.accent}33`} strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          {/* Flowing energy */}
          <line
            className="forge-conn-flow"
            x1={from.x} y1={from.y} x2={p.position.x} y2={p.position.y}
            stroke={`${p.accent}cc`} strokeWidth={1.4}
            vectorEffect="non-scaling-stroke"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        </g>
      ))}
    </svg>
  )
}
