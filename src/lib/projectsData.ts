// ─── Project data model ───────────────────────────────────────────────────────
//
// Real shipped systems for the Projects World — Harsh Kumar Singh's engineering
// archive. Each project is a living node in the spatial network: identity →
// overview → architecture → stack → metric. STROCTER is the flagship and the
// gravitational centre of the chamber.

export interface ProjectMetric {
  label: string
  value: string
}

export type ProjectStatus = 'ACTIVE DEVELOPMENT' | 'COMPLETED'

/** Visual weight of a node within the network. */
export type ProjectPriority = 'highest' | 'medium' | 'lower'

// ─── Archive model ────────────────────────────────────────────────────────────
// Every project opens a full-screen Intelligence Archive built on ONE shared
// framework. Gallery-mode archives (Strocter, CodeMate, Aiva) present a real
// screenshot gallery on the left; documentation-mode archives (BizFlow, which
// has no screenshots) present engineering documentation visuals instead. The
// right-hand readout is shared. Each project keeps its own personality via
// accent colour, archive type, and content.

/** One screenshot in the gallery. */
export interface GalleryShot {
  /** Public path (literal spaces; next/image encodes them). */
  src:    string
  /** Intrinsic pixel size — locks aspect ratio, prevents layout shift. */
  width:  number
  height: number
  /** Human title shown on the thumbnail, e.g. "Control Center". */
  title:  string
  /** System role label, e.g. "BEHAVIORAL ANALYTICS HUB". */
  label:  string
}

/** A tier in the vertical engineering pipeline diagram. */
export interface ArchTier {
  id:   string
  /** Tier name, e.g. "Frontend". */
  tier: string
  /** Technology for the tier, e.g. "React + Vite". */
  tech: string
}

/** A labelled group of technologies in the tech-stack section. */
export interface TechGroup {
  label: string
  items: string[]
}

export interface ProjectArchive {
  /** Archive personality, e.g. "Product Intelligence Archive". */
  archiveType:  string
  /** Header title, e.g. "Strocter Intelligence Archive". */
  archiveTitle: string

  /** Screenshot gallery — omit for documentation-mode archives (BizFlow). */
  gallery?:     GalleryShot[]
  /** `src` of the screenshot shown first. */
  defaultShot?: string

  /** The problem the system addresses. */
  problem:      string
  /** Optional solution statement (documentation archives). */
  solution?:    string
  /** Vertical engineering pipeline. */
  architecture: ArchTier[]
  /** Core feature/module set, shown as holographic cards. */
  features:     string[]
  /** Override the features section label (e.g. "Core Modules"). */
  featuresLabel?: string
  /** Database entities → holographic relationship cards (documentation mode). */
  entities?:    string[]
  /** Grouped tech stack. */
  techStack:    TechGroup[]
  /** Engineering highlights, shown as archive entries. */
  highlights:   string[]
}

export interface Project {
  id:        string
  index:     string                 // display index, e.g. "01"
  title:     string
  /** Short classifier shown on the node (e.g. "Money Psychology Tracker"). */
  category:  string
  /** One-line preview shown on hover — kept short by design. */
  tagline:   string
  /** Optional role tag — only the flagship carries one. */
  role?:     string
  status:    ProjectStatus

  /** PROJECT OVERVIEW — the problem being solved. */
  description: string
  /** SYSTEM ARCHITECTURE — key engineering decisions, in prose. */
  architectureSummary: string
  /** ENGINEERING HIGHLIGHTS — architecture / engineering features. */
  highlights: string[]
  /** TECH STACK — technology badges. */
  stack:     string[]
  /** METRICS — real, measurable outcomes (empty if none published yet). */
  metrics:   ProjectMetric[]

  links: {
    github: string
    live?:  string
  }

  /** Accent colour for this node's holographic tint (hex), cyan-blue family. */
  accent:    string
  /** True for the single flagship system — drives size, glow, centre slot. */
  flagship:  boolean
  priority:  ProjectPriority
  /** Position within the network canvas, as percentages (x, y). */
  position:  { x: number; y: number }
  /** Full engineering archive — every project has one. */
  archive:   ProjectArchive
}

export const PROJECTS: Project[] = [
  // ── 01 · STROCTER — flagship, gravitational centre ──────────────────────────
  {
    id:        'strocter',
    index:     '01',
    title:     'Strocter',
    category:  'Money Psychology Tracker',
    tagline:   'Behavioural finance platform decoding the psychology behind spending.',
    role:      'Flagship Project',
    status:    'ACTIVE DEVELOPMENT',
    description:
      'A behavioral finance platform that analyzes emotional spending patterns ' +
      'and surfaces psychological insight into financial habits — turning raw ' +
      'transactions into a mirror of how people actually think about money.',
    architectureSummary:
      'A secure MERN system: JWT authentication with role-based access control ' +
      'over a 12+ endpoint REST ecosystem, MongoDB Atlas persistence, and a ' +
      'real-time analytics dashboard composing behavioral signals on the fly.',
    highlights: [
      'MERN architecture with a hardened backend boundary',
      'JWT authentication + role-based access control',
      'REST API ecosystem (12+ endpoints)',
      'MongoDB Atlas integration',
      'Real-time analytics dashboard',
    ],
    stack:     ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT', 'REST APIs'],
    metrics: [
      { label: 'REST APIs',       value: '12+'  },
      { label: 'Dashboard Perf',  value: '+40%' },
      { label: 'Test Coverage',   value: '85%'  },
    ],
    links:     { github: 'https://github.com/HKSINGHTHAKUR/Strocter' },
    accent:    '#22d3ee', // cyan-400 — strongest glow
    flagship:  true,
    priority:  'highest',
    position:  { x: 50, y: 50 },
    archive: {
      archiveType:  'Product Intelligence Archive',
      archiveTitle: 'Strocter Intelligence Archive',
      gallery: [
        {
          src:    '/reference/strocter/landing page.png',
          width:  1919, height: 912,
          title:  'Landing Page',
          label:  'SYSTEM ENTRY INTERFACE',
        },
        {
          src:    '/reference/strocter/pricing.png',
          width:  1919, height: 917,
          title:  'Pricing',
          label:  'PRODUCTIZATION LAYER',
        },
        {
          src:    '/reference/strocter/control center.png',
          width:  1919, height: 908,
          title:  'Control Center',
          label:  'BEHAVIORAL ANALYTICS HUB',
        },
        {
          src:    '/reference/strocter/reports.png',
          width:  1919, height: 900,
          title:  'Reports',
          label:  'INTELLIGENCE ARCHIVE',
        },
      ],
      // Landing Page first — the user sees the product entry experience.
      defaultShot: '/reference/strocter/landing page.png',
      problem:
        'People track money. Few understand WHY they spend. Strocter focuses on ' +
        'the behavioural patterns behind financial decisions — not just the numbers.',
      architecture: [
        { id: 'frontend', tier: 'Frontend',       tech: 'React + Vite'      },
        { id: 'backend',  tier: 'Backend',        tech: 'Node.js + Express' },
        { id: 'database', tier: 'Database',        tech: 'MongoDB Atlas'     },
        { id: 'auth',     tier: 'Authentication',  tech: 'JWT'               },
        { id: 'engine',   tier: 'Behavior Engine', tech: 'Behavioural Finance Layer' },
      ],
      features: [
        'Emotion-based expense tracking',
        'Behavioral spending analysis',
        'Transaction management',
        'JWT authentication',
        'Role-based access',
        'Real-time analytics dashboard',
        'MongoDB Atlas integration',
        'Financial psychology insights',
      ],
      techStack: [
        { label: 'Frontend',       items: ['React', 'Vite', 'Tailwind CSS'] },
        { label: 'Backend',        items: ['Node.js', 'Express.js']         },
        { label: 'Database',       items: ['MongoDB Atlas', 'Mongoose']     },
        { label: 'Authentication', items: ['JWT', 'bcrypt']                 },
      ],
      highlights: [
        '12+ REST API endpoints',
        'Secure JWT authentication',
        'Role-based access control',
        'MongoDB Atlas cloud deployment',
        'Analytics-focused architecture',
        'Modular MERN structure',
        'Scalable backend foundation',
      ],
    },
  },

  // ── 02 · BIZFLOW ────────────────────────────────────────────────────────────
  {
    id:        'bizflow',
    index:     '02',
    title:     'Bizflow',
    category:  'Billing Automation Platform',
    tagline:   'Invoicing and workflow automation for day-to-day operations.',
    status:    'COMPLETED',
    description:
      'BizFlow is a business billing and inventory management platform designed ' +
      'to automate inventory tracking, invoice generation, reporting, and ' +
      'customer management.',
    architectureSummary:
      'A React + Node engine that automates invoice generation and reporting on ' +
      'an optimized MySQL core, wired to an email notification pipeline.',
    highlights: [
      'Automated invoice generation',
      'Reporting dashboards',
      'Workflow automation',
      'Database optimization',
      'Email notification system',
    ],
    stack:     ['React.js', 'Node.js', 'MySQL'],
    metrics:   [],
    links:     { github: 'https://github.com/HKSINGHTHAKUR/Bizflow-Project' },
    accent:    '#7dd3fc', // sky-300
    flagship:  false,
    priority:  'medium',
    position:  { x: 17, y: 24 },
    archive: {
      archiveType:  'Engineering Documentation Archive',
      archiveTitle: 'BizFlow Documentation Archive',
      // No gallery — documentation-mode archive renders system visuals instead.
      problem:
        'Businesses frequently depend on spreadsheets and manual record keeping, ' +
        'leading to inventory mismatch, billing errors, reporting delays, and ' +
        'stock-management complexity.',
      solution:
        'A centralized inventory and billing system with automated workflows and ' +
        'a single source of truth across operations.',
      architecture: [
        { id: 'frontend',  tier: 'Frontend',         tech: 'React'        },
        { id: 'backend',   tier: 'Backend',          tech: 'Node + Express' },
        { id: 'database',  tier: 'Database',          tech: 'MySQL'        },
        { id: 'inventory', tier: 'Inventory Engine',  tech: 'Stock Tracking' },
        { id: 'billing',   tier: 'Billing Engine',    tech: 'Invoice Automation' },
        { id: 'reporting', tier: 'Reporting System',  tech: 'Analytics & Exports' },
      ],
      features: [
        'Inventory Management',
        'Billing Engine',
        'Customer Records',
        'Reporting System',
        'Analytics Dashboard',
      ],
      featuresLabel: 'Core Modules',
      entities: [
        'Products',
        'Customers',
        'Invoices',
        'Transactions',
        'Reports',
      ],
      techStack: [
        { label: 'Frontend', items: ['React']             },
        { label: 'Backend',  items: ['Node.js', 'Express.js'] },
        { label: 'Database', items: ['MySQL']             },
      ],
      highlights: [
        'CRUD architecture',
        'REST APIs',
        'Inventory tracking',
        'Invoice automation',
        'Reporting engine',
        'Modular design',
      ],
    },
  },

  // ── 03 · CODEMATE ────────────────────────────────────────────────────────────
  {
    id:        'codemate',
    index:     '03',
    title:     'CodeMate',
    category:  'Android Learning Platform',
    tagline:   'Native Android learning platform with a scalable content backend.',
    status:    'COMPLETED',
    description:
      'CodeMate is an Android learning platform designed to help users learn ' +
      'programming concepts through structured content and practical examples.',
    architectureSummary:
      'An Android-first build with Firebase-backed content delivery, a ' +
      'Node/Express management layer, and automated upload pipelines.',
    highlights: [
      'Firebase integration',
      'Content management APIs',
      'Automated upload pipelines',
      'RecyclerView optimization',
      'Android-first architecture',
    ],
    stack:     ['Kotlin', 'Firebase', 'Node.js', 'Express.js'],
    metrics:   [],
    links:     { github: 'https://github.com/HKSINGHTHAKUR/CodeMate-App' },
    accent:    '#a78bfa', // violet-400 — mobile learning terminal
    flagship:  false,
    priority:  'medium',
    position:  { x: 83, y: 24 },
    archive: {
      archiveType:  'Mobile Product Archive',
      archiveTitle: 'CodeMate Mobile Archive',
      gallery: [
        {
          src:    '/reference/codemate/Screenshot 2026-05-31 202034.png',
          width:  1919, height: 834,
          title:  'Learning Home',
          label:  'MOBILE LEARNING TERMINAL',
        },
        {
          src:    '/reference/codemate/Screenshot 2026-05-31 202045.png',
          width:  1919, height: 833,
          title:  'Course Module',
          label:  'STRUCTURED CONTENT',
        },
        {
          src:    '/reference/codemate/Screenshot 2026-05-31 202052.png',
          width:  1919, height: 820,
          title:  'Progress',
          label:  'PROGRESS TRACKING',
        },
      ],
      defaultShot: '/reference/codemate/Screenshot 2026-05-31 202034.png',
      problem:
        'Many learning apps are cluttered and difficult for beginners. CodeMate ' +
        'focuses on simplicity and accessibility.',
      architecture: [
        { id: 'app',      tier: 'Android App',      tech: 'Kotlin + XML'   },
        { id: 'firebase', tier: 'Firebase',         tech: 'Auth + Realtime DB' },
        { id: 'content',  tier: 'Learning Content', tech: 'Structured Modules' },
        { id: 'progress', tier: 'Progress Tracking',tech: 'User State'     },
      ],
      features: [
        'Learning Modules',
        'Programming Tutorials',
        'Progress Tracking',
        'Firebase Integration',
        'Mobile Optimized UI',
      ],
      techStack: [
        { label: 'Mobile',   items: ['Kotlin', 'Android SDK', 'XML'] },
        { label: 'Backend',  items: ['Firebase']                     },
      ],
      highlights: [
        'Firebase integration',
        'Structured learning content',
        'Progress tracking',
        'RecyclerView optimization',
        'Android-first architecture',
        'Beginner-focused UX',
      ],
    },
  },

  // ── 04 · AIVA ────────────────────────────────────────────────────────────────
  {
    id:        'aiva',
    index:     '04',
    title:     'Aiva',
    category:  'AI Landing Experience',
    tagline:   'High-end, animation-driven interactive landing experience.',
    status:    'COMPLETED',
    description:
      'AIVA is a modern AI-focused landing page experience designed to ' +
      'demonstrate clean design systems, visual storytelling, and ' +
      'conversion-focused interfaces.',
    architectureSummary:
      'A TypeScript-typed React build centered on an animation-driven, fully ' +
      'responsive interactive surface.',
    highlights: [
      'Interactive UI',
      'TypeScript architecture',
      'Responsive experience',
      'Animation-driven design',
    ],
    stack:     ['React', 'TypeScript'],
    metrics:   [],
    links:     { github: 'https://github.com/HKSINGHTHAKUR/Aiva-Landing-page' },
    accent:    '#5eead4', // teal-300 — brighter design-showcase tone
    flagship:  false,
    priority:  'lower',
    position:  { x: 50, y: 84 },
    archive: {
      archiveType:  'UI/UX Showcase Archive',
      archiveTitle: 'AIVA Showcase Archive',
      gallery: [
        {
          src:    '/reference/aiva/Screenshot 2026-05-31 201920.png',
          width:  1919, height: 908,
          title:  'Hero',
          label:  'DESIGN SHOWCASE TERMINAL',
        },
        {
          src:    '/reference/aiva/Screenshot 2026-05-31 201930.png',
          width:  1919, height: 909,
          title:  'Product',
          label:  'AI PRODUCT POSITIONING',
        },
        {
          src:    '/reference/aiva/Screenshot 2026-05-31 201951.png',
          width:  1919, height: 905,
          title:  'Features',
          label:  'VISUAL STORYTELLING',
        },
        {
          src:    '/reference/aiva/Screenshot 2026-05-31 201958.png',
          width:  1919, height: 908,
          title:  'Experience',
          label:  'CONVERSION INTERFACE',
        },
        {
          src:    '/reference/aiva/Screenshot 2026-05-31 202007.png',
          width:  1919, height: 905,
          title:  'Closing',
          label:  'CALL TO ACTION',
        },
      ],
      defaultShot: '/reference/aiva/Screenshot 2026-05-31 201920.png',
      problem:
        'Most AI landing pages look generic and overloaded. AIVA focuses on ' +
        'clarity, hierarchy, and premium presentation.',
      architecture: [
        { id: 'react',      tier: 'React',            tech: 'Component Runtime' },
        { id: 'typescript', tier: 'TypeScript',       tech: 'Typed Contracts'   },
        { id: 'components', tier: 'Component System',  tech: 'Design System'     },
        { id: 'responsive', tier: 'Responsive UI',     tech: 'Fluid Layouts'     },
      ],
      features: [
        'Modern Landing Page',
        'Responsive Design',
        'AI Product Positioning',
        'Visual Storytelling',
        'Clean Component Architecture',
      ],
      techStack: [
        { label: 'Frontend', items: ['React', 'TypeScript'] },
        { label: 'Design',   items: ['Design System', 'Responsive UI'] },
      ],
      highlights: [
        'Conversion-focused interface',
        'Clean design system',
        'Typed component architecture',
        'Responsive across breakpoints',
        'Visual hierarchy & storytelling',
        'Premium presentation',
      ],
    },
  },
]

/** The single flagship system — used to anchor the network's connection lines. */
export const FLAGSHIP = PROJECTS.find((p) => p.flagship)!
