// ─── Mission Control data model ───────────────────────────────────────────────
//
// Content for the Mission Control world — the strategic command bridge of HK
// Galaxy. Answers "what am I building now, what matters, where is this going".
// Real, current content only; no placeholder missions.

export type MissionPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export type ObjectiveStatus =
  | 'IN PROGRESS'
  | 'PLANNED'
  | 'FUTURE'
  | 'LONG TERM'

/** A headline mission shown in a dominant command panel. */
export interface Mission {
  id:          string
  tier:        'PRIMARY' | 'SECONDARY'
  codename:    string
  description: string
  state:       string
  priority:    MissionPriority
  /** Ordered phase path shown as a connected mission map. */
  path:        string[]
  /** Objective ids this mission drives — used for hover highlighting. */
  objectives:  string[]
  /** Accent (hex) for this mission's command-bridge tint. */
  accent:      string
}

/** A floating mission-objective card orbiting the command table. */
export interface MissionObjective {
  id:       string
  index:    string
  title:    string
  status:   ObjectiveStatus
  /** Short brief revealed on hover. */
  brief:    string
  /** Full brief: the objective being solved. */
  objective:     string
  /** Full brief: the next milestone. */
  nextMilestone: string
  /** Full brief: why it matters. */
  impact:        string
  /** Position over the bridge canvas, percentages (x, y). */
  position: { x: number; y: number }
}

export interface StatusLine {
  label: string
  value: string
  /** Render the value as a live/positive indicator. */
  live?: boolean
}

export interface CommandLogEntry {
  stamp: string
  text:  string
}

// ─── Headline missions ────────────────────────────────────────────────────────
export const MISSIONS: Mission[] = [
  {
    id:          'strocter',
    tier:        'PRIMARY',
    codename:    'Strocter',
    description:
      'Behavioral finance platform focused on understanding the psychology ' +
      'behind spending patterns and financial decision making.',
    state:       'ACTIVE DEVELOPMENT',
    priority:    'HIGH',
    path:        ['Strocter', 'Behavior Engine', 'AI Insights', 'Platform Expansion'],
    objectives:  ['m01', 'm02', 'm03'],
    accent:      '#22d3ee', // cyan — primary mission
  },
  {
    id:          'twinx',
    tier:        'SECONDARY',
    codename:    'Twin X',
    description:
      'Emerging engineering initiative currently under development.',
    state:       'ACTIVE',
    priority:    'MEDIUM',
    path:        ['Twin X', 'Research', 'Development', 'Deployment'],
    objectives:  ['m04'],
    accent:      '#60a5fa', // blue — secondary mission
  },
]

/** The active target shown inside the Strategic Command Core. */
export const ACTIVE_TARGET = 'Strocter'

// ─── Mission objectives (floating cards around the table) ──────────────────────
export const OBJECTIVES: MissionObjective[] = [
  {
    id:       'm01',
    index:    '01',
    title:    'Behavior Analysis Engine',
    status:   'IN PROGRESS',
    brief:
      'The core analytical layer that turns raw transactions into behavioral ' +
      'signals — clustering patterns and surfacing psychological triggers.',
    objective:
      'Build the intelligence layer responsible for understanding behavioural ' +
      'spending patterns and the psychological triggers behind them.',
    nextMilestone: 'Advanced behavioural tagging system.',
    impact:        "Core foundation of Strocter's intelligence engine.",
    position: { x: 16, y: 22 },
  },
  {
    id:       'm02',
    index:    '02',
    title:    'AI Powered Financial Insights',
    status:   'PLANNED',
    brief:
      'A layer of AI-assisted, explainable guidance built on top of the ' +
      'behavior engine to help users reshape financial habits.',
    objective:
      'Layer AI-assisted, explainable insight over the behavior engine so the ' +
      'platform can guide users — not just report numbers back to them.',
    nextMilestone: 'Insight generation pipeline + prompt architecture.',
    impact:        'Turns raw analysis into guidance users can act on.',
    position: { x: 84, y: 22 },
  },
  {
    id:       'm03',
    index:    '03',
    title:    'Cross Platform Expansion',
    status:   'FUTURE',
    brief:
      'Extending the system beyond the web into mobile and companion ' +
      'surfaces so the intelligence travels with the user.',
    objective:
      'Carry the same behavioral intelligence across web, mobile, and ' +
      'companion surfaces with a shared data and design foundation.',
    nextMilestone: 'Shared API contract + mobile client foundation.',
    impact:        'Makes Strocter present wherever financial decisions happen.',
    position: { x: 16, y: 78 },
  },
  {
    id:       'm04',
    index:    '04',
    title:    'Enterprise Scale Architecture',
    status:   'LONG TERM',
    brief:
      'Hardening the foundation for scale — multi-tenant architecture, ' +
      'observability, and production-grade operational maturity.',
    objective:
      'Evolve the platform into a multi-tenant, observable, production-grade ' +
      'system ready for serious scale and reliability guarantees.',
    nextMilestone: 'Multi-tenant data model + observability baseline.',
    impact:        'The runway that lets every other mission scale safely.',
    position: { x: 84, y: 78 },
  },
]

// ─── Active focus ──────────────────────────────────────────────────────────────
export const ACTIVE_FOCUS: string[] = [
  'Full Stack Development',
  'System Design',
  'Product Architecture',
  'Behavioral Finance',
  'AI Assisted Development',
  'Scalable Software Systems',
]

// ─── Engineering philosophy ─────────────────────────────────────────────────────
export const ENGINEERING_PRINCIPLES: string[] = [
  'Build systems, not demos',
  'Understand before scaling',
  'Simplicity beats complexity',
  'Solve real problems',
  'User psychology matters',
  'Technology is a tool, not the goal',
]

// ─── Live status board ───────────────────────────────────────────────────────────
export const STATUS_BOARD: StatusLine[] = [
  { label: 'System Status',   value: 'ONLINE',      live: true },
  { label: 'Active Missions', value: '2'                       },
  { label: 'Primary Stack',   value: 'MERN'                    },
  { label: 'Universe Status', value: 'OPERATIONAL', live: true },
  { label: 'Engineering Mode',value: 'ACTIVE',      live: true },
]

// ─── Captain's Log (terminal archive) ───────────────────────────────────────────
export const COMMAND_LOG: CommandLogEntry[] = [
  { stamp: '2026.01', text: 'Initiated HK Galaxy' },
  { stamp: '2026.02', text: 'Engineering Core online' },
  { stamp: '2026.03', text: 'Projects Planet operational' },
  { stamp: '2026.04', text: 'Engineering Forge activated' },
  { stamp: 'CURRENT', text: 'Strocter active development' },
  { stamp: 'CURRENT', text: 'Twin X active development' },
  { stamp: 'CURRENT', text: 'Mission Control online' },
]

/** Headline counts for the header. */
export const ACTIVE_MISSION_COUNT = MISSIONS.length
