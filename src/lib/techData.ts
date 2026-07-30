// ─── Engineering Forge data model ─────────────────────────────────────────────
//
// The Tech World ("Engineering Forge") visualises the engineering stack behind
// every project in HK Galaxy. Each technology is a holographic artifact placed
// on one of three rings around the central reactor, and every artifact knows
// which real projects use it — driving the project-connection system.
//
// Only technologies that actually appear across the four real projects are
// represented. Project ids match src/lib/projectsData.ts.

import type { PlanetId } from '@/lib/planets'

/** Project ids referenced by technologies (mirror of projectsData ids). */
export type TechProjectId = 'strocter' | 'bizflow' | 'codemate' | 'aiva'

/** Which orbital ring an artifact sits on. */
export type TechRing = 'core' | 'mid' | 'outer'

export interface TechProjectNode {
  id:    TechProjectId
  label: string
  /** Position on the outer edge, as percentages (x, y) over the forge canvas. */
  position: { x: number; y: number }
  /** Accent (mirrors the project's accent in projectsData). */
  accent: string
}

export interface Technology {
  id:    string
  name:  string
  /** Short glyph/monogram shown inside the artifact frame. */
  glyph: string
  /** Engineering role, e.g. "Core Engineering Language". */
  role:  string
  /** Where it is applied — short bullet phrases. */
  usedIn: string[]
  /** Projects that actually use this technology. */
  projects: TechProjectId[]
  /** Orbital ring. */
  ring: TechRing
  /** Angle on the ring, in degrees (0 = right, clockwise). */
  angle: number
}

/** The world's planet id, for store gating. */
export const TECH_WORLD: PlanetId = 'tech'

/** The four destination project nodes around the forge edge (corners). */
export const TECH_PROJECTS: TechProjectNode[] = [
  { id: 'strocter', label: 'Strocter', position: { x: 13, y: 11 }, accent: '#22d3ee' },
  { id: 'bizflow',  label: 'BizFlow',  position: { x: 87, y: 11 }, accent: '#7dd3fc' },
  { id: 'codemate', label: 'CodeMate', position: { x: 87, y: 89 }, accent: '#a78bfa' },
  { id: 'aiva',     label: 'Aiva',     position: { x: 13, y: 89 }, accent: '#5eead4' },
]

// ─── Technologies, grouped by ring ─────────────────────────────────────────────
// Angles are spaced evenly within each ring so artifacts never collide.

export const TECHNOLOGIES: Technology[] = [
  // ── Core ring (4) ───────────────────────────────────────────────────────────
  {
    id: 'java',
    name: 'Java',
    glyph: 'JV',
    role: 'Core Engineering Language',
    usedIn: ['DSA', 'Backend Logic', 'Problem Solving'],
    projects: ['strocter', 'bizflow'],
    ring: 'core',
    angle: 0,
  },
  {
    id: 'react',
    name: 'React',
    glyph: 'Re',
    role: 'Frontend Architecture',
    usedIn: ['Component Systems', 'Dashboards', 'Interactive UI'],
    projects: ['strocter', 'bizflow', 'aiva'],
    ring: 'core',
    angle: 90,
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    glyph: 'No',
    role: 'Backend Runtime',
    usedIn: ['API Servers', 'Services', 'Tooling'],
    projects: ['strocter', 'bizflow'],
    ring: 'core',
    angle: 180,
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    glyph: 'Mo',
    role: 'Primary Data Layer',
    usedIn: ['Document Storage', 'Aggregation', 'Persistence'],
    projects: ['strocter'],
    ring: 'core',
    angle: 270,
  },

  // ── Mid ring (4) ──────────────────────────────────────────────────────────
  {
    id: 'express',
    name: 'Express',
    glyph: 'Ex',
    role: 'API Framework',
    usedIn: ['Routing', 'Middleware', 'REST Endpoints'],
    projects: ['strocter', 'bizflow'],
    ring: 'mid',
    angle: 45,
  },
  {
    id: 'jwt',
    name: 'JWT',
    glyph: 'JW',
    role: 'Authentication Layer',
    usedIn: ['Stateless Auth', 'Role-Based Access', 'Sessions'],
    projects: ['strocter'],
    ring: 'mid',
    angle: 135,
  },
  {
    id: 'rest',
    name: 'REST APIs',
    glyph: 'AP',
    role: 'Service Contracts',
    usedIn: ['Resource Endpoints', 'Client Integration', 'Versioning'],
    projects: ['strocter', 'bizflow'],
    ring: 'mid',
    angle: 225,
  },
  {
    id: 'atlas',
    name: 'MongoDB Atlas',
    glyph: 'At',
    role: 'Cloud Database',
    usedIn: ['Managed Hosting', 'Backups', 'Scaling'],
    projects: ['strocter'],
    ring: 'mid',
    angle: 315,
  },

  // ── Outer ring (9) ──────────────────────────────────────────────────────────
  {
    id: 'javascript',
    name: 'JavaScript',
    glyph: 'JS',
    role: 'Language Foundation',
    usedIn: ['Frontend Logic', 'Backend Logic', 'Tooling'],
    projects: ['strocter', 'bizflow', 'aiva'],
    ring: 'outer',
    angle: 20,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    glyph: 'TS',
    role: 'Typed Architecture',
    usedIn: ['Type Safety', 'Contracts', 'Scalable Code'],
    projects: ['aiva'],
    ring: 'outer',
    angle: 60,
  },
  {
    id: 'flutter',
    name: 'Flutter',
    glyph: 'Fl',
    role: 'Cross-Platform UI',
    usedIn: ['Mobile UI', 'Widgets', 'Prototyping'],
    projects: ['codemate'],
    ring: 'outer',
    angle: 100,
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    glyph: 'Ko',
    role: 'Android Language',
    usedIn: ['Native Android', 'App Logic', 'UI Binding'],
    projects: ['codemate'],
    ring: 'outer',
    angle: 140,
  },
  {
    id: 'firebase',
    name: 'Firebase',
    glyph: 'Fb',
    role: 'Mobile Backend',
    usedIn: ['Auth', 'Realtime Data', 'Content Delivery'],
    projects: ['codemate'],
    ring: 'outer',
    angle: 180,
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    glyph: 'Tw',
    role: 'Design System',
    usedIn: ['Utility Styling', 'Responsive UI', 'Theming'],
    projects: ['strocter'],
    ring: 'outer',
    angle: 220,
  },
  {
    id: 'git',
    name: 'Git',
    glyph: 'Gi',
    role: 'Version Control',
    usedIn: ['Branching', 'History', 'Collaboration'],
    projects: ['strocter', 'bizflow', 'codemate', 'aiva'],
    ring: 'outer',
    angle: 260,
  },
  {
    id: 'github',
    name: 'GitHub',
    glyph: 'Gh',
    role: 'Source Platform',
    usedIn: ['Repositories', 'Reviews', 'CI Hooks'],
    projects: ['strocter', 'bizflow', 'codemate', 'aiva'],
    ring: 'outer',
    angle: 300,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    glyph: 'Ve',
    role: 'Deployment Platform',
    usedIn: ['Hosting', 'Preview Deploys', 'Edge Delivery'],
    projects: ['aiva'],
    ring: 'outer',
    angle: 340,
  },
]

/** Ring radii as a fraction of the forge canvas half-size (0..1). */
export const RING_RADII: Record<TechRing, number> = {
  core:  0.16,
  mid:   0.29,
  outer: 0.43,
}

/** Total count for the HUD. */
export const TECH_COUNT = TECHNOLOGIES.length

/** Lookup: technology id → project ids it connects to. */
export function projectsForTech(techId: string): TechProjectId[] {
  return TECHNOLOGIES.find((t) => t.id === techId)?.projects ?? []
}
