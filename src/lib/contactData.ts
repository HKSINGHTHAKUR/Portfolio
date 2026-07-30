// ─── Transmission Hub data model ──────────────────────────────────────────────
//
// Content for the final world — the Transmission Hub, a deep-space relay where
// visitors open a direct communication channel with the architect. Real
// contact details only.

export type NodeKind = 'mailto' | 'external' | 'download'

export interface TransmissionNode {
  id:       string
  index:    string
  /** Short node label, e.g. "Email Channel". */
  label:    string
  /** Panel title, e.g. "PRIMARY COMMUNICATION CHANNEL". */
  title:    string
  /** Glyph/monogram shown in the node ring. */
  glyph:    string
  /** Primary display value (email, name, etc.). */
  value:    string
  /** Supporting lines shown inside the panel. */
  detail:   string[]
  /** Action button label. */
  action:   string
  /** How the action behaves. */
  kind:     NodeKind
  /** Target href (mailto / url / pdf). Empty when unavailable. */
  href:     string
  /** Position on the orbit, in degrees (0 = top, clockwise). */
  angle:    number
}

export interface StatusLine {
  label: string
  value: string
  live?: boolean
}

export interface MetricCounter {
  label: string
  /** Numeric target the counter animates to. */
  value: number
  /** Optional suffix, e.g. "+". */
  suffix?: string
}

// ─── Direct contact details ─────────────────────────────────────────────────────
export const CONTACT = {
  email: 'harshkusingh9456@gmail.com',
  phone: '7017850677',
  linkedin: 'https://www.linkedin.com/in/harsh-kumar-singh-a3450928a/',
  github: 'https://github.com/HKSINGHTHAKUR',
  name: 'Harsh Kumar Singh',
} as const

// ─── Transmission nodes (orbit the communication core) ──────────────────────────
export const NODES: TransmissionNode[] = [
  {
    id:     'email',
    index:  '01',
    label:  'Email Channel',
    title:  'Primary Communication Channel',
    glyph:  '✉',
    value:  CONTACT.email,
    detail: [
      'Professional opportunities',
      'Collaborations',
      'Technical discussions',
    ],
    action: 'Open Mail Channel',
    kind:   'mailto',
    href:   `mailto:${CONTACT.email}`,
    angle:  0,
  },
  {
    id:     'linkedin',
    index:  '02',
    label:  'LinkedIn Network',
    title:  'Professional Network',
    glyph:  'in',
    value:  CONTACT.name,
    detail: [
      'Industry connections',
      'Career discussions',
      'Professional presence',
    ],
    action: 'Open Network Link',
    kind:   'external',
    href:   CONTACT.linkedin,
    angle:  90,
  },
  {
    id:     'github',
    index:  '03',
    label:  'GitHub Archive',
    title:  'Engineering Archive',
    glyph:  '⌥',
    value:  'github.com/HKSINGHTHAKUR',
    detail: [
      'Repository count',
      'System architectures',
      'Source code',
      'Project history',
    ],
    action: 'Open GitHub Archive',
    kind:   'external',
    href:   CONTACT.github,
    angle:  180,
  },
  {
    id:     'resume',
    index:  '04',
    label:  'Resume Dossier',
    title:  'Candidate Dossier',
    glyph:  '⬡',
    value:  'HK · Dossier',
    detail: [
      'Projects',
      'Skills',
      'Experience',
      'Technical profile',
    ],
    action: 'Download Dossier',
    kind:   'download',
    href:   '', // no PDF yet → node shows "DOSSIER AVAILABLE SOON"
    angle:  270,
  },
]

// ─── Live transmission status ─────────────────────────────────────────────────
export const TRANSMISSION_STATUS: StatusLine[] = [
  { label: 'Status',            value: 'ONLINE',                 live: true },
  { label: 'Location',          value: 'INDIA'                              },
  { label: 'Primary Stack',     value: 'MERN'                               },
  { label: 'Current Mission',   value: 'STROCTER',               live: true },
  { label: 'Secondary Mission', value: 'TWIN X',                 live: true },
  { label: 'Availability',      value: 'OPEN TO OPPORTUNITIES',  live: true },
  { label: 'Network Status',    value: 'STABLE'                             },
  { label: 'Signal Quality',    value: '98%'                                },
]

// ─── Communication metrics (counters) ──────────────────────────────────────────
export const METRICS: MetricCounter[] = [
  { label: 'GitHub Repositories',    value: 15, suffix: '+' },
  { label: 'Active Systems',         value: 2              },
  { label: 'Technologies Connected', value: 17             },
  { label: 'Projects Shipped',       value: 4              },
]

/** Single status metric shown alongside the counters. */
export const MISSION_STATUS_METRIC = 'OPERATIONAL'

// ─── Availability board ─────────────────────────────────────────────────────────
export const AVAILABLE_FOR: string[] = [
  'Full-Time Roles',
  'Software Engineering Internships',
  'Freelance Projects',
  'Product Collaborations',
  'Startup Opportunities',
]

// ─── Bottom terminal messages (loop forever) ────────────────────────────────────
export const TERMINAL_MESSAGES: string[] = [
  'Awaiting incoming transmission...',
  'Secure channel established...',
  'Signal integrity verified...',
  'Engineering archive synchronized...',
  'Architect online...',
  'HK Galaxy responding...',
  'Connection stable...',
]
