'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  useAppStore,
  selectWorldState,
  selectActiveWorld,
} from '@/store/useAppStore'
import ChamberEnvironment, { TONE_VIOLET } from '../shared/ChamberEnvironment'
import GalaxyTransitPanel from '../shared/GalaxyTransitPanel'
import {
  TECHNOLOGIES,
  TECH_PROJECTS,
  TECH_COUNT,
  RING_RADII,
  type Technology,
} from '@/lib/techData'
import Reactor from './Reactor'
import TechArtifact from './TechArtifact'
import ForgeProjectNode from './ForgeProjectNode'
import ForgeConnections from './ForgeConnections'

const ACCENT = '#a78bfa' // violet-400 — the forge tone

/**
 * TechWorld — the Engineering Forge.
 *
 * Reuses the exact world architecture established by Projects/Home: mounted
 * only when activeWorld === 'tech' and worldState has progressed past the
 * universe view; content reveals only once `worldState === 'inside'`. The
 * violet command chamber seals off the WebGL universe.
 *
 * A giant holographic reactor sits at the centre. Technology artifacts orbit
 * it on three rings; hovering one expands its data panel and lights up the
 * real projects that use it via animated energy lines. Small project nodes
 * live at the edge as destinations.
 *
 * The entry FLOW (planet click → travel → expansion → dive) is owned by the
 * navigation/transition controllers and is untouched here.
 */
export default function TechWorld() {
  const worldState  = useAppStore(selectWorldState)
  const activeWorld = useAppStore(selectActiveWorld)
  const exitWorld   = useAppStore((s) => s.exitWorld)

  const [activeId, setActiveId] = useState<string | null>(null)

  const enter = useCallback((id: string) => setActiveId(id), [])
  const leave = useCallback(() => setActiveId(null), [])

  // Pre-compute every artifact's centre over a 0–100 canvas from its ring +
  // angle. Centre of the canvas is (50,50); the reactor lives there.
  const techPos = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {}
    for (const t of TECHNOLOGIES) {
      const r = RING_RADII[t.ring] * 100      // radius in canvas %
      const rad = (t.angle * Math.PI) / 180
      map[t.id] = {
        x: 50 + r * Math.cos(rad),
        // multiply Y radius slightly to use the wider landscape canvas evenly
        y: 50 + r * Math.sin(rad),
      }
    }
    return map
  }, [])

  if (activeWorld !== 'tech') return null
  if (worldState === 'universe') return null

  const inside = worldState === 'inside'
  const active: Technology | null =
    activeId ? TECHNOLOGIES.find((t) => t.id === activeId) ?? null : null
  const connectedProjects = new Set(active?.projects ?? [])

  return (
    <div className="fixed inset-0 z-20">
      {/* Violet command chamber backdrop */}
      <ChamberEnvironment tone={TONE_VIOLET} />

      {/* Forge content — fades in only when stabilised inside */}
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
            {/* Galaxy transit network — top-left */}
            <GalaxyTransitPanel current="tech" accent={ACCENT} />

            {/* ── HUD · forge stats (below the transit panel) ────────── */}
            <div className="fixed top-[19rem] left-8 z-30 world-reveal pointer-events-none">
              <div className="font-mono text-[10px] tracking-[0.5em] uppercase text-violet-300/80 mb-2">
                Engineering Forge
              </div>
              <div className="font-mono text-[11px] text-slate-400 leading-relaxed">
                <span className="text-violet-300">{TECH_COUNT}</span> Technologies
              </div>
              <div className="font-mono text-[11px] text-slate-400 leading-relaxed">
                <span className="text-violet-300">{TECH_PROJECTS.length}</span> Shipped Systems
              </div>
            </div>

            {/* ── HUD · top-right ────────────────────────────────────── */}
            <div className="fixed top-20 right-8 z-30 world-reveal text-right pointer-events-none">
              <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-slate-500">
                System Status
                <span className="ml-2" style={{ color: '#6ee7b7' }}>
                  <span className="hkc-blink mr-1">●</span>ONLINE
                </span>
              </div>
              <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-slate-500 mt-1.5">
                Engineering Matrix
                <span className="ml-2" style={{ color: `${ACCENT}` }}>ACTIVE</span>
              </div>
            </div>

            {/* ── The forge canvas — reactor + rings + projects ──────── */}
            <div className="forge-stage">
              <div className="forge-canvas">
                <Reactor />

                {/* Energy connections (behind artifacts, above reactor) */}
                <ForgeConnections tech={active} techPos={techPos} />

                {/* Project destination nodes */}
                {TECH_PROJECTS.map((p) => (
                  <ForgeProjectNode
                    key={p.id}
                    project={p}
                    connected={connectedProjects.has(p.id)}
                    dimmed={active !== null && !connectedProjects.has(p.id)}
                  />
                ))}

                {/* Technology artifacts on their rings */}
                {TECHNOLOGIES.map((t, i) => (
                  <TechArtifact
                    key={t.id}
                    tech={t}
                    pos={techPos[t.id]}
                    active={activeId === t.id}
                    dimmed={activeId !== null && activeId !== t.id}
                    flipUp={techPos[t.id].y > 52}
                    order={i}
                    accent={ACCENT}
                    onEnter={enter}
                    onLeave={leave}
                  />
                ))}
              </div>
            </div>

            {/* ── HUD · bottom instruction ───────────────────────────── */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 world-reveal pointer-events-none">
              <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-slate-500 text-center">
                Select a technology artifact to inspect its role in the ecosystem
              </p>
            </div>
          </>
        )}
      </div>

      {/* Exit affordance — bottom-right so it never collides with the HUD */}
      {inside && (
        <button
          type="button"
          onClick={exitWorld}
          className="fixed bottom-8 right-8 z-50 pointer-events-auto font-mono text-[10px] tracking-[0.3em] uppercase text-slate-400 hover:text-white transition-colors flex items-center gap-2 world-reveal"
          aria-label="Exit Engineering Forge, return to orbit"
        >
          <span className="text-violet-300">←</span> Exit to orbit
        </button>
      )}
    </div>
  )
}
