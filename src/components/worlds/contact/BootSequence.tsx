'use client'

import { useEffect, useRef, useState } from 'react'

interface BootSequenceProps {
  accent:      string
  onComplete:  () => void
}

/** The communication startup steps shown on entry. */
const STEPS = [
  'Booting communication relay...',
  'Scanning interstellar frequencies...',
  'Establishing secure channel...',
  'Verifying signal integrity...',
  'Transmission network online',
] as const

const STEP_MS = 460

/**
 * BootSequence — a cinematic communication startup overlay shown when the hub
 * is entered. Reveals the five steps in sequence (~2.3s total), each with a
 * status tick, then calls `onComplete` so the core/nodes/panels boot in.
 *
 * Pure CSS transitions; honors reduced-motion by completing fast.
 */
export default function BootSequence({ accent, onComplete }: BootSequenceProps) {
  const [step, setStep] = useState(0)
  const done = useRef(false)

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      setStep(STEPS.length)
      const t = setTimeout(() => { if (!done.current) { done.current = true; onComplete() } }, 400)
      return () => clearTimeout(t)
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), STEP_MS * (i + 1)))
    })
    timers.push(
      setTimeout(() => {
        if (!done.current) { done.current = true; onComplete() }
      }, STEP_MS * (STEPS.length + 1) + 250),
    )
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className="cx-boot" role="status" aria-live="polite">
      <div className="cx-boot-inner" style={{ borderColor: `${accent}40`, boxShadow: `0 0 60px ${accent}22` }}>
        <div className="cx-boot-title font-mono" style={{ color: accent }}>
          <span className="cx-boot-spinner" style={{ borderTopColor: accent }} />
          HK · Relay Initialisation
        </div>
        <ul className="cx-boot-steps">
          {STEPS.map((s, i) => {
            const state = i < step ? 'done' : i === step ? 'active' : 'idle'
            const isFinal = i === STEPS.length - 1
            return (
              <li
                key={s}
                className="cx-boot-step font-mono"
                style={{
                  opacity: state === 'idle' ? 0.25 : 1,
                  color: state === 'done'
                    ? (isFinal ? '#6ee7b7' : `${accent}dd`)
                    : state === 'active' ? '#fff' : '#64748b',
                }}
              >
                <span className="cx-boot-tick" style={{ color: isFinal && state === 'done' ? '#6ee7b7' : accent }}>
                  {i < step ? (isFinal ? '◉' : '✓') : i === step ? '▸' : '·'}
                </span>
                {s}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
