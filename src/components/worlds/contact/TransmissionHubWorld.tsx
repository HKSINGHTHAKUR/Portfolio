'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  useAppStore,
  selectWorldState,
  selectActiveWorld,
} from '@/store/useAppStore'
import ChamberEnvironment, { TONE_RELAY } from '../shared/ChamberEnvironment'
import HolographicPanel from '../projects/HolographicPanel'
import {
  NODES,
  TRANSMISSION_STATUS,
  METRICS,
  MISSION_STATUS_METRIC,
  AVAILABLE_FOR,
  CONTACT,
  type TransmissionNode as TNode,
} from '@/lib/contactData'
import GalaxyBackdrop from './GalaxyBackdrop'
import BootSequence from './BootSequence'
import CommunicationCore from './CommunicationCore'
import TransmissionLines from './TransmissionLines'
import TransmissionNode from './TransmissionNode'
import NodePanel from './NodePanel'
import Counter from './Counter'
import GalaxyTransitPanel from '../shared/GalaxyTransitPanel'

const ACCENT = '#22d3ee' // cyan-400 — the relay tone

/** Orbit radius for the transmission nodes, as canvas % from centre. */
const ORBIT_R = 38

/**
 * TransmissionHubWorld — the final world: a secure interstellar communication
 * terminal and the grand finale of HK Galaxy. Reuses the exact world
 * architecture (worldState / worldProgress / enter / exit / transition /
 * portal); content reveals only once `inside`.
 *
 * On entry a cinematic boot sequence runs (relay initialisation), then the
 * core activates, nodes appear, panels fade in, and the terminal starts. On
 * exit the network powers down before the camera dives back out.
 *
 * Centre — the Quantum Communication Core, orbited by four transmission nodes
 * wired with animated channels and travelling data packets. Right rail — live
 * status, metrics, availability, and a direct-contact card. A live terminal
 * runs at the bottom. A slow galaxy backdrop drifts behind everything.
 */
export default function TransmissionHubWorld() {
  const worldState  = useAppStore(selectWorldState)
  const activeWorld = useAppStore(selectActiveWorld)
  const exitWorld   = useAppStore((s) => s.exitWorld)

  const [active, setActive]   = useState<TNode | null>(null)
  const [copied, setCopied]   = useState(false)
  const [booted, setBooted]   = useState(false)   // boot sequence finished
  const [powering, setPower]  = useState(false)   // exit power-down running

  const openNode = useCallback((n: TNode) => setActive(n), [])
  const onBooted = useCallback(() => setBooted(true), [])

  // Reset the boot/power state whenever we leave the world so re-entry replays
  // the full cinematic startup.
  useEffect(() => {
    if (activeWorld !== 'contact' || worldState === 'universe') {
      setBooted(false)
      setPower(false)
      setActive(null)
    }
  }, [activeWorld, worldState])

  // Power-down then trigger the shared exit dive.
  const handleExit = useCallback(() => {
    setActive(null)
    setPower(true)
    setTimeout(() => exitWorld(), 900)
  }, [exitWorld])

  const copyPhone = useCallback(() => {
    navigator.clipboard?.writeText(CONTACT.phone).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      () => { /* clipboard blocked — no-op */ },
    )
  }, [])

  // Node centres on the orbit (top = 0°, clockwise) over a 0–100 canvas.
  const nodePos = useMemo(
    () =>
      NODES.map((n) => {
        const rad = ((n.angle - 90) * Math.PI) / 180
        return { id: n.id, x: 50 + ORBIT_R * Math.cos(rad), y: 50 + ORBIT_R * Math.sin(rad) }
      }),
    [],
  )
  const posById = useMemo(
    () => Object.fromEntries(nodePos.map((p) => [p.id, p])),
    [nodePos],
  )

  if (activeWorld !== 'contact') return null
  if (worldState === 'universe') return null

  const inside = worldState === 'inside'
  // The full hub shows once we're inside AND the boot sequence has completed,
  // and hides again while powering down on exit.
  const live = inside && booted && !powering

  return (
    <div className="fixed inset-0 z-20">
      {/* Cyan relay chamber backdrop + slow galaxy formations */}
      <ChamberEnvironment tone={TONE_RELAY} />
      {inside && <GalaxyBackdrop />}

      {/* Boot sequence — plays once on entry, before the hub reveals */}
      {inside && !booted && <BootSequence accent={ACCENT} onComplete={onBooted} />}

      {/* Galaxy transit network — top-left, once the hub is live */}
      {live && <GalaxyTransitPanel current="contact" accent={ACCENT} />}

      {/* Hub content */}
      <div
        className="relative z-10 w-full h-full"
        style={{
          opacity: live ? 1 : 0,
          transition: powering
            ? 'opacity 800ms cubic-bezier(0.16, 1, 0.3, 1)'
            : 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: live ? 'auto' : 'none',
        }}
      >
        {(live || powering) && (
          <>
            {/* ── Header ─────────────────────────────────────────────── */}
            <header className="fixed top-[4.5rem] left-1/2 -translate-x-1/2 z-30 text-center world-reveal pointer-events-none">
              <h2
                className="font-sans text-[clamp(1.5rem,3.4vw,2.4rem)] font-bold text-white tracking-tight"
                style={{ textShadow: `0 0 40px ${ACCENT}66` }}
              >
                Transmission Hub.
              </h2>
              <p className="mt-1 font-mono text-[10px] tracking-[0.34em] uppercase text-cyan-300/70">
                Secure Interstellar Communication Network
              </p>
              <p className="mt-1 font-mono text-[9px] tracking-[0.3em] uppercase text-slate-500">
                Establish Direct Contact With HK Galaxy
              </p>
            </header>

            {/* ── Centre stage — core + channels + nodes ─────────────── */}
            <div className={`cx-stage ${powering ? 'cx-powerdown' : ''}`}>
              <div className="cx-canvas">
                <CommunicationCore />
                <TransmissionLines nodePos={nodePos} accent={ACCENT} />
                {NODES.map((n, i) => (
                  <TransmissionNode
                    key={n.id}
                    node={n}
                    pos={posById[n.id]}
                    order={i}
                    active={active?.id === n.id}
                    accent={ACCENT}
                    onOpen={openNode}
                  />
                ))}
              </div>
            </div>

            {/* ── RIGHT rail — status / metrics / availability / contact ─ */}
            <div className="cx-rail world-reveal">
              {/* Live transmission status */}
              <HolographicPanel accent={ACCENT} className="p-5">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
                  Live Transmission Status
                </div>
                <dl className="space-y-1.5">
                  {TRANSMISSION_STATUS.map((s) => (
                    <div key={s.label} className="flex items-baseline justify-between gap-3">
                      <dt className="font-mono text-[8px] tracking-[0.2em] uppercase text-slate-500">{s.label}</dt>
                      <dd
                        className={`font-mono text-[9px] tracking-[0.12em] uppercase text-right ${s.label === 'Signal Quality' ? 'cx-flicker' : ''}`}
                        style={{ color: s.live ? '#6ee7b7' : `${ACCENT}dd` }}
                      >
                        {s.live && <span className="hkc-blink mr-1.5">●</span>}
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </HolographicPanel>

              {/* Communication metrics — animated counters */}
              <HolographicPanel accent={ACCENT} className="p-5">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
                  Communication Metrics
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {METRICS.map((m) => (
                    <div key={m.label} className="rounded-md py-2.5 px-2 text-center" style={{ backgroundColor: `${ACCENT}0c`, border: `1px solid ${ACCENT}22` }}>
                      <div className="font-mono text-lg font-semibold" style={{ color: ACCENT, textShadow: `0 0 18px ${ACCENT}66` }}>
                        <Counter value={m.value} suffix={m.suffix} />
                      </div>
                      <div className="font-mono text-[7px] tracking-[0.16em] uppercase text-slate-500 mt-1 leading-tight">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-slate-500">Mission Status</span>
                  <span className="font-mono text-[9px] tracking-[0.12em] uppercase" style={{ color: '#6ee7b7' }}>
                    <span className="hkc-blink mr-1.5">●</span>{MISSION_STATUS_METRIC}
                  </span>
                </div>
              </HolographicPanel>

              {/* Availability board */}
              <HolographicPanel accent={ACCENT} className="p-5">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: ACCENT }}>
                  Available For
                </div>
                <ul className="space-y-1.5">
                  {AVAILABLE_FOR.map((a) => (
                    <li key={a} className="font-mono text-[10px] text-slate-300 leading-relaxed flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#34d399', boxShadow: '0 0 6px #34d399' }} />
                      {a}
                    </li>
                  ))}
                </ul>
              </HolographicPanel>

              {/* Direct communication card */}
              <HolographicPanel accent={ACCENT} className="p-5">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase mb-2" style={{ color: ACCENT }}>
                  Direct Channel
                </div>
                <div className="font-sans text-base font-semibold text-white tracking-wide">
                  {CONTACT.phone}
                </div>
                <button
                  type="button"
                  onClick={copyPhone}
                  className="mt-3 w-full font-mono text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 rounded-md transition-all hover:brightness-125"
                  style={{ color: '#fff', backgroundColor: `${ACCENT}1f`, border: `1px solid ${ACCENT}55` }}
                  aria-label="Copy contact number to clipboard"
                >
                  {copied ? '✓ Channel Copied' : '⧉ Copy Channel ID'}
                </button>
              </HolographicPanel>
            </div>
          </>
        )}
      </div>

      {/* Node communication panel */}
      {live && <NodePanel node={active} accent={ACCENT} onClose={() => setActive(null)} />}

      {/* Exit affordance — powers the network down, then dives out */}
      {live && (
        <button
          type="button"
          onClick={handleExit}
          className="fixed bottom-8 right-8 z-50 pointer-events-auto font-mono text-[10px] tracking-[0.3em] uppercase text-slate-400 hover:text-white transition-colors flex items-center gap-2 world-reveal"
          aria-label="Exit Transmission Hub, return to orbit"
        >
          <span className="text-cyan-300">←</span> Exit to orbit
        </button>
      )}
    </div>
  )
}
