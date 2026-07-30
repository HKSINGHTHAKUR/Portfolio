// ─── Intro / cinematic entry ──────────────────────────────────────────────────
//
// The intro is a single deterministic state machine. Each stage owns a fixed
// duration; IntroSequence advances `introStage` + `introProgress` (0..1 within
// the current stage) once per frame. All 3-D and HTML layers read these two
// values and react accordingly — no duplicated timers.
export const IntroStage = {
  VOID:           0, // dark universe, nothing visible
  GALAXY_REVEAL:  1, // galaxy slowly fades in
  APPROACH:       2, // camera drifts toward the galaxy
  DIVE:           3, // camera accelerates into the core
  WARP:           4, // brief warp transition
  ARRIVAL:        5, // settle into the solar system
  ACTIVE:         6, // intro complete; main experience live
} as const

export type IntroStageValue = (typeof IntroStage)[keyof typeof IntroStage]

// ─── Section types ────────────────────────────────────────────────────────────
export type SectionId = 'hero' | 'projects' | 'tech' | 'journey' | 'contact'

export interface SectionConfig {
  id: SectionId
  label: string
  path: string
}

// ─── Camera state ─────────────────────────────────────────────────────────────
export interface CameraState {
  position: [number, number, number]
  target: [number, number, number]
  fov: number
}

// ─── Transition state ─────────────────────────────────────────────────────────
export type TransitionPhase = 'idle' | 'entering' | 'leaving'

export interface TransitionState {
  phase: TransitionPhase
  fromSection: SectionId | null
  toSection: SectionId | null
}

// ─── World immersion state ────────────────────────────────────────────────────
//
// A "world" is an immersive destination entered FROM a planet. The state
// machine is independent of planet travel:
//
//   universe  → standing in the solar system, orbiting a planet
//   entering  → camera diving into the planet, it expands, portal builds
//   inside    → the immersive world UI is live, universe dimmed behind
//   exiting   → reverse of entering, returning to the orbit
//
export type WorldState = 'universe' | 'entering' | 'inside' | 'exiting'

// ─── WebGL canvas props ────────────────────────────────────────────────────────
export interface CanvasConfig {
  pixelRatio: number
  antialias: boolean
  alpha: boolean
}

// ─── Planet (future use) ──────────────────────────────────────────────────────
export interface PlanetConfig {
  id: SectionId
  label: string
  /** Orbital radius from system centre */
  orbitRadius: number
  /** Initial angle in radians */
  orbitAngle: number
  /** Orbital speed multiplier */
  orbitSpeed: number
  color: string
  glowColor: string
  scale: number
}
