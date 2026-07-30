'use client'

import { useState } from 'react'
import type { Project } from '@/lib/projectsData'
import HolographicPanel from './HolographicPanel'

interface ProjectNodeProps {
  project: Project
  /** Stagger index for the reveal animation. */
  order:   number
  /** Open this node's Intelligence Chamber. */
  onOpen:  (project: Project) => void
  /** Dim to ~20% (e.g. while another node is being focused). */
  dimmed?: boolean
}

/**
 * ProjectNode — a connected system node in the spatial network.
 *
 * Two states only:
 *   HOVER  preview — soft glow, slight scale, a one-line summary appears.
 *          Nothing more: no architecture, no screenshots, no detail dump.
 *   CLICK  opens the dedicated Intelligence Chamber for this project.
 *
 * The node map is navigation; the real showcase begins after the click.
 * The flagship (Strocter) renders larger and brighter with a "FLAGSHIP
 * SYSTEM" label so it reads as the primary focal point.
 */
export default function ProjectNode({ project, order, onOpen, dimmed = false }: ProjectNodeProps) {
  const [hover, setHover] = useState(false)
  const { accent, flagship } = project

  const width = flagship ? 288 : 240

  return (
    <div
      className="proj-node world-reveal pointer-events-auto"
      style={{
        left: `${project.position.x}%`,
        top:  `${project.position.y}%`,
        width,
        zIndex: hover ? 30 : flagship ? 20 : 10,
        opacity: dimmed ? 0.2 : 1,
        transition: 'opacity 450ms ease',
        animationDelay: `${(flagship ? 0 : order + 1) * 160 + 200}ms`,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* FLAGSHIP SYSTEM label — only above the primary node */}
      {flagship && (
        <div className="proj-flagship-tag" style={{ color: accent }}>
          <span className="proj-flagship-dot" style={{ backgroundColor: accent }} />
          Flagship System
        </div>
      )}

      <button
        type="button"
        onClick={() => onOpen(project)}
        className="block w-full text-left cursor-pointer focus:outline-none"
        aria-label={`Open ${project.title} intelligence chamber`}
      >
        <HolographicPanel
          accent={accent}
          className={`proj-node-panel ${flagship ? 'proj-node-flagship' : ''} p-5`}
          style={{
            transform: hover ? 'translateY(-5px) scale(1.02)' : 'none',
            boxShadow: hover
              ? `0 0 0 1px ${accent}50, 0 0 64px ${accent}38, inset 0 0 42px ${accent}16`
              : flagship
                ? `0 0 0 1px ${accent}28, 0 0 48px ${accent}22, inset 0 0 34px ${accent}0e`
                : `0 0 0 1px ${accent}14, 0 0 32px ${accent}12, inset 0 0 26px ${accent}08`,
          }}
        >
          {/* Header — node id + status */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: accent }}>
              Node {project.index}
            </span>
            <span className="flex items-center gap-1.5">
              {project.status === 'ACTIVE DEVELOPMENT' && (
                <span
                  className="proj-status-pulse w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
                />
              )}
              <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-slate-500">
                {project.status === 'ACTIVE DEVELOPMENT' ? 'Active' : 'Shipped'}
              </span>
            </span>
          </div>

          {/* Identity — title + category */}
          <h3
            className={`font-sans ${flagship ? 'text-2xl' : 'text-lg'} font-semibold text-white leading-tight`}
            style={flagship ? { textShadow: `0 0 28px ${accent}66` } : undefined}
          >
            {project.title}
          </h3>
          <p className="mt-1 font-mono text-[10px] tracking-[0.16em] uppercase text-slate-400">
            {project.category}
          </p>

          {/* HOVER PREVIEW — a single-line summary, nothing more */}
          <div
            className="overflow-hidden transition-all duration-400 ease-out"
            style={{ maxHeight: hover ? '70px' : '0px', opacity: hover ? 1 : 0 }}
          >
            <p className="pt-3 font-mono text-[10px] text-slate-400 leading-relaxed line-clamp-2">
              {project.tagline}
            </p>
            <div
              className="mt-2 font-mono text-[8.5px] tracking-[0.28em] uppercase flex items-center gap-1.5"
              style={{ color: `${accent}cc` }}
            >
              <span>▸</span> Click to open
            </div>
          </div>
        </HolographicPanel>
      </button>
    </div>
  )
}
