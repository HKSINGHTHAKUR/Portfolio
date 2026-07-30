'use client'

import { useFrame } from '@react-three/fiber'
import { useAppStore } from '@/store/useAppStore'
import { WORLD_ENTRY_DURATION, WORLD_EXIT_DURATION } from '@/lib/planets'

/**
 * WorldTransitionController — drives the world entry/exit dive progress.
 *
 * Mirrors TravelController's pattern: a single canvas useFrame loop that
 * reads state via getState() and advances `worldProgress`.
 *
 *   • worldState === 'entering' → progress climbs 0 → 1, then completeWorldEntry
 *   • worldState === 'exiting'  → progress falls  1 → 0, then completeWorldExit
 *
 * Renders nothing.
 */
export default function WorldTransitionController() {
  useFrame((_state, delta) => {
    const s = useAppStore.getState()

    if (s.worldState === 'entering') {
      const next = Math.min(1, s.worldProgress + delta / WORLD_ENTRY_DURATION)
      if (next >= 1) {
        s.setWorldProgress(1)
        s.completeWorldEntry()
        return
      }
      s.setWorldProgress(next)
      return
    }

    if (s.worldState === 'exiting') {
      const next = Math.max(0, s.worldProgress - delta / WORLD_EXIT_DURATION)
      if (next <= 0) {
        s.setWorldProgress(0)
        s.completeWorldExit()
        return
      }
      s.setWorldProgress(next)
      return
    }
  })

  return null
}
