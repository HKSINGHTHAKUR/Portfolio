'use client'

import { useEffect } from 'react'
import {
  useAppStore,
  selectIntroStage,
  selectIntroProgress,
  selectHasEnteredUniverse,
  selectIsSceneReady,
} from '@/store/useAppStore'
import { IntroStage } from '@/types'
import type { IntroStageValue } from '@/types'

// ─── Stage durations (ms) ─────────────────────────────────────────────────────
const DURATIONS: Record<number, number> = {
  [IntroStage.VOID]:           1800,
  [IntroStage.GALAXY_REVEAL]:  3400,
  [IntroStage.APPROACH]:       2600,
  [IntroStage.DIVE]:           2200,
  [IntroStage.WARP]:           1600,
  [IntroStage.ARRIVAL]:        1600,
}

// ─── Per-stage caption ────────────────────────────────────────────────────────
const CAPTIONS: Record<number, string | null> = {
  [IntroStage.VOID]:           "Entering HK's Galaxy",
  [IntroStage.GALAXY_REVEAL]:  'Approaching HK System',
  [IntroStage.APPROACH]:       null,
  [IntroStage.DIVE]:           null,
  [IntroStage.WARP]:           null,
  [IntroStage.ARRIVAL]:        null,
  [IntroStage.ACTIVE]:         null,
}

/**
 * IntroSequence — orchestrates the cinematic entry.
 *
 * Architecture:
 *   • One long-lived RAF loop, started once when the canvas is ready.
 *   • Loop reads the current stage from `useAppStore.getState()` each frame
 *     instead of through React state — eliminates closure-staleness and
 *     React 19 / StrictMode re-mount races that previously stalled the
 *     state machine.
 *   • A `stageStartRef` tracks when the current stage began; when the stage
 *     changes (via setStage / replayIntro / skipIntro), the loop detects the
 *     mismatch and resets the timer.
 *
 * UI:
 *   • Per-stage caption ("Entering HK's Galaxy" → "Approaching HK System")
 *   • Bottom progress bar across all 6 stages
 *   • [esc] skip affordance
 */
export default function IntroSequence() {
  // Subscribe to render-only state — these drive the JSX, not the loop.
  const stage    = useAppStore(selectIntroStage)
  const progress = useAppStore(selectIntroProgress)

  // Stable refs to actions
  const setStage      = useAppStore((s) => s.setIntroStage)
  const setProgress   = useAppStore((s) => s.setIntroProgress)
  const completeIntro = useAppStore((s) => s.completeIntro)
  const skipIntro     = useAppStore((s) => s.skipIntro)

  // Subscribe to gating flags (these change rarely)
  const hasEntered    = useAppStore(selectHasEnteredUniverse)
  const isSceneReady  = useAppStore(selectIsSceneReady)

  // ── Persistent state-machine driver ────────────────────────────────────────
  // ONE useEffect that owns ONE RAF loop for the lifetime of the intro.
  // Restarts only when we transition between "should run" and "should not run".
  useEffect(() => {
    // Don't run if the canvas isn't live or the user has already entered.
    if (!isSceneReady) return
    if (hasEntered)     return

    let raf = 0
    let cancelled = false
    let trackedStage: IntroStageValue = useAppStore.getState().introStage
    let stageStart  = performance.now()

    const tick = (now: number) => {
      if (cancelled) return

      const state = useAppStore.getState()
      const current = state.introStage

      // Stop the loop entirely once the intro is complete.
      if (current >= IntroStage.ACTIVE) return

      // Stage changed externally (replay / skip / advance) → reset timer.
      if (current !== trackedStage) {
        trackedStage = current
        stageStart   = now
      }

      const duration = DURATIONS[current] ?? 1000
      const elapsed  = now - stageStart
      const p        = Math.min(elapsed / duration, 1)

      // Only push to store if it actually moved — avoids redundant re-renders.
      if (Math.abs(p - state.introProgress) > 0.0005 || p === 1) {
        setProgress(p)
      }

      if (p >= 1) {
        if (current === IntroStage.ARRIVAL) {
          completeIntro()
          return  // intro fully done — don't schedule next frame
        }
        const next = (current + 1) as IntroStageValue
        setStage(next)
        // The next frame will detect the stage change and reset stageStart.
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [isSceneReady, hasEntered, setProgress, setStage, completeIntro])

  // ── Skip handler ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skipIntro()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [skipIntro])

  // Already entered, or sequence finished → no overlay
  if (stage >= IntroStage.ACTIVE) return null

  const caption = CAPTIONS[stage] ?? null

  // Master overlay opacity: dark vignette eases out across DIVE → ARRIVAL.
  let overlayOpacity = 1
  if (stage === IntroStage.DIVE)    overlayOpacity = 1 - progress * 0.35
  if (stage === IntroStage.WARP)    overlayOpacity = 0.65 - progress * 0.35
  if (stage === IntroStage.ARRIVAL) overlayOpacity = Math.max(0, 0.30 - progress * 0.30)

  // Total progress across all 6 cinematic stages (VOID → ARRIVAL)
  const totalProgress = ((stage - IntroStage.VOID) + progress) / 6

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-40 pointer-events-none flex flex-col items-center justify-center text-center"
      style={{ opacity: overlayOpacity, transition: 'opacity 600ms ease-out' }}
    >
      {/* Vignette — gives typography a readable backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(3,7,18,0) 35%, rgba(3,7,18,0.7) 95%)',
        }}
      />

      {/* Caption */}
      {caption && (
        <div className="relative z-10 flex flex-col items-center gap-5 px-6">
          <span className="font-mono text-[10px] tracking-[0.45em] uppercase text-accent/70">
            HK · System
          </span>
          <span
            key={stage}
            className="font-sans text-xl md:text-2xl font-light text-white/95 intro-caption"
            style={{ letterSpacing: '0.08em' }}
          >
            {caption}
          </span>
        </div>
      )}

      {/* Bottom — progress + skip */}
      <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-3 z-10">
        <div className="h-px w-40 bg-white/10 overflow-hidden">
          <div
            className="h-full bg-accent/60"
            style={{
              width: `${totalProgress * 100}%`,
              transition: 'width 80ms linear',
            }}
          />
        </div>
        <button
          type="button"
          onClick={skipIntro}
          className="pointer-events-auto font-mono text-[9px] tracking-[0.4em] uppercase text-muted/70 hover:text-white/80 transition-colors"
          aria-label="Skip intro"
        >
          [esc] skip
        </button>
      </div>
    </div>
  )
}
