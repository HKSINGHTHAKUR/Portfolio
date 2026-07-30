'use client'

import {
  useAppStore,
  selectActivePlanet,
  selectIsTraveling,
} from '@/store/useAppStore'
import { PLANETS, WORLDS_AVAILABLE, type PlanetId } from '@/lib/planets'

// ─── Per-destination content ──────────────────────────────────────────────────
//
// Each destination is a tiny, focused panel — restrained typography, no
// wall-of-text. The cinematic universe is the visual hero; UI is the cue.

type PanelContent = {
  preTitle: string
  title:    string
  subtitle: string
  body:     string[]
}

const CONTENT: Record<PlanetId, PanelContent> = {
  home: {
    preTitle: 'HK · System Online',
    title:    'Enter the System.',
    subtitle: 'A developer who builds systems that scale.',
    body: [
      'Travel between destinations to see the work.',
      'Each planet is a chapter — projects, technical depth, the journey, contact.',
    ],
  },
  projects: {
    preTitle: 'Destination · Projects',
    title:    'Shipped Work.',
    subtitle: 'Mini system-design briefs — problem, architecture, stack, metric.',
    body: [
      'Every project is a real shipped system, not a tutorial clone.',
      'Live links, GitHub history, measurable outcomes.',
    ],
  },
  tech: {
    preTitle: 'Destination · Tech',
    title:    'Engineering Forge.',
    subtitle: 'The engineering reactor that powers every system in HK Galaxy.',
    body: [
      'A living reactor ringed by the real stack behind every project.',
      'Select a technology to trace exactly where it ships.',
    ],
  },
  journey: {
    preTitle: 'Destination · Mission Control',
    title:    'Mission Control.',
    subtitle: 'The strategic command bridge of HK Galaxy.',
    body: [
      'Current focus, active missions, and where this is all heading.',
      'Enter the bridge to see what is being built right now.',
    ],
  },
  contact: {
    preTitle: 'Destination · Transmission Hub',
    title:    'Transmission Hub.',
    subtitle: 'Secure interstellar communication network.',
    body: [
      'The final destination — a deep-space relay to the architect.',
      'Enter the hub to open a direct communication channel.',
    ],
  },
}

/**
 * DestinationPanel — renders the active destination's panel only.
 *
 * Fades out during travel (cleared visual focus), fades back in after the
 * camera stabilises. The active planet's glow tint is reflected in the
 * panel's border and pre-title accent.
 */
export default function DestinationPanels() {
  const activePlanet = useAppStore(selectActivePlanet)
  const isTraveling  = useAppStore(selectIsTraveling)
  const enterWorld   = useAppStore((s) => s.enterWorld)

  const content = CONTENT[activePlanet]
  const planet  = PLANETS[activePlanet]

  // Whether this destination has a fully-built immersive world to enter.
  const worldAvailable = WORLDS_AVAILABLE[activePlanet] && !isTraveling

  // During travel, the UI fades to a near-zero so the cinematic motion owns
  // the screen. As travel completes, it fades back with a staggered reveal.
  const opacity = isTraveling ? 0 : 1

  return (
    <section
      id={activePlanet}
      aria-label={planet.label}
      className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none"
    >
      <div
        className="px-6 max-w-2xl text-center"
        style={{
          opacity,
          transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Reset animations when planet changes by keying on activePlanet */}
        <div key={activePlanet}>
          {/* Scan-line */}
          <div
            aria-hidden="true"
            className="mx-auto mb-7 h-px w-20 hero-reveal-1"
            style={{
              background: `linear-gradient(to right, transparent, ${planet.glow}99, transparent)`,
            }}
          />

          {/* Pre-title */}
          <span
            className="block font-mono text-[10px] tracking-[0.45em] uppercase mb-5 hero-reveal-2"
            style={{ color: planet.glow }}
          >
            {content.preTitle}
          </span>

          {/* Title */}
          <h1
            className="font-sans font-bold text-white tracking-tight leading-[0.95] hero-reveal-3"
            style={{
              fontSize: 'clamp(2.4rem, 6.5vw, 5rem)',
              textShadow: `0 0 36px ${planet.glow}55`,
            }}
          >
            {content.title}
          </h1>

          {/* Subtitle */}
          <p className="mt-7 font-mono text-[13px] text-muted leading-relaxed hero-reveal-4">
            {content.subtitle}
          </p>

          {/* Body */}
          <div className="mt-4 font-mono text-[12px] text-muted/80 leading-relaxed hero-reveal-5 space-y-1">
            {content.body.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {/* Enter World CTA — only for destinations with a built world */}
          {worldAvailable && (
            <button
              type="button"
              onClick={() => enterWorld(activePlanet)}
              className="hero-reveal-5 pointer-events-auto mt-10 group inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] uppercase text-white transition-all duration-300 px-6 py-3 rounded-md"
              style={{
                border: `1px solid ${planet.glow}55`,
                backgroundColor: `${planet.glow}12`,
                boxShadow: `0 0 30px ${planet.glow}1f`,
              }}
              aria-label={
                activePlanet === 'home'
                  ? 'Enter HK Core World'
                  : `Enter ${planet.label} World`
              }
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: planet.glow, boxShadow: `0 0 8px ${planet.glow}` }}
                aria-hidden="true"
              />
              {activePlanet === 'home' ? 'Enter the Core' : `Enter ${planet.label} World`}
              <span
                className="transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: planet.glow }}
              >
                →
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
