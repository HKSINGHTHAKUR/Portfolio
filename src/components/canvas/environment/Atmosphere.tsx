'use client'

import EnergyFlow from './EnergyFlow'
import Nebula from './Nebula'
import GalaxySwirls from './GalaxySwirls'
import Starfield from './Starfield'
import EnergyCore from './EnergyCore'
import SpaceDust from './SpaceDust'

/**
 * Atmosphere — central environment composition manager.
 *
 * Multi-layer cinematic depth engine. Render order back → front:
 *
 *   1. EnergyFlow    — camera-anchored shader plane (deepest backdrop wash)
 *   2. Nebula        — full-sphere volumetric colour shell
 *   3. GalaxySwirls  — distant rotating spiral galaxies (subconscious depth)
 *   4. Starfield     — three depth-separated star shells with parallax
 *   5. EnergyCore    — focal anchor halo at world origin
 *   6. SpaceDust     — foreground micro-particles (closest to camera)
 *
 * All six layers move at independent rates and intensities. Several read
 * the navigation store directly to subtly intensify during travel — the
 * "camera-reactive environment" cue.
 *
 * Rule: no logic lives here — only composition.
 */
export default function Atmosphere() {
  return (
    <group name="atmosphere">
      <EnergyFlow />
      <Nebula />
      <GalaxySwirls />
      <Starfield />
      <EnergyCore />
      <SpaceDust />
    </group>
  )
}
