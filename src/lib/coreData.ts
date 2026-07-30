/**
 * coreData — content for HK Core (the home identity world).
 *
 * Minimal, structured copy for the right-side system panel. No résumé dump.
 */

export const IDENTITY = {
  name:    'Harsh K. Singh',
  role:    'System Architect',
  description:
    'Full Stack Engineer building scalable systems, immersive digital experiences, and intelligent software products.',
} as const

export const FOCUS_AREAS: string[] = [
  'MERN Stack',
  'Flutter',
  'Java',
  'System Design',
  'AI Assisted Development',
  'Cloud Architecture',
  'Backend Engineering',
]

export const MISSION =
  'Building products that combine engineering, psychology, immersive design, and modern software architecture.'

export interface StatusLine {
  label: string
  value: string
}

export const SYSTEM_STATUS: StatusLine[] = [
  { label: 'STATUS',        value: 'ONLINE' },
  { label: 'ROLE',          value: 'FULL STACK ENGINEER' },
  { label: 'PRIMARY STACK', value: 'MERN' },
  { label: 'LOCATION',      value: 'INDIA' },
  { label: 'UNIVERSE',      value: 'HK.GALAXY' },
  { label: 'VERSION',       value: '1.0' },
]
