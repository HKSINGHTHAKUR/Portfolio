// ─── Galaxy Transit Network ───────────────────────────────────────────────────
//
// Shared metadata for the interplanetary transit panel shown inside every
// world. Maps each immersive world to its destination label, accent, the
// cinematic transfer messages, and a flavour "distance" derived from the real
// 3-D planet positions so the numbers stay consistent.

import { PLANETS, type PlanetId } from '@/lib/planets'

export interface TransitDestination {
  /** Planet id (note: the Mission world uses the `journey` slot). */
  id:        PlanetId
  /** Display label in the transit list. */
  label:     string
  /** Accent colour matching the world's tone. */
  accent:    string
  /** Two-line cinematic message shown while transferring TO this world. */
  transfer:  [string, string]
}

/** The five worlds, in network order. */
export const TRANSIT: TransitDestination[] = [
  {
    id:    'home',
    label: 'System Core',
    accent: '#a5b4fc',
    transfer: ['Returning to System Core...', 'Syncing central database...'],
  },
  {
    id:    'projects',
    label: 'Projects Archive',
    accent: '#22d3ee',
    transfer: ['Locking engineering archive...', 'Loading project records...'],
  },
  {
    id:    'tech',
    label: 'Engineering Forge',
    accent: '#a78bfa',
    transfer: ['Connecting to Engineering Forge...', 'Scanning technology matrix...'],
  },
  {
    id:    'journey',
    label: 'Mission Control',
    accent: '#60a5fa',
    transfer: ['Opening strategic command...', 'Updating objectives...'],
  },
  {
    id:    'contact',
    label: 'Transmission Hub',
    accent: '#22d3ee',
    transfer: ['Establishing communication channel...', 'Routing signal...'],
  },
]

/** Quick lookup by id. */
export const TRANSIT_BY_ID: Record<PlanetId, TransitDestination> = Object.fromEntries(
  TRANSIT.map((t) => [t.id, t]),
) as Record<PlanetId, TransitDestination>

/**
 * Flavour distance (in "AU") between two worlds, derived from the real planet
 * world positions and scaled into a believable range. Deterministic + stable.
 */
export function transitDistance(from: PlanetId, to: PlanetId): number {
  const d = PLANETS[from].worldPosition.distanceTo(PLANETS[to].worldPosition)
  return Math.round(d * 0.12 * 10) / 10 // scale → one decimal AU
}

/** The cinematic progress steps shown during an interplanetary transfer. */
export const TRANSFER_STEPS = [
  'Departure complete',
  'Orbit reached',
  'Target locked',
  'Arrival imminent',
  'Docking...',
] as const
