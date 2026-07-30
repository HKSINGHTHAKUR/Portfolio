'use client'

import {
  useAppStore,
  selectWorldState,
  selectActiveWorld,
} from '@/store/useAppStore'
import ChamberEnvironment, { TONE_INDIGO } from '../shared/ChamberEnvironment'
import GalaxyTransitPanel from '../shared/GalaxyTransitPanel'
import IdentityReconstruction from './IdentityReconstruction'
import SystemInfo from './SystemInfo'

/**
 * HomeWorld — HK Core, the architect-identity world behind the Home Planet.
 *
 * Mirrors the Projects World architecture exactly: mounted only when the
 * active world is `home` and the world state has progressed past the universe
 * view; content reveals only once `worldState === 'inside'` so it never
 * appears mid-dive. The indigo command chamber seals off the WebGL universe.
 *
 * Split-screen composition:
 *   LEFT  — identity reconstruction (dot-matrix face + HUD)
 *   RIGHT — system information readout
 *   The centre stays visually open.
 */
export default function HomeWorld() {
  const worldState  = useAppStore(selectWorldState)
  const activeWorld = useAppStore(selectActiveWorld)
  const exitWorld   = useAppStore((s) => s.exitWorld)

  if (activeWorld !== 'home') return null
  if (worldState === 'universe') return null

  const inside = worldState === 'inside'

  return (
    <div className="fixed inset-0 z-20">
      {/* Indigo command chamber + data streams backdrop */}
      <ChamberEnvironment tone={TONE_INDIGO} />
      <CoreDataStreams />

      {/* Galaxy transit network — jump directly to any other world */}
      {inside && <GalaxyTransitPanel current="home" accent="#a5b4fc" />}

      {/* Core content — fades in only when stabilised inside */}
      <div
        className="relative z-10 w-full h-full"
        style={{
          opacity: inside ? 1 : 0,
          transition: 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: inside ? 'auto' : 'none',
        }}
      >
        {inside && (
          <div className="absolute inset-0 flex items-center">
            <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">
              {/* LEFT — identity reconstruction (centred in its column, clear
                  of the top-left transit panel) */}
              <div className="order-2 lg:order-1 flex justify-center">
                <IdentityReconstruction />
              </div>

              {/* RIGHT — system information */}
              <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                <SystemInfo />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exit affordance — identical pattern to Projects World */}
      {inside && (
        <button
          type="button"
          onClick={exitWorld}
          className="fixed top-20 right-8 z-30 pointer-events-auto font-mono text-[10px] tracking-[0.3em] uppercase text-slate-400 hover:text-white transition-colors flex items-center gap-2 world-reveal"
          aria-label="Exit HK Core, return to orbit"
        >
          <span className="text-indigo-300">←</span> Exit to orbit
        </button>
      )}
    </div>
  )
}

/**
 * CoreDataStreams — Layer 2 of the HK Core environment: faint, slow vertical
 * data columns (~10% opacity). Pure CSS, deterministic placement for SSR.
 */
const STREAMS = [
  { left: '8%',  dur: 18, delay: 0,   w: 1 },
  { left: '18%', dur: 24, delay: 4,   w: 1 },
  { left: '31%', dur: 20, delay: 2,   w: 2 },
  { left: '47%', dur: 27, delay: 6,   w: 1 },
  { left: '58%', dur: 22, delay: 1,   w: 1 },
  { left: '69%', dur: 19, delay: 5,   w: 2 },
  { left: '81%', dur: 25, delay: 3,   w: 1 },
  { left: '92%', dur: 21, delay: 7,   w: 1 },
] as const

function CoreDataStreams() {
  return (
    <div aria-hidden="true" className="hkc-streams fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {STREAMS.map((s, i) => (
        <span
          key={i}
          className="hkc-stream"
          style={{
            left: s.left,
            width: `${s.w}px`,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
