'use client'

import { useCallback, useState } from 'react'
import {
  useAppStore,
  selectWorldState,
  selectActiveWorld,
} from '@/store/useAppStore'
import ChamberEnvironment, { TONE_COMMAND } from '../shared/ChamberEnvironment'
import GalaxyTransitPanel from '../shared/GalaxyTransitPanel'
import HolographicPanel from '../projects/HolographicPanel'
import {
  MISSIONS,
  OBJECTIVES,
  ACTIVE_FOCUS,
  ENGINEERING_PRINCIPLES,
  STATUS_BOARD,
  type MissionObjective,
} from '@/lib/missionData'
import CommandTable from './CommandTable'
import MissionMap from './MissionMap'
import ObjectiveCard from './ObjectiveCard'
import MissionBrief from './MissionBrief'
import CommandLog from './CommandLog'

const ACCENT = '#60a5fa' // blue-400 — the command-bridge tone

/**
 * MissionControlWorld — the strategic command bridge of HK Galaxy.
 *
 * Reuses the exact world architecture (worldState / worldProgress / enter /
 * exit / transition controller / portal). Mounted only when the active world
 * is the mission slot (`journey` id) and the world state has progressed past
 * the universe view; content reveals only once `worldState === 'inside'`.
 *
 * Bridge composition:
 *   • Centre — a giant holographic command table (the visual hero) ringed by
 *     a mission map and floating mission-objective cards.
 *   • Left  — primary + secondary mission panels.
 *   • Right — live status board, active focus, engineering principles.
 *   • A command-log terminal opens over the bridge on demand.
 */
export default function MissionControlWorld() {
  const worldState  = useAppStore(selectWorldState)
  const activeWorld = useAppStore(selectActiveWorld)
  const exitWorld   = useAppStore((s) => s.exitWorld)

  const [brief, setBrief]   = useState<MissionObjective | null>(null)
  const [logOpen, setLogOpen] = useState(false)
  const [hoverMission, setHoverMission] = useState<string | null>(null)

  const openBrief = useCallback((o: MissionObjective) => setBrief(o), [])

  if (activeWorld !== 'journey') return null
  if (worldState === 'universe') return null

  const inside  = worldState === 'inside'
  const primary   = MISSIONS.find((m) => m.tier === 'PRIMARY')!
  const secondary = MISSIONS.find((m) => m.tier === 'SECONDARY')!

  // Objective ids highlighted by the currently-hovered mission panel.
  const highlightSet = hoverMission
    ? new Set(MISSIONS.find((m) => m.id === hoverMission)?.objectives ?? [])
    : null

  return (
    <div className="fixed inset-0 z-20">
      {/* Command-blue chamber backdrop */}
      <ChamberEnvironment tone={TONE_COMMAND} />
      {inside && <BridgeAtmosphere />}
      {inside && <GalaxyTransitPanel current="journey" accent={ACCENT} />}

      {/* Bridge content — fades in only when stabilised inside */}
      <div
        className="relative z-10 w-full h-full"
        style={{
          opacity: inside ? 1 : 0,
          transition: 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: inside ? 'auto' : 'none',
        }}
      >
        {inside && (
          <>
            {/* ── Header ─────────────────────────────────────────────── */}
            <header className="fixed top-[4.5rem] left-1/2 -translate-x-1/2 z-30 text-center world-reveal pointer-events-none">
              <h2
                className="font-sans text-[clamp(1.5rem,3.4vw,2.4rem)] font-bold text-white tracking-tight"
                style={{ textShadow: `0 0 40px ${ACCENT}66` }}
              >
                Mission Control
              </h2>
              <p className="mt-1 font-mono text-[10px] tracking-[0.34em] uppercase text-blue-300/70">
                Current Strategic Objectives
              </p>
            </header>

            {/* ── Centre stage — table + map + objective cards ───────── */}
            <div className="mc-stage">
              <div className="mc-canvas">
                <CommandTable />
                <MissionMap accent={ACCENT} />
                {OBJECTIVES.map((o, i) => (
                  <ObjectiveCard
                    key={o.id}
                    objective={o}
                    order={i}
                    accent={ACCENT}
                    onOpen={openBrief}
                    highlight={highlightSet?.has(o.id) ?? false}
                    dimmed={highlightSet !== null && !highlightSet.has(o.id)}
                  />
                ))}
              </div>
            </div>

            {/* ── LEFT — mission panels ──────────────────────────────── */}
            <div className="mc-rail mc-rail-left world-reveal">
              {/* Primary mission */}
              <div
                onMouseEnter={() => setHoverMission(primary.id)}
                onMouseLeave={() => setHoverMission(null)}
              >
                <HolographicPanel accent={primary.accent} className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] tracking-[0.3em] uppercase" style={{ color: primary.accent }}>
                      Primary Mission
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.2em] uppercase inline-flex items-center gap-1 text-emerald-300">
                      <span className="hkc-blink">●</span> {primary.state}
                    </span>
                  </div>
                  <h3 className="font-sans text-xl font-semibold text-white leading-tight" style={{ textShadow: `0 0 24px ${primary.accent}55` }}>
                    {primary.codename}
                  </h3>
                  <p className="mt-2 font-mono text-[10.5px] text-slate-400 leading-relaxed">
                    {primary.description}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <Tag accent={primary.accent} label="State" value={primary.state} />
                    <Tag accent={primary.accent} label="Priority" value={primary.priority} />
                  </div>
                </HolographicPanel>
              </div>

              {/* Secondary mission */}
              <div
                onMouseEnter={() => setHoverMission(secondary.id)}
                onMouseLeave={() => setHoverMission(null)}
              >
                <HolographicPanel accent={secondary.accent} className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] tracking-[0.3em] uppercase" style={{ color: secondary.accent }}>
                      Secondary Mission
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.2em] uppercase inline-flex items-center gap-1 text-emerald-300">
                      <span className="hkc-blink">●</span> {secondary.state}
                    </span>
                  </div>
                  <h3 className="font-sans text-lg font-semibold text-white leading-tight">
                    {secondary.codename}
                  </h3>
                  <p className="mt-2 font-mono text-[10.5px] text-slate-400 leading-relaxed">
                    {secondary.description}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <Tag accent={secondary.accent} label="State" value={secondary.state} />
                    <Tag accent={secondary.accent} label="Priority" value={secondary.priority} />
                  </div>
                </HolographicPanel>
              </div>
            </div>

            {/* ── RIGHT — status board + focus + principles ──────────── */}
            <div className="mc-rail mc-rail-right world-reveal">
              {/* Live status board */}
              <HolographicPanel accent={ACCENT} className="p-5">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
                  Live Status
                </div>
                <dl className="space-y-1.5">
                  {STATUS_BOARD.map((s) => (
                    <div key={s.label} className="flex items-baseline justify-between gap-3">
                      <dt className="font-mono text-[8.5px] tracking-[0.2em] uppercase text-slate-500">{s.label}</dt>
                      <dd
                        className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-right"
                        style={{ color: s.live ? '#6ee7b7' : `${ACCENT}dd` }}
                      >
                        {s.live && <span className="hkc-blink mr-1.5">●</span>}
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </HolographicPanel>

              {/* Active focus */}
              <HolographicPanel accent={ACCENT} className="p-5">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
                  Active Focus
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ACTIVE_FOCUS.map((f) => (
                    <span
                      key={f}
                      className="font-mono text-[9px] tracking-wide uppercase px-2 py-0.5 rounded"
                      style={{ color: `${ACCENT}ee`, backgroundColor: `${ACCENT}12`, border: `1px solid ${ACCENT}2a` }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </HolographicPanel>

              {/* Engineering principles */}
              <HolographicPanel accent={ACCENT} className="p-5">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
                  Engineering Principles
                </div>
                <ul className="space-y-1">
                  {ENGINEERING_PRINCIPLES.map((p) => (
                    <li key={p} className="font-mono text-[10px] text-slate-300 leading-relaxed flex gap-2">
                      <span style={{ color: ACCENT }}>•</span> {p}
                    </li>
                  ))}
                </ul>
              </HolographicPanel>
            </div>

            {/* ── Captain's Log button (bottom-centre) ───────────────── */}
            <button
              type="button"
              onClick={() => setLogOpen(true)}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-auto font-mono text-[10px] tracking-[0.3em] uppercase px-5 py-2.5 rounded-md transition-all hover:brightness-125 world-reveal"
              style={{ color: '#fff', backgroundColor: `${ACCENT}1c`, border: `1px solid ${ACCENT}55`, boxShadow: `0 0 26px ${ACCENT}1f` }}
              aria-label="Open Captain's Log"
            >
              ▸ Open Command Log
            </button>
          </>
        )}
      </div>

      {/* Mission brief + command log overlays */}
      {inside && <MissionBrief objective={brief} accent={ACCENT} onClose={() => setBrief(null)} />}
      {inside && <CommandLog open={logOpen} accent={ACCENT} onClose={() => setLogOpen(false)} />}

      {/* Exit affordance */}
      {inside && (
        <button
          type="button"
          onClick={exitWorld}
          className="fixed bottom-8 right-8 z-50 pointer-events-auto font-mono text-[10px] tracking-[0.3em] uppercase text-slate-400 hover:text-white transition-colors flex items-center gap-2 world-reveal"
          aria-label="Exit Mission Control, return to orbit"
        >
          <span className="text-blue-300">←</span> Exit to orbit
        </button>
      )}
    </div>
  )
}

/** A small labelled state/priority tag used in the mission panels. */
function Tag({ accent, label, value }: { accent: string; label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[7.5px] tracking-[0.22em] uppercase text-slate-500">{label}</div>
      <div className="font-mono text-[10px] tracking-[0.1em] uppercase mt-0.5" style={{ color: `${accent}ee` }}>
        {value}
      </div>
    </div>
  )
}

/**
 * BridgeAtmosphere — minimal micro-atmosphere over the bridge: a few faint
 * vertical data streams and a couple of drifting motes. Deterministic
 * placement (SSR-safe), tiny DOM, transform/opacity only — on top of the
 * shared chamber's existing motes and scan line.
 */
const STREAMS = [
  { left: '12%', dur: 22, delay: 0,   w: 1 },
  { left: '34%', dur: 28, delay: 5,   w: 1 },
  { left: '63%', dur: 25, delay: 2,   w: 2 },
  { left: '88%', dur: 30, delay: 7,   w: 1 },
] as const

function BridgeAtmosphere() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {STREAMS.map((s, i) => (
        <span
          key={i}
          className="mc-stream"
          style={{ left: s.left, width: `${s.w}px`, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>
  )
}
