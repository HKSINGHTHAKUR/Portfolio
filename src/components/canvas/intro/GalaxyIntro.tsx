'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore, selectIntroStage, selectIntroProgress } from '@/store/useAppStore'
import { IntroStage } from '@/types'
import GalaxyCore from './GalaxyCore'
import GalaxyParticles from './GalaxyParticles'
import WarpTransition from '../transitions/WarpTransition'

// ─── Stage-driven intensities ─────────────────────────────────────────────────
//
// Single helper that maps (stage, progress) → environmental parameters.
// Pure function, no allocations — invoked once per frame.
function computeIntensities(stage: number, progress: number) {
  let galaxy   = 0  // GalaxyCore + Particles overall opacity
  let coreBoost= 0  // particle size pulse during DIVE
  let warp     = 0  // WarpTransition intensity
  let scale    = 1  // master scale of the galaxy group (perceived approach)

  switch (stage) {
    case IntroStage.VOID:
      galaxy = 0
      break
    case IntroStage.GALAXY_REVEAL:
      // Fade in from black void
      galaxy = progress
      scale  = 0.85 + progress * 0.15
      break
    case IntroStage.APPROACH:
      // Galaxy already visible; appears to grow as camera moves toward it
      galaxy = 1
      scale  = 1.0 + progress * 0.5
      break
    case IntroStage.DIVE:
      // Core boosts; whole galaxy grows past us
      galaxy    = 1
      scale     = 1.5 + progress * 1.8
      coreBoost = progress * 1.2
      warp      = progress * 0.3
      break
    case IntroStage.WARP:
      // Galaxy disappears behind us; warp dominates
      galaxy = 1 - progress
      scale  = 3.3 + progress * 1.5
      warp   = 1 - Math.abs(progress - 0.5) * 2 // peak at midpoint
      break
    case IntroStage.ARRIVAL:
      // Intro structures fade out; main solar system reveals
      galaxy = 0
      warp   = (1 - progress) * 0.3
      break
    case IntroStage.ACTIVE:
    default:
      galaxy = 0
      warp   = 0
      break
  }

  return { galaxy, coreBoost, warp, scale }
}

/**
 * GalaxyIntro — the intro scene's 3-D content.
 *
 * Subscribes to (introStage, introProgress) and maps them to visual
 * parameters via `computeIntensities`. Owns the galaxy group transform
 * (rotation, scale, position) and forwards intensities to GalaxyCore,
 * GalaxyParticles, and WarpTransition.
 *
 * No timing logic lives here — IntroSequence drives the state machine.
 * This component only translates state into visuals.
 */
export default function GalaxyIntro() {
  const groupRef = useRef<THREE.Group>(null)
  const stage    = useAppStore(selectIntroStage)
  const progress = useAppStore(selectIntroProgress)

  // Memoised group offset — galaxy is positioned ahead of the camera so
  // the user "approaches" it during the APPROACH stage.
  const groupPosition = useMemo<[number, number, number]>(() => [0, 0, -80], [])

  useFrame((_state, delta) => {
    if (!groupRef.current) return

    const { scale } = computeIntensities(stage, progress)

    // Smoothly damp the scale toward the target — never snap
    const current = groupRef.current.scale.x
    const next    = current + (scale - current) * Math.min(1, delta * 4)
    groupRef.current.scale.setScalar(next)

    // Slow tilt drift — gives the galaxy disc its cinematic angle
    groupRef.current.rotation.x = -0.32
    groupRef.current.rotation.z += delta * 0.005
  })

  // Skip all GPU work once intro is complete
  if (stage >= IntroStage.ACTIVE) return null

  const { galaxy, coreBoost, warp } = computeIntensities(stage, progress)

  return (
    <>
      <group ref={groupRef} position={groupPosition} name="galaxy-intro">
        <GalaxyCore intensity={galaxy} />
        <GalaxyParticles intensity={galaxy} coreBoost={coreBoost} />
      </group>

      <WarpTransition intensity={warp} />
    </>
  )
}
