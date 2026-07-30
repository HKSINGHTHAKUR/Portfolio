'use client'

import {
  useAppStore,
  selectActivePlanet,
  selectIsTraveling,
  selectTravelProgress,
  selectIntroCompleted,
  selectPreviousPlanet,
} from '@/store/useAppStore'
import { PLANETS } from '@/lib/planets'

/**
 * PlanetHUD — bottom-left travel indicator.
 *
 * Shows the current destination at idle, switches to a "TRAVELING" marker
 * with a progress bar during transit. Sits below the navbar, above the
 * canvas, never blocking interactions.
 */
export default function PlanetHUD() {
  const introDone   = useAppStore(selectIntroCompleted)
  const active      = useAppStore(selectActivePlanet)
  const previous    = useAppStore(selectPreviousPlanet)
  const isTraveling = useAppStore(selectIsTraveling)
  const progress    = useAppStore(selectTravelProgress)

  if (!introDone) return null

  const activePlanet   = PLANETS[active]
  const previousPlanet = PLANETS[previous]

  return (
    <div
      aria-hidden="true"
      className="fixed bottom-8 left-8 z-30 pointer-events-none flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase"
    >
      {isTraveling ? (
        <>
          <span className="text-muted">From</span>
          <span style={{ color: previousPlanet.glow }}>{previousPlanet.label}</span>
          <span className="text-muted/50">→</span>
          <span style={{ color: activePlanet.glow }}>{activePlanet.label}</span>
          <div className="ml-3 h-px w-24 bg-white/10 overflow-hidden">
            <div
              className="h-full"
              style={{
                width:           `${progress * 100}%`,
                backgroundColor: activePlanet.glow,
                transition:      'width 80ms linear',
              }}
            />
          </div>
        </>
      ) : (
        <>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: activePlanet.glow,
              boxShadow:       `0 0 10px ${activePlanet.glow}`,
            }}
          />
          <span className="text-muted">Orbit</span>
          <span style={{ color: activePlanet.glow }}>{activePlanet.label}</span>
        </>
      )}
    </div>
  )
}
