'use client'

import { useFrame } from '@react-three/fiber'
import { useAppStore } from '@/store/useAppStore'

/**
 * TravelController — drives the planet-travel progress.
 *
 * Architecture:
 *   • Lives inside the persistent canvas (single useFrame loop).
 *   • Reads `isTraveling` + `travelDuration` directly from the store via
 *     `getState()` each frame to avoid re-render churn.
 *   • Increments `travelProgress` and fires `completeTravel` when it lands.
 *
 * Renders nothing.
 */
export default function TravelController() {
  useFrame((_state, delta) => {
    const s = useAppStore.getState()
    if (!s.isTraveling) return

    const duration = Math.max(0.1, s.travelDuration)
    const next     = Math.min(1, s.travelProgress + delta / duration)

    if (next >= 1) {
      s.setTravelProgress(1)
      s.completeTravel()
      return
    }

    s.setTravelProgress(next)
  })

  return null
}
