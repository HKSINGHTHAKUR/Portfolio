import type { SectionConfig, PlanetConfig, SectionId } from '@/types'

// ─── Navigation sections ──────────────────────────────────────────────────────
export const SECTIONS: SectionConfig[] = [
  { id: 'hero',     label: 'Home',     path: '/'        },
  { id: 'projects', label: 'Projects', path: '/projects' },
  { id: 'tech',     label: 'Tech',     path: '/tech'     },
  { id: 'journey',  label: 'Mission',  path: '/journey'  },
  { id: 'contact',  label: 'Contact',  path: '/contact'  },
]

// ─── Planet configs (orbital solar system) ───────────────────────────────────
// Angles in radians; will be expanded when the 3-D solar system is wired up.
export const PLANETS: PlanetConfig[] = [
  {
    id: 'hero',
    label: 'Origin',
    orbitRadius: 0,
    orbitAngle: 0,
    orbitSpeed: 0,
    color: '#6366f1',
    glowColor: '#818cf8',
    scale: 1.8,
  },
  {
    id: 'projects',
    label: 'Projects',
    orbitRadius: 6,
    orbitAngle: 0,
    orbitSpeed: 0.4,
    color: '#0ea5e9',
    glowColor: '#38bdf8',
    scale: 1.2,
  },
  {
    id: 'tech',
    label: 'Tech',
    orbitRadius: 10,
    orbitAngle: Math.PI / 3,
    orbitSpeed: 0.25,
    color: '#8b5cf6',
    glowColor: '#a78bfa',
    scale: 1.0,
  },
  {
    id: 'journey',
    label: 'Mission',
    orbitRadius: 14,
    orbitAngle: Math.PI,
    orbitSpeed: 0.18,
    color: '#2563eb',
    glowColor: '#60a5fa',
    scale: 0.9,
  },
  {
    id: 'contact',
    label: 'Contact',
    orbitRadius: 18,
    orbitAngle: (4 * Math.PI) / 3,
    orbitSpeed: 0.12,
    color: '#06b6d4',
    glowColor: '#67e8f9',
    scale: 0.8,
  },
]

// ─── Performance budgets ──────────────────────────────────────────────────────
export const PERF = {
  MAX_PIXEL_RATIO: 2,
  PARTICLE_COUNT: 45_000,
  TARGET_FPS: 60,
} as const

// ─── Animation durations (ms) ─────────────────────────────────────────────────
export const DURATION = {
  PAGE_TRANSITION: 600,
  SECTION_ENTER: 800,
  CAMERA_EASE: 1200,
  STAGGER_STEP: 150,
} as const
