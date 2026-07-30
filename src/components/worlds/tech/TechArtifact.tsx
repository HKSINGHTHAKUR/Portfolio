'use client'

import type { Technology } from '@/lib/techData'

interface TechArtifactProps {
  tech:     Technology
  /** Centre position over the forge canvas (percentages). */
  pos:      { x: number; y: number }
  active:   boolean
  /** Another artifact is active and this one is not → fade back. */
  dimmed:   boolean
  /** Open the data panel upward (for artifacts in the lower half). */
  flipUp:   boolean
  /** Stagger index for the reveal. */
  order:    number
  accent:   string
  onEnter:  (id: string) => void
  onLeave:  () => void
}

/**
 * TechArtifact — a single technology rendered as a holographic engineering
 * module floating on one of the reactor's rings. Not a card.
 *
 * Idle: a framed glyph badge with a soft glow and a slow float. Hover/active:
 * the frame intensifies and a holographic data panel expands beside it with
 * the technology's role, where it's used, and the projects it connects to.
 *
 * Float + glow are GPU-composited; the data panel is a transform/opacity
 * reveal. The artifact anchors by its centre so the panel can grow without
 * shifting the ring layout.
 */
export default function TechArtifact({
  tech, pos, active, dimmed, flipUp, order, accent, onEnter, onLeave,
}: TechArtifactProps) {
  return (
    <div
      className={`forge-artifact world-reveal ${flipUp ? 'forge-artifact-up' : ''}`}
      style={{
        left: `${pos.x}%`,
        top:  `${pos.y}%`,
        zIndex: active ? 40 : 20,
        opacity: dimmed ? 0.22 : 1,
        // Stagger the entrance; the float animation takes over afterwards.
        animationDelay: `${order * 70 + 200}ms`,
        ['--accent' as string]: accent,
      }}
      onMouseEnter={() => onEnter(tech.id)}
      onMouseLeave={onLeave}
    >
      {/* Floating wrapper — slow idle drift, paused while active */}
      <div className="forge-artifact-float" style={{ animationPlayState: active ? 'paused' : 'running' }}>
        <button
          type="button"
          className={`forge-badge ${active ? 'forge-badge-active' : ''}`}
          style={{
            borderColor: active ? `${accent}cc` : `${accent}3a`,
            boxShadow: active
              ? `0 0 0 1px ${accent}66, 0 0 40px ${accent}55, inset 0 0 22px ${accent}1f`
              : `0 0 0 1px ${accent}14, 0 0 20px ${accent}22, inset 0 0 16px ${accent}10`,
          }}
          aria-label={`${tech.name} — ${tech.role}`}
        >
          {/* HUD corner ticks */}
          <span className="forge-badge-corner forge-badge-tl" style={{ borderColor: `${accent}aa` }} />
          <span className="forge-badge-corner forge-badge-tr" style={{ borderColor: `${accent}aa` }} />
          <span className="forge-badge-corner forge-badge-bl" style={{ borderColor: `${accent}aa` }} />
          <span className="forge-badge-corner forge-badge-br" style={{ borderColor: `${accent}aa` }} />

          <span className="forge-badge-glyph font-mono" style={{ color: accent, textShadow: `0 0 14px ${accent}aa` }}>
            {tech.glyph}
          </span>
          <span className="forge-badge-name font-mono">{tech.name}</span>

          {/* Scan sweep across the badge */}
          <span className="forge-badge-scan" style={{ background: `linear-gradient(180deg, transparent, ${accent}22, transparent)` }} />
        </button>
      </div>

      {/* Holographic data panel — expands on hover/active */}
      <div
        className={`forge-panel ${active ? 'forge-panel-open' : ''}`}
        style={{ borderColor: `${accent}40`, boxShadow: `0 0 0 1px ${accent}1a, 0 0 36px ${accent}2e` }}
        role="dialog"
        aria-label={`${tech.name} details`}
      >
        <div className="forge-panel-head">
          <span className="font-mono text-[13px] font-semibold text-white">{tech.name}</span>
          <span className="forge-panel-dot" style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }} />
        </div>
        <div className="font-mono text-[9px] tracking-[0.22em] uppercase mt-1" style={{ color: `${accent}dd` }}>
          {tech.role}
        </div>

        <div className="forge-panel-divider" style={{ background: `linear-gradient(to right, ${accent}66, transparent)` }} />

        <div className="forge-panel-sub font-mono">Used In</div>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {tech.usedIn.map((u) => (
            <span
              key={u}
              className="font-mono text-[9px] tracking-wide px-2 py-0.5 rounded"
              style={{ color: `${accent}ee`, backgroundColor: `${accent}12`, border: `1px solid ${accent}2a` }}
            >
              {u}
            </span>
          ))}
        </div>

        <div className="forge-panel-sub font-mono mt-3">Projects</div>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {tech.projects.map((p) => (
            <span key={p} className="font-mono text-[9px] tracking-wide capitalize text-slate-300">
              ▸ {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
