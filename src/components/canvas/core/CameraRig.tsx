'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'
import { IntroStage } from '@/types'
import { PLANETS, type PlanetId } from '@/lib/planets'

// ─── Idle-mode tuning ─────────────────────────────────────────────────────────
const PARALLAX_STRENGTH = 0.6
const POSITION_DAMPING  = 0.04
const FLOAT_AMPLITUDE   = 0.10
const FLOAT_PERIOD      = 8.0

// ─── Camera FOV envelope ──────────────────────────────────────────────────────
const FOV_BASE  = 60
const FOV_PEAK  = 78  // intro warp peak
const FOV_TRAVEL = 68 // subtle expansion mid-travel

// ─── Intro turbulence tuning ─────────────────────────────────────────────────
const TURB_POS_AMP   = 0.18
const TURB_ROT_AMP   = 0.006
const TURB_FREQ_FAST = 14.0
const TURB_FREQ_SLOW = 2.7

// ─── Travel-mode banking ──────────────────────────────────────────────────────
const TRAVEL_BANK_AMP = 0.06   // subtle camera roll mid-travel
const TRAVEL_ARC_AMP  = 1.2    // perpendicular arc deflection (units)

// ─── Reusable vectors — module scope, never reallocated per frame ────────────
const _idlePos        = new THREE.Vector3()
const _introPos       = new THREE.Vector3()
const _travelPos      = new THREE.Vector3()
const _fromPos        = new THREE.Vector3()
const _toPos          = new THREE.Vector3()
const _fromTarget     = new THREE.Vector3()
const _toTarget       = new THREE.Vector3()
const _arcDir         = new THREE.Vector3()
const _currentLookAt  = new THREE.Vector3()
const _targetLookAt   = new THREE.Vector3()
const _mouse          = new THREE.Vector2(0, 0)
const _smoothMouse    = new THREE.Vector2(0, 0)
const _turbOffset     = new THREE.Vector3()
const _divePos        = new THREE.Vector3()

// ─── World-dive tuning ────────────────────────────────────────────────────────
const FOV_DIVE = 92  // wide FOV at the peak of the dive — immersive rush

// ─── Easing ───────────────────────────────────────────────────────────────────
/** Smooth ease-in-out (cubic) — accelerates and decelerates symmetrically. */
function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Accelerating ease-in (quartic) — slow start, rushing finish. Used for the
 *  dive so the camera "falls" into the planet with building momentum. */
function easeInQuart(t: number): number {
  return t * t * t * t
}

/**
 * Compute the camera pose during a world dive.
 *
 * The camera flies from the planet's orbit camera-position toward (and
 * slightly past) the planet's world position. As `progress` → 1 the camera
 * rushes into the planet surface; the immersive world takes over visually at
 * the moment the planet fills the frame.
 */
function getDivePosition(
  planetId: PlanetId,
  progress: number,
  out: THREE.Vector3
): number {
  const planet = PLANETS[planetId]
  const eased  = easeInQuart(progress)

  _fromPos.copy(planet.cameraPosition)
  _toPos.copy(planet.worldPosition)

  // Aim slightly past the planet centre so we "pierce" it
  out.lerpVectors(_fromPos, _toPos, eased * 1.05)

  // FOV widens through the dive for the immersive rush
  const fovTarget = FOV_BASE + easeInQuart(progress) * (FOV_DIVE - FOV_BASE)
  return fovTarget
}

// ─── Intro path ───────────────────────────────────────────────────────────────
function getIntroPosition(stage: number, progress: number, out: THREE.Vector3): THREE.Vector3 {
  switch (stage) {
    case IntroStage.VOID:           out.set(0, 0, 60); break
    case IntroStage.GALAXY_REVEAL:  out.set(0, 1.2, 60 - progress * 10); break
    case IntroStage.APPROACH:       out.set(0, 1.0 - progress * 0.4, 50 - progress * 25); break
    case IntroStage.DIVE: {
      const e = progress * progress
      out.set(0, 0.6 - e * 0.5, 25 - e * 35)
      break
    }
    case IntroStage.WARP:           out.set(0, 0.1, -10 - progress * 12); break
    case IntroStage.ARRIVAL: {
      const t = 1 - Math.pow(1 - progress, 2.0)
      out.set(0, t * 0.5 + (1 - t) * 0.1, -22 + t * 44)
      break
    }
    default:                         out.set(0, 1.5, 22)
  }
  return out
}

function getTurbulenceIntensity(stage: number, progress: number): number {
  switch (stage) {
    case IntroStage.APPROACH: return Math.max(0, progress - 0.7)
    case IntroStage.DIVE:     return 0.3 + progress * 0.7
    case IntroStage.WARP:     return 1.0 - progress * 0.3
    case IntroStage.ARRIVAL:  return 0.7 * (1 - progress) * (1 - progress)
    default:                  return 0
  }
}

function getIntroFovTarget(stage: number, progress: number): number {
  if (stage === IntroStage.DIVE)    return FOV_BASE + progress * (FOV_PEAK - FOV_BASE) * 0.6
  if (stage === IntroStage.WARP)    return FOV_PEAK - progress * (FOV_PEAK - FOV_BASE) * 0.4
  if (stage === IntroStage.ARRIVAL) return FOV_BASE + Math.pow(1 - progress, 2) * (FOV_PEAK - FOV_BASE) * 0.5
  return FOV_BASE
}

function computeTurbulence(t: number, intensity: number, out: THREE.Vector3): void {
  if (intensity <= 0.001) { out.set(0, 0, 0); return }
  const fx = Math.sin(t * TURB_FREQ_FAST + 1.7) +
             Math.sin(t * TURB_FREQ_SLOW + 0.3) * 0.6
  const fy = Math.sin(t * TURB_FREQ_FAST * 0.85 + 4.2) +
             Math.sin(t * TURB_FREQ_SLOW * 1.1 + 2.1) * 0.6
  const fz = Math.sin(t * TURB_FREQ_FAST * 1.15 + 3.5) +
             Math.sin(t * TURB_FREQ_SLOW * 0.9 + 5.7) * 0.6
  const k = intensity * TURB_POS_AMP / 1.6
  out.set(fx * k, fy * k, fz * k * 0.4)
}

/**
 * Compute the camera's interpolated world position during travel.
 *
 * Adds a perpendicular arc deflection so the path is never a straight line —
 * the camera curves through space cinematically. The arc is symmetric: zero
 * at endpoints, max at midpoint, scaled by total distance.
 */
function getTravelPosition(
  fromId: PlanetId,
  toId:   PlanetId,
  rawProgress: number,
  out: THREE.Vector3
): { fovTarget: number; bank: number } {
  const from = PLANETS[fromId]
  const to   = PLANETS[toId]

  const t = easeInOutCubic(rawProgress)

  _fromPos.copy(from.cameraPosition)
  _toPos.copy(to.cameraPosition)

  // Linear interpolation
  out.lerpVectors(_fromPos, _toPos, t)

  // Perpendicular arc — bigger at midpoint, fades at endpoints.
  // Direction: cross product of (to - from) with world-up gives a horizontal
  // perpendicular. The Y component lifts the path slightly for a flying
  // arc rather than a flat sweep.
  const distance = _fromPos.distanceTo(_toPos)
  if (distance > 0.001) {
    _arcDir.subVectors(_toPos, _fromPos).normalize()
    // Perpendicular in the XZ plane
    const perpX = -_arcDir.z
    const perpZ =  _arcDir.x
    const arcStrength = Math.sin(rawProgress * Math.PI) * TRAVEL_ARC_AMP * Math.min(1, distance / 60)
    out.x += perpX * arcStrength
    out.y += Math.sin(rawProgress * Math.PI) * 1.4 * Math.min(1, distance / 80)
    out.z += perpZ * arcStrength
  }

  // FOV swells gently at midpoint
  const fovTarget = FOV_BASE + Math.sin(rawProgress * Math.PI) * (FOV_TRAVEL - FOV_BASE)

  // Subtle banking — peaks during acceleration, reverses during deceleration
  const bank = Math.sin(rawProgress * Math.PI * 2) * TRAVEL_BANK_AMP

  return { fovTarget, bank }
}

/**
 * CameraRig — three-mode cinematic camera.
 *
 * Modes (priority order):
 *   1. Intro mode (introStage < ACTIVE):
 *      Scripted galaxy-entry path + procedural turbulence + FOV swell.
 *
 *   2. Travel mode (introStage = ACTIVE && isTraveling):
 *      Eased blend between previousPlanet.cameraPosition and
 *      activePlanet.cameraPosition, with perpendicular arc deflection,
 *      gentle FOV expansion at midpoint, and subtle banking roll.
 *
 *   3. Idle mode (otherwise):
 *      Anchored at activePlanet.cameraPosition with mouse parallax + slow
 *      sinusoidal float. Always looks at activePlanet.worldPosition.
 *
 * Allocates nothing per frame.
 */
export default function CameraRig() {
  const { camera } = useThree()
  const elapsedRef = useRef(0)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      _mouse.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      )
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  useFrame((_state, delta) => {
    elapsedRef.current += delta
    const t = elapsedRef.current

    const s = useAppStore.getState()
    const introActive = s.introStage < IntroStage.ACTIVE
    const isPerspective = (camera as THREE.PerspectiveCamera).isPerspectiveCamera

    // ── Intro mode ────────────────────────────────────────────────────────
    if (introActive) {
      getIntroPosition(s.introStage, s.introProgress, _introPos)

      const turbI = getTurbulenceIntensity(s.introStage, s.introProgress)
      computeTurbulence(t, turbI, _turbOffset)

      const tx = _introPos.x + _turbOffset.x
      const ty = _introPos.y + _turbOffset.y
      const tz = _introPos.z + _turbOffset.z
      const lerpFactor = Math.min(1, delta * 2.4)
      camera.position.x += (tx - camera.position.x) * lerpFactor
      camera.position.y += (ty - camera.position.y) * lerpFactor
      camera.position.z += (tz - camera.position.z) * lerpFactor

      _targetLookAt.set(_turbOffset.x * 0.4, _turbOffset.y * 0.4, -80)
      _currentLookAt.lerp(_targetLookAt, Math.min(1, delta * 2.0))
      camera.lookAt(_currentLookAt)
      camera.rotation.z += Math.sin(t * TURB_FREQ_SLOW + 1.1) * turbI * TURB_ROT_AMP

      if (isPerspective) {
        const persp = camera as THREE.PerspectiveCamera
        const fovTarget = getIntroFovTarget(s.introStage, s.introProgress)
        persp.fov += (fovTarget - persp.fov) * Math.min(1, delta * 3.0)
        persp.updateProjectionMatrix()
      }
      return
    }

    // ── Travel mode ───────────────────────────────────────────────────────
    if (s.isTraveling) {
      const { fovTarget, bank } = getTravelPosition(
        s.previousPlanet,
        s.activePlanet,
        s.travelProgress,
        _travelPos
      )

      // Crisp lerp — the easing already lives inside getTravelPosition
      const lerp = Math.min(1, delta * 8.0)
      camera.position.x += (_travelPos.x - camera.position.x) * lerp
      camera.position.y += (_travelPos.y - camera.position.y) * lerp
      camera.position.z += (_travelPos.z - camera.position.z) * lerp

      // Look-at also blends so the camera "turns" toward the new target
      const eased = easeInOutCubic(s.travelProgress)
      _fromTarget.copy(PLANETS[s.previousPlanet].worldPosition)
      _toTarget.copy(PLANETS[s.activePlanet].worldPosition)
      _targetLookAt.lerpVectors(_fromTarget, _toTarget, eased)
      _currentLookAt.lerp(_targetLookAt, Math.min(1, delta * 4.0))
      camera.lookAt(_currentLookAt)

      // Subtle banking roll
      camera.rotation.z = bank

      if (isPerspective) {
        const persp = camera as THREE.PerspectiveCamera
        persp.fov += (fovTarget - persp.fov) * Math.min(1, delta * 3.5)
        persp.updateProjectionMatrix()
      }
      return
    }

    // ── World dive mode ─────────────────────────────────────────────────────
    // Active during entering / inside / exiting. worldProgress drives the
    // camera into the planet; while `inside` it parks at the dive end so the
    // universe stays hidden behind the immersive world UI.
    if (s.worldState !== 'universe' && s.activeWorld) {
      const fovTarget = getDivePosition(s.activeWorld, s.worldProgress, _divePos)

      const lerp = Math.min(1, delta * 6.0)
      camera.position.x += (_divePos.x - camera.position.x) * lerp
      camera.position.y += (_divePos.y - camera.position.y) * lerp
      camera.position.z += (_divePos.z - camera.position.z) * lerp

      // Keep looking straight at the planet centre as we pierce it
      _targetLookAt.copy(PLANETS[s.activeWorld].worldPosition)
      _currentLookAt.lerp(_targetLookAt, Math.min(1, delta * 5.0))
      camera.lookAt(_currentLookAt)
      camera.rotation.z += (0 - camera.rotation.z) * Math.min(1, delta * 4.0)

      if (isPerspective) {
        const persp = camera as THREE.PerspectiveCamera
        persp.fov += (fovTarget - persp.fov) * Math.min(1, delta * 3.0)
        persp.updateProjectionMatrix()
      }
      return
    }

    // ── Idle mode ─────────────────────────────────────────────────────────
    const planet = PLANETS[s.activePlanet]

    _smoothMouse.x += (_mouse.x - _smoothMouse.x) * POSITION_DAMPING * 60 * delta
    _smoothMouse.y += (_mouse.y - _smoothMouse.y) * POSITION_DAMPING * 60 * delta

    _idlePos.set(
      planet.cameraPosition.x +
        _smoothMouse.x * PARALLAX_STRENGTH +
        Math.sin(t / FLOAT_PERIOD) * FLOAT_AMPLITUDE,
      planet.cameraPosition.y +
        _smoothMouse.y * PARALLAX_STRENGTH * 0.6 +
        Math.sin(t / (FLOAT_PERIOD * 1.3)) * FLOAT_AMPLITUDE * 0.7,
      planet.cameraPosition.z +
        Math.sin(t / (FLOAT_PERIOD * 2)) * FLOAT_AMPLITUDE * 0.5
    )
    camera.position.lerp(_idlePos, POSITION_DAMPING * 60 * delta)

    _targetLookAt.set(
      planet.worldPosition.x - _smoothMouse.x * 0.3,
      planet.worldPosition.y - _smoothMouse.y * 0.2,
      planet.worldPosition.z
    )
    _currentLookAt.lerp(_targetLookAt, 0.06 * 60 * delta)
    camera.lookAt(_currentLookAt)

    // Smoothly settle camera roll back to 0
    if (Math.abs(camera.rotation.z) > 0.0001) {
      camera.rotation.z += (0 - camera.rotation.z) * Math.min(1, delta * 3.0)
    }

    if (isPerspective) {
      const persp = camera as THREE.PerspectiveCamera
      if (Math.abs(persp.fov - FOV_BASE) > 0.01) {
        persp.fov += (FOV_BASE - persp.fov) * Math.min(1, delta * 2.5)
        persp.updateProjectionMatrix()
      }
    }
  })

  return null
}
