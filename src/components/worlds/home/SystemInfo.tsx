'use client'

import HolographicPanel from '../projects/HolographicPanel'
import {
  IDENTITY,
  FOCUS_AREAS,
  MISSION,
  SYSTEM_STATUS,
} from '@/lib/coreData'

/**
 * SystemInfo — the RIGHT side of HK Core: the system information readout.
 *
 * Identity header, focus-area chips, mission block, and a live system-status
 * table — presented as a futuristic OS panel, not a résumé. Reuses the shared
 * HolographicPanel so it reads as part of the same world architecture.
 */

const ACCENT = '#a5b4fc' // indigo-300, the home tone

export default function SystemInfo() {
  return (
    <div className="flex flex-col gap-5 w-full max-w-md">
      {/* ── Identity header ──────────────────────────────────────────── */}
      <div className="world-reveal">
        <div className="font-mono text-[10px] tracking-[0.5em] uppercase text-indigo-300/80 mb-3">
          HK · System Core
        </div>
        <h2
          className="font-sans text-[clamp(1.9rem,4.5vw,3rem)] font-bold text-white tracking-tight leading-[1.05]"
          style={{ textShadow: `0 0 40px ${ACCENT}55` }}
        >
          {IDENTITY.name}
        </h2>
        <div
          className="mt-3 mb-3 h-px w-24"
          style={{ background: `linear-gradient(to right, ${ACCENT}cc, transparent)` }}
        />
        <p className="font-mono text-[13px] tracking-[0.22em] uppercase text-indigo-200/90">
          {IDENTITY.role}
        </p>
        <p className="mt-3 font-mono text-[12px] text-slate-400 leading-relaxed max-w-sm">
          {IDENTITY.description}
        </p>
      </div>

      {/* ── Focus areas ──────────────────────────────────────────────── */}
      <div className="world-reveal world-delay-1">
        <HolographicPanel accent={ACCENT} className="p-5">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
            Focus Areas
          </div>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map((area) => (
              <span
                key={area}
                className="font-mono text-[10px] tracking-wide uppercase px-2.5 py-1 rounded"
                style={{
                  color: `${ACCENT}dd`,
                  backgroundColor: `${ACCENT}12`,
                  border: `1px solid ${ACCENT}22`,
                }}
              >
                {area}
              </span>
            ))}
          </div>
        </HolographicPanel>
      </div>

      {/* ── Mission + System status (two-up) ─────────────────────────── */}
      <div className="world-reveal world-delay-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <HolographicPanel accent={ACCENT} className="p-5">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
            Mission
          </div>
          <p className="font-mono text-[11px] text-slate-300 leading-relaxed">
            {MISSION}
          </p>
        </HolographicPanel>

        <HolographicPanel accent={ACCENT} className="p-5">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
            System Status
          </div>
          <dl className="space-y-1.5">
            {SYSTEM_STATUS.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-3">
                <dt className="font-mono text-[8.5px] tracking-[0.2em] uppercase text-slate-500">
                  {s.label}
                </dt>
                <dd
                  className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-right"
                  style={{ color: s.value === 'ONLINE' ? '#6ee7b7' : `${ACCENT}dd` }}
                >
                  {s.value === 'ONLINE' && (
                    <span className="hkc-blink mr-1.5 text-emerald-status">●</span>
                  )}
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </HolographicPanel>
      </div>
    </div>
  )
}
