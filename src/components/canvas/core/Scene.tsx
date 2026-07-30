'use client'

import Lighting from '../environment/Lighting'
import Atmosphere from '../environment/Atmosphere'
import GalaxyIntro from '../intro/GalaxyIntro'
import PlanetSystem from '../planets/PlanetSystem'
import TravelController from '../navigation/TravelController'
import WorldTransitionController from '../navigation/WorldTransitionController'
import CameraRig from './CameraRig'

/**
 * Scene — top-level 3-D composition.
 *
 * Render hierarchy:
 *   • CameraRig                — drives the camera; renders nothing
 *   • TravelController         — planet-travel state machine; renders nothing
 *   • WorldTransitionController — world entry/exit dive; renders nothing
 *   • Lighting                 — five-light cinematic engine
 *   • Atmosphere               — Nebula → Starfield → EnergyCore → SpaceDust
 *   • GalaxyIntro              — galaxy + warp; mounted only during the intro
 *   • PlanetSystem             — the 5 destination anchors; after intro only
 *
 * Both GalaxyIntro and PlanetSystem self-gate: GalaxyIntro returns null once
 * intro completes, PlanetSystem returns null while intro is running. Zero
 * idle GPU cost on the unused side of that boundary.
 */
export default function Scene() {
  return (
    <>
      <CameraRig />
      <TravelController />
      <WorldTransitionController />

      <Lighting />
      <Atmosphere />

      <GalaxyIntro />
      <PlanetSystem />
    </>
  )
}
