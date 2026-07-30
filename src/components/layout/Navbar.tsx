'use client'

import {
  useAppStore,
  selectIntroCompleted,
  selectActivePlanet,
  selectIsTraveling,
  selectInWorldFlow,
  selectTransferTarget,
} from '@/store/useAppStore'
import { PLANET_IDS, PLANETS } from '@/lib/planets'
import type { PlanetId } from '@/lib/planets'

/**
 * Navbar — destination control panel.
 *
 * Clicking a destination triggers `navigateTo()` on the store, which sets
 * up the travel state. The CameraRig then animates between camera poses,
 * and the universe stays fully persistent — no scroll, no route change.
 *
 * Hidden during world-immersion flow and during an interplanetary transfer so
 * the chamber / transfer HUD owns the screen.
 */
export default function Navbar() {
  const introCompleted = useAppStore(selectIntroCompleted)
  const activePlanet   = useAppStore(selectActivePlanet)
  const isTraveling    = useAppStore(selectIsTraveling)
  const inWorldFlow    = useAppStore(selectInWorldFlow)
  const transferTarget = useAppStore(selectTransferTarget)
  const navigateTo     = useAppStore((s) => s.navigateTo)
  const replayIntro    = useAppStore((s) => s.replayIntro)

  // Visible only in the universe view, after the intro completes — never while
  // immersed in a world or mid-transfer.
  const visible = introCompleted && !inWorldFlow && transferTarget === null

  const onTravel = (id: PlanetId) => {
    if (id === activePlanet && !isTraveling) return
    navigateTo(id)
  }

  return (
    <header
      role="banner"
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-700',
        !visible ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100',
        'bg-gradient-to-b from-space-950/60 via-space-950/30 to-transparent backdrop-blur-sm',
      ].join(' ')}
      aria-hidden={!visible ? 'true' : undefined}
    >
      <nav
        aria-label="Destination control"
        className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
      >
        {/* Wordmark */}
        <button
          type="button"
          onClick={() => onTravel('home')}
          className="font-mono text-sm text-accent tracking-widest uppercase hover:text-white transition-colors"
          aria-label="Travel to home"
        >
          HK · GALAXY
        </button>

        {/* Destinations — non-home */}
        <ul className="hidden md:flex items-center gap-7 list-none">
          {PLANET_IDS.filter((id) => id !== 'home').map((id) => {
            const planet   = PLANETS[id]
            const isActive = activePlanet === id

            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onTravel(id)}
                  disabled={isTraveling}
                  className={[
                    'relative font-mono text-xs tracking-[0.2em] uppercase transition-colors duration-300',
                    'flex items-center gap-2 px-1 py-2',
                    isActive ? 'text-accent' : 'text-muted hover:text-white',
                    isTraveling && !isActive ? 'opacity-50 cursor-not-allowed' : '',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Travel to ${planet.label}`}
                >
                  {/* Status dot — colour matches planet glow */}
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: isActive ? planet.glow : 'rgba(255,255,255,0.18)',
                      boxShadow:       isActive ? `0 0 10px ${planet.glow}` : 'none',
                    }}
                    aria-hidden="true"
                  />
                  {planet.label}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Right cluster */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={replayIntro}
            disabled={isTraveling}
            className="hidden sm:inline-block font-mono text-[10px] tracking-[0.3em] uppercase text-muted/70 hover:text-accent transition-colors disabled:opacity-40"
            aria-label="Replay cinematic intro"
            title="Replay cinematic intro"
          >
            ↻ replay
          </button>

          <div
            className="flex items-center gap-2 font-mono text-xs text-muted"
            aria-label="Availability status"
          >
            <span
              className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
              aria-hidden="true"
            />
            <span className="hidden sm:block">Available</span>
          </div>
        </div>
      </nav>
    </header>
  )
}
