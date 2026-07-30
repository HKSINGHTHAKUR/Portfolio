'use client'

import { useEffect } from 'react'
import type { MissionObjective } from '@/lib/missionData'

interface MissionBriefProps {
  objective: MissionObjective | null
  accent:    string
  onClose:   () => void
}

/**
 * MissionBrief — the deeper brief opened when an objective card is clicked.
 *
 * A holographic command panel that materialises in (scale/opacity/blur), with
 * the objective's index, title, status, and full brief. Closes on Escape or
 * backdrop click. Reuses the proven projects-chamber materialisation feel.
 */
export default function MissionBrief({ objective, accent, onClose }: MissionBriefProps) {
  useEffect(() => {
    if (!objective) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [objective, onClose])

  if (!objective) return null

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Mission brief: ${objective.title}`}
    >
      <div className="proj-chamber-backdrop absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className="proj-chamber-panel relative w-full max-w-lg p-7 rounded-lg holo-panel"
        style={{ borderColor: `${accent}33`, boxShadow: `0 0 0 1px ${accent}1f, 0 0 70px ${accent}28` }}
      >
        <span className="holo-corner holo-corner-tl" style={{ borderColor: `${accent}99` }} />
        <span className="holo-corner holo-corner-tr" style={{ borderColor: `${accent}99` }} />
        <span className="holo-corner holo-corner-bl" style={{ borderColor: `${accent}99` }} />
        <span className="holo-corner holo-corner-br" style={{ borderColor: `${accent}99` }} />

        <div className="flex items-start justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: accent }}>
              Mission {objective.index}
            </span>
            <h2
              className="mt-2 font-sans text-[clamp(1.4rem,3vw,1.9rem)] font-bold text-white leading-tight tracking-tight"
              style={{ textShadow: `0 0 30px ${accent}55` }}
            >
              {objective.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-mono text-[10px] tracking-[0.25em] uppercase text-slate-400 hover:text-white transition-colors"
            aria-label="Close mission brief"
          >
            Close ✕
          </button>
        </div>

        <div className="my-5 h-px w-full" style={{ background: `linear-gradient(to right, ${accent}66, transparent)` }} />

        <Section accent={accent} label="Objective">
          <p className="font-mono text-[12px] text-slate-300 leading-relaxed">{objective.objective}</p>
        </Section>

        <Section accent={accent} label="Current Status">
          <p className="font-mono text-[12px] leading-relaxed" style={{ color: `${accent}ee` }}>{objective.status}</p>
        </Section>

        <Section accent={accent} label="Next Milestone">
          <p className="font-mono text-[12px] text-slate-300 leading-relaxed">{objective.nextMilestone}</p>
        </Section>

        <Section accent={accent} label="Mission Impact">
          <p className="font-mono text-[12px] text-slate-300 leading-relaxed">{objective.impact}</p>
        </Section>
      </div>
    </div>
  )
}

/** A labelled section block inside the mission brief. */
function Section({
  accent,
  label,
  children,
}: {
  accent:   string
  label:    string
  children: React.ReactNode
}) {
  return (
    <section className="mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="inline-block w-3.5 h-px" style={{ backgroundColor: accent }} />
        <span className="font-mono text-[9px] tracking-[0.28em] uppercase" style={{ color: accent }}>{label}</span>
      </div>
      {children}
    </section>
  )
}
