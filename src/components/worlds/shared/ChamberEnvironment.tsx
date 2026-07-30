'use client'

import {
  useAppStore,
  selectWorldState,
  selectWorldProgress,
} from '@/store/useAppStore'

/**
 * ChamberEnvironment — the shared, accent-driven command-chamber backdrop for
 * every immersive world (Projects, HK Core, and future worlds).
 *
 * This is the proven Projects-World environment generalised into one reusable
 * surface. It is **fully opaque** once you are `inside`, completely occluding
 * the persistent procedural WebGL universe behind it — which is what keeps the
 * scene shimmer-free. The dive transition ramps it in via `worldProgress`,
 * then it parks at full opacity.
 *
 * MOTION PHILOSOPHY: alive through light, not movement. Every large surface
 * (backdrop, grid, beams, vignette) is perfectly static. The only motion is
 * GPU-composited transform/opacity on tiny elements — a slow scan-line sweep,
 * a faint ambient glow pulse, and sparse drifting motes.
 *
 * Pure CSS, GPU-composited. No shaders, no canvas, no per-frame texture work.
 */

export interface ChamberTone {
  /** Deep backdrop gradient stops (top → mid → bottom). */
  backdrop: [string, string, string]
  /** Horizon glow gradient (rgba string with its own alpha). */
  horizon:  string
  /** Grid line colour (rgba string). */
  grid:     string
  /** Ceiling grid line colour (rgba string, usually fainter). */
  gridCeil: string
  /** Light-beam tint (rgba string). */
  beam:     string
  /** Mote colour + glow. */
  mote:     string
  moteGlow: string
  /** Scan-line gradient mid colour + glow. */
  scan:     string
  scanGlow: string
}

/** Cyan engineering tone — Projects World. */
export const TONE_CYAN: ChamberTone = {
  backdrop: ['#02040a', '#04070f', '#061018'],
  horizon:  'rgba(14,165,233,0.20)',
  grid:     'rgba(125,211,252,0.20)',
  gridCeil: 'rgba(125,211,252,0.12)',
  beam:     'rgba(125,211,252,0.05)',
  mote:     'rgba(186,230,253,0.9)',
  moteGlow: 'rgba(125,211,252,0.7)',
  scan:     'rgba(125,211,252,0.35)',
  scanGlow: 'rgba(56,189,248,0.4)',
}

/** Indigo command tone — HK Core World. */
export const TONE_INDIGO: ChamberTone = {
  backdrop: ['#03040c', '#060816', '#0a0c1f'],
  horizon:  'rgba(99,102,241,0.22)',
  grid:     'rgba(165,180,252,0.18)',
  gridCeil: 'rgba(165,180,252,0.10)',
  beam:     'rgba(129,140,248,0.05)',
  mote:     'rgba(199,210,254,0.9)',
  moteGlow: 'rgba(129,140,248,0.7)',
  scan:     'rgba(165,180,252,0.32)',
  scanGlow: 'rgba(99,102,241,0.4)',
}

/** Violet neural tone — Tech World (Engineering Forge). */
export const TONE_VIOLET: ChamberTone = {
  backdrop: ['#04030c', '#080616', '#0d0a20'],
  horizon:  'rgba(139,92,246,0.22)',
  grid:     'rgba(196,181,253,0.16)',
  gridCeil: 'rgba(196,181,253,0.09)',
  beam:     'rgba(167,139,250,0.05)',
  mote:     'rgba(221,214,254,0.9)',
  moteGlow: 'rgba(167,139,250,0.7)',
  scan:     'rgba(196,181,253,0.32)',
  scanGlow: 'rgba(139,92,246,0.4)',
}

/** Command-blue tone — Mission Control (strategic command bridge). */
export const TONE_COMMAND: ChamberTone = {
  backdrop: ['#020512', '#03081c', '#050e28'],
  horizon:  'rgba(37,99,235,0.24)',
  grid:     'rgba(96,165,250,0.18)',
  gridCeil: 'rgba(96,165,250,0.10)',
  beam:     'rgba(59,130,246,0.06)',
  mote:     'rgba(191,219,254,0.9)',
  moteGlow: 'rgba(96,165,250,0.7)',
  scan:     'rgba(96,165,250,0.34)',
  scanGlow: 'rgba(37,99,235,0.45)',
}

/** Cyan relay tone — Transmission Hub (communication terminal). Cleaner +
 *  brighter than the other worlds: more cyan/white, almost no purple. */
export const TONE_RELAY: ChamberTone = {
  backdrop: ['#02080f', '#031018', '#04161f'],
  horizon:  'rgba(6,182,212,0.26)',
  grid:     'rgba(103,232,249,0.20)',
  gridCeil: 'rgba(103,232,249,0.12)',
  beam:     'rgba(34,211,238,0.06)',
  mote:     'rgba(224,252,255,0.95)',
  moteGlow: 'rgba(103,232,249,0.8)',
  scan:     'rgba(103,232,249,0.4)',
  scanGlow: 'rgba(6,182,212,0.5)',
}

/** Deterministic, hand-placed motes so SSR and client markup always match. */
const MOTES = [
  { left: '14%', top: '32%', size: 2,   dur: 17, delay: 0,   opacity: 0.5 },
  { left: '28%', top: '64%', size: 1.5, dur: 21, delay: 3,   opacity: 0.4 },
  { left: '41%', top: '22%', size: 2,   dur: 19, delay: 6,   opacity: 0.55 },
  { left: '55%', top: '52%', size: 1.5, dur: 23, delay: 1.5, opacity: 0.35 },
  { left: '63%', top: '30%', size: 2.5, dur: 18, delay: 4.5, opacity: 0.5 },
  { left: '72%', top: '68%', size: 1.5, dur: 22, delay: 7.5, opacity: 0.4 },
  { left: '83%', top: '40%', size: 2,   dur: 20, delay: 2,   opacity: 0.5 },
  { left: '36%', top: '46%', size: 1.5, dur: 24, delay: 9,   opacity: 0.3 },
  { left: '90%', top: '58%', size: 2,   dur: 19, delay: 5,   opacity: 0.45 },
  { left: '8%',  top: '54%', size: 1.5, dur: 25, delay: 8,   opacity: 0.35 },
] as const

interface ChamberEnvironmentProps {
  tone: ChamberTone
}

export default function ChamberEnvironment({ tone }: ChamberEnvironmentProps) {
  const worldState = useAppStore(selectWorldState)
  const progress   = useAppStore(selectWorldProgress)

  // Master opacity drives a smooth cinematic landing: the chamber materialises
  // over the dive and reaches FULL opacity slightly before we arrive, so the
  // WebGL universe is fully sealed off the moment we're `inside`.
  const opacity =
    worldState === 'inside' ? 1 : Math.min(1, progress * 1.3)

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ opacity }}
    >
      {/* 1. Deep dark backdrop — OPAQUE base that seals off the universe */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${tone.backdrop[0]} 0%, ${tone.backdrop[1]} 46%, ${tone.backdrop[2]} 100%)`,
        }}
      />

      {/* 2. Subtle horizon glow — faint ambient light variation */}
      <div
        className="absolute left-1/2 bottom-[20%] -translate-x-1/2 chamber-glow"
        style={{
          width:  '130vw',
          height: '46vh',
          background: `radial-gradient(ellipse at center, ${tone.horizon} 0%, transparent 72%)`,
          filter: 'blur(28px)',
        }}
      />

      {/* 3. Architectural light beams — soft volumetric shafts (static) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            `linear-gradient(102deg, transparent 12%, ${tone.beam} 20%, transparent 27%),` +
            `linear-gradient(78deg, transparent 70%, ${tone.beam} 79%, transparent 86%),` +
            `linear-gradient(94deg, transparent 44%, ${tone.beam} 50%, transparent 56%)`,
          filter: 'blur(6px)',
        }}
      />

      {/* 4. Holographic grid FLOOR — large, static command-deck plane */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width:  '240vw',
          height: '60vh',
          transform: 'translateX(-50%) perspective(440px) rotateX(70deg)',
          transformOrigin: 'center bottom',
          backgroundImage:
            `linear-gradient(${tone.grid} 1px, transparent 1px),` +
            `linear-gradient(90deg, ${tone.grid} 1px, transparent 1px)`,
          backgroundSize: '54px 54px',
          maskImage: 'radial-gradient(ellipse at center top, black 8%, transparent 66%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center top, black 8%, transparent 66%)',
          opacity: 0.7,
        }}
      />

      {/* 5. Ceiling grid — mirrored, fainter, gives volume overhead */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width:  '240vw',
          height: '42vh',
          transform: 'translateX(-50%) perspective(440px) rotateX(-70deg)',
          transformOrigin: 'center top',
          backgroundImage:
            `linear-gradient(${tone.gridCeil} 1px, transparent 1px),` +
            `linear-gradient(90deg, ${tone.gridCeil} 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse at center bottom, black 4%, transparent 56%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center bottom, black 4%, transparent 56%)',
          opacity: 0.4,
        }}
      />

      {/* 6. Sparse floating motes — tiny, slow, transform-only drift */}
      <div className="absolute inset-0">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="chamber-particle absolute rounded-full"
            style={{
              left:   m.left,
              top:    m.top,
              width:  m.size,
              height: m.size,
              background: tone.mote,
              boxShadow: `0 0 6px ${tone.moteGlow}`,
              opacity: m.opacity,
              animationDuration: `${m.dur}s`,
              animationDelay: `${m.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 7. Scan-line sweep — a single thin glow travelling slowly down */}
      <div
        className="chamber-scan absolute left-0 right-0"
        style={{
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${tone.scan} 50%, transparent 100%)`,
          boxShadow: `0 0 18px ${tone.scanGlow}`,
        }}
      />

      {/* 8. Atmospheric vignette — frames the centre, dims the edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 46%, transparent 30%, rgba(1,3,8,0.55) 78%, rgba(1,3,8,0.85) 100%)',
        }}
      />
    </div>
  )
}
