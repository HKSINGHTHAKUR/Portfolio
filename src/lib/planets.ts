import * as THREE from 'three'

// ─── Planet identifiers ───────────────────────────────────────────────────────
//
// Five spatial destinations. The intro stage already spells "ENTER" — these
// destinations spell out the post-arrival experience.
export type PlanetId = 'home' | 'projects' | 'tech' | 'journey' | 'contact'

export const PLANET_IDS: readonly PlanetId[] = [
  'home',
  'projects',
  'tech',
  'journey',
  'contact',
] as const

// ─── Atmosphere preset ────────────────────────────────────────────────────────
//
// Each planet subtly tints lighting, particle drift, and core color so the
// universe still feels cohesive — never a dramatic environment swap.
export type AtmospherePreset =
  | 'core'            // home — balanced indigo
  | 'industrial'      // projects — cool blue / cyan
  | 'neural'          // tech — violet / holographic
  | 'archive'         // journey — warm amber memory
  | 'comm'            // contact — emerald terminal

// ─── Planet record ────────────────────────────────────────────────────────────
//
// World position is where the planet anchor sits. Camera position is where
// the camera should orbit FROM when stabilised at this destination. The
// camera always looks at the planet's world position.
export interface Planet {
  id:               PlanetId
  label:            string
  /** Spatial anchor — where the planet renders. */
  worldPosition:    THREE.Vector3
  /** Camera resting pose when stabilised at this planet. */
  cameraPosition:   THREE.Vector3
  /** Atmosphere preset name — drives subtle environmental tinting. */
  atmosphere:       AtmospherePreset
  /** Visible orb radius. */
  radius:           number
  /** Primary surface / glow colour (hex). */
  color:            string
  /** Outer rim / accent colour (hex). */
  glow:             string
}

// ─── Registry ─────────────────────────────────────────────────────────────────
//
// The five destinations are spread across the post-arrival universe. The
// scale is intentional: each planet is far enough from the next that travel
// genuinely feels like crossing space, but the camera resting positions are
// all in the same Z-band (~ -8 to -90) so the user always sees the same
// nebula horizon — the universe stays cohesive.
//
// Planets are placed forward of the camera (negative Z) along an open path so
// every destination remains visible from the home anchor while still feeling
// genuinely spatial.
export const PLANETS: Record<PlanetId, Planet> = {
  home: {
    id:             'home',
    label:          'Home',
    worldPosition:  new THREE.Vector3(0, 0, 0),
    cameraPosition: new THREE.Vector3(0, 1.5, 22),
    atmosphere:     'core',
    radius:         4.5,
    color:          '#6366f1',  // indigo-500
    glow:           '#a5b4fc',  // indigo-300
  },
  projects: {
    id:             'projects',
    label:          'Projects',
    worldPosition:  new THREE.Vector3(42, 6, -28),
    cameraPosition: new THREE.Vector3(42, 8, -8),
    atmosphere:     'industrial',
    radius:         3.4,
    color:          '#0ea5e9',  // sky-500
    glow:           '#7dd3fc',  // sky-300
  },
  tech: {
    id:             'tech',
    label:          'Tech',
    worldPosition:  new THREE.Vector3(-38, -4, -56),
    cameraPosition: new THREE.Vector3(-34, -2, -36),
    atmosphere:     'neural',
    radius:         3.0,
    color:          '#8b5cf6',  // violet-500
    glow:           '#c4b5fd',  // violet-300
  },
  journey: {
    id:             'journey',
    label:          'Mission',
    worldPosition:  new THREE.Vector3(24, -18, -86),
    cameraPosition: new THREE.Vector3(28, -14, -64),
    atmosphere:     'archive',
    radius:         2.8,
    color:          '#2563eb',  // blue-600 — command deck
    glow:           '#60a5fa',  // blue-400
  },
  contact: {
    id:             'contact',
    label:          'Contact',
    worldPosition:  new THREE.Vector3(-22, 16, -108),
    cameraPosition: new THREE.Vector3(-18, 18, -86),
    atmosphere:     'comm',
    radius:         2.6,
    color:          '#06b6d4',  // cyan-500 — transmission relay
    glow:           '#67e8f9',  // cyan-300
  },
}

/** Travel duration in seconds, scaled by spatial distance for cinematic pacing. */
export const TRAVEL_BASE_DURATION = 2.4
export const TRAVEL_DURATION_PER_UNIT = 0.012
export const TRAVEL_MIN_DURATION = 2.6
export const TRAVEL_MAX_DURATION = 4.2

// ─── World immersion timing ───────────────────────────────────────────────────
/** Seconds for the dive-into-planet entry sequence. */
export const WORLD_ENTRY_DURATION = 2.6
/** Seconds for the reverse dive when exiting a world. */
export const WORLD_EXIT_DURATION = 1.8

/**
 * Which planets currently have a fully-built immersive world.
 * `home` (HK Core World) and `projects` are implemented; the others fall
 * back to the universe destination panel until their worlds are built.
 */
export const WORLDS_AVAILABLE: Record<PlanetId, boolean> = {
  home:     true,
  projects: true,
  tech:     true,
  journey:  true,
  contact:  true,
}

/**
 * Compute a cinematic travel duration based on the spatial distance between
 * two planets. Short hops feel responsive, long hauls feel weighty — but
 * always within a tight, premium window.
 */
export function computeTravelDuration(from: PlanetId, to: PlanetId): number {
  if (from === to) return 0
  const distance = PLANETS[from].cameraPosition.distanceTo(PLANETS[to].cameraPosition)
  const raw      = TRAVEL_BASE_DURATION + distance * TRAVEL_DURATION_PER_UNIT
  return Math.max(TRAVEL_MIN_DURATION, Math.min(TRAVEL_MAX_DURATION, raw))
}
