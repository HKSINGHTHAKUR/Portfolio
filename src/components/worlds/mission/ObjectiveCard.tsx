'use client'

import { useState } from 'react'
import type { MissionObjective, ObjectiveStatus } from '@/lib/missionData'

interface ObjectiveCardProps {
  objective: MissionObjective
  order:     number
  accent:    string
  onOpen:    (objective: MissionObjective) => void
  /** Highlighted because a hovered mission panel drives this objective. */
  highlight?: boolean
  /** A mission is hovered but this objective is not part of it → fade back. */
  dimmed?:    boolean
}

/** Status → tint, so the four objective states read at a glance. */
const STATUS_TINT: Record<ObjectiveStatus, string> = {
  'IN PROGRESS': '#34d399', // active green
  'PLANNED':     '#60a5fa', // blue
  'FUTURE':      '#a78bfa', // violet
  'LONG TERM':   '#94a3b8', // slate
}

/**
 * ObjectiveCard — a floating mission-objective card orbiting the command
 * table. Idle: index, title, status chip, slow float. Hover: expands a short
 * brief and lifts/glows. Click: opens the full mission brief.
 *
 * Matches the interaction quality of the Projects/Tech worlds — GPU-composited
 * transform/opacity only.
 */
export default function ObjectiveCard({
  objective, order, accent, onOpen, highlight = false, dimmed = false,
}: ObjectiveCardProps) {
  const [hover, setHover] = useState(false)
  const tint = STATUS_TINT[objective.status]
  // The card is "lit" when directly hovered or highlighted by a mission panel.
  const lit = hover || highlight

  return (
    <div
      className="mc-objective world-reveal"
      style={{
        left: `${objective.position.x}%`,
        top:  `${objective.position.y}%`,
        zIndex: hover ? 40 : 24,
        opacity: dimmed ? 0.32 : 1,
        transition: 'opacity 400ms ease',
        animationDelay: `${order * 110 + 300}ms`,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="mc-objective-float" style={{ animationPlayState: hover ? 'paused' : 'running' }}>
        <button
          type="button"
          onClick={() => onOpen(objective)}
          className="mc-objective-card"
          style={{
            borderColor: lit ? `${accent}aa` : `${accent}33`,
            boxShadow: lit
              ? `0 0 0 1px ${accent}55, 0 0 44px ${accent}33, inset 0 0 26px ${accent}12`
              : `0 0 0 1px ${accent}12, 0 0 26px ${accent}1c, inset 0 0 18px ${accent}0a`,
            transform: highlight && !hover ? 'translateY(-2px)' : undefined,
          }}
          aria-label={`Open mission objective ${objective.index}: ${objective.title}`}
        >
          {/* HUD corner ticks */}
          <span className="mc-corner mc-corner-tl" style={{ borderColor: `${accent}aa` }} />
          <span className="mc-corner mc-corner-tr" style={{ borderColor: `${accent}aa` }} />
          <span className="mc-corner mc-corner-bl" style={{ borderColor: `${accent}aa` }} />
          <span className="mc-corner mc-corner-br" style={{ borderColor: `${accent}aa` }} />

          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase" style={{ color: accent }}>
              Mission {objective.index}
            </span>
            <span
              className="font-mono text-[7.5px] tracking-[0.2em] uppercase px-1.5 py-0.5 rounded inline-flex items-center gap-1"
              style={{ color: tint, backgroundColor: `${tint}16`, border: `1px solid ${tint}33` }}
            >
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: tint, boxShadow: `0 0 6px ${tint}` }} />
              {objective.status}
            </span>
          </div>

          <h3 className="font-sans text-[13px] font-semibold text-white leading-tight">
            {objective.title}
          </h3>

          {/* Hover brief — short preview only */}
          <div
            className="overflow-hidden transition-all duration-400 ease-out"
            style={{ maxHeight: hover ? '110px' : '0px', opacity: hover ? 1 : 0 }}
          >
            <p className="pt-2.5 font-mono text-[10px] text-slate-400 leading-relaxed">
              {objective.brief}
            </p>
            <div
              className="mt-2 font-mono text-[8px] tracking-[0.28em] uppercase flex items-center gap-1.5"
              style={{ color: `${accent}cc` }}
            >
              <span>▸</span> Open mission brief
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
