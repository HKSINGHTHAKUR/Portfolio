'use client'

import { useAppStore, selectIntroCompleted } from '@/store/useAppStore'
import { PLANETS, PLANET_IDS } from '@/lib/planets'
import PlanetAnchor from './PlanetAnchor'

/**
 * PlanetSystem — mounts every destination's spatial anchor.
 *
 * Suppressed during the intro so the galaxy reveal isn't visually polluted
 * by a constellation of planets. Once the user arrives in the live universe,
 * the anchors fade in via their own Fresnel shaders.
 */
export default function PlanetSystem() {
  const introDone = useAppStore(selectIntroCompleted)
  if (!introDone) return null

  return (
    <group name="planet-system">
      {PLANET_IDS.map((id) => (
        <PlanetAnchor key={id} planet={PLANETS[id]} />
      ))}
    </group>
  )
}
