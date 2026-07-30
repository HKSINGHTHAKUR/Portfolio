'use client'

import type { TechProjectNode } from '@/lib/techData'

interface ForgeProjectNodeProps {
  project:   TechProjectNode
  /** Highlighted because the active tech connects to it. */
  connected: boolean
  /** A tech is active but this project is not connected → fade back. */
  dimmed:    boolean
}

/**
 * ForgeProjectNode — a small destination node on the forge edge.
 *
 * Projects are deliberately minor here: the technologies are the subject and
 * projects are where they land. When a technology is selected, the projects it
 * powers light up (brighter ring, pulse); the rest fade slightly.
 */
export default function ForgeProjectNode({ project, connected, dimmed }: ForgeProjectNodeProps) {
  const { accent } = project

  return (
    <div
      className="forge-project"
      style={{
        left: `${project.position.x}%`,
        top:  `${project.position.y}%`,
        opacity: dimmed ? 0.3 : 1,
        transition: 'opacity 400ms ease',
        zIndex: 25,
      }}
    >
      <span
        className={`forge-project-orb ${connected ? 'forge-project-on' : ''}`}
        style={{
          borderColor: connected ? accent : `${accent}55`,
          backgroundColor: connected ? `${accent}26` : `${accent}10`,
          boxShadow: connected
            ? `0 0 24px ${accent}88, inset 0 0 12px ${accent}44`
            : `0 0 10px ${accent}22`,
        }}
        aria-hidden="true"
      />
      <span
        className="forge-project-label font-mono"
        style={{ color: connected ? '#fff' : `${accent}cc` }}
      >
        {project.label}
      </span>
    </div>
  )
}
