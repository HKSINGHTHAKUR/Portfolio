'use client'

import { create } from 'zustand'
import type {
  SectionId,
  CameraState,
  TransitionState,
  TransitionPhase,
  IntroStageValue,
  WorldState,
} from '@/types'
import { IntroStage } from '@/types'
import { computeTravelDuration, type PlanetId } from '@/lib/planets'

const STORAGE_KEY = 'hk.universe.entered.v1'

// ─── Persistence helpers ──────────────────────────────────────────────────────
// Uses sessionStorage so the intro plays on every fresh page load / new tab
// (recruiter always sees the cinematic entry) but doesn't replay on in-page
// navigation within the same session.
function readHasEntered(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function persistHasEntered(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, '1')
  } catch { /* storage may be blocked */ }
}

// ─── State shape ──────────────────────────────────────────────────────────────
interface AppState {
  activeSection: SectionId
  isLoaded: boolean
  isSceneReady: boolean
  camera: CameraState
  transition: TransitionState

  // ── Intro state ──────────────────────────────────────────────────────────
  introStage:    IntroStageValue
  introProgress: number
  hasEnteredUniverse: boolean

  // ── Planetary navigation state ───────────────────────────────────────────
  /** The planet the camera currently considers its anchor (target). */
  activePlanet:    PlanetId
  /** The planet we just left — drives the camera path interpolation. */
  previousPlanet:  PlanetId
  /** True while the camera is animating between two planets. */
  isTraveling:     boolean
  /** 0..1 across the active travel — owned by TravelController. */
  travelProgress:  number
  /** Total seconds for the current travel — set when navigateTo fires. */
  travelDuration:  number

  // ── World immersion state ────────────────────────────────────────────────
  /** Current world-immersion phase. */
  worldState:        WorldState
  /** Which planet's world we are entering / inside. null when in universe. */
  activeWorld:       PlanetId | null
  /** 0..1 entry/exit dive progress — owned by WorldTransitionController. */
  worldProgress:     number
  /**
   * Interplanetary transfer target. When set, the world auto-chains
   * exit → orbit → travel → enter to land inside this planet's world. Cleared
   * once the destination world begins opening. null when not transferring.
   */
  transferTarget:    PlanetId | null

  // ── Actions ──────────────────────────────────────────────────────────────
  setActiveSection:  (id: SectionId) => void
  setLoaded:         (v: boolean) => void
  setSceneReady:     (v: boolean) => void
  setCamera:         (config: Partial<CameraState>) => void
  startTransition:   (to: SectionId) => void
  endTransition:     () => void

  setIntroStage:     (stage: IntroStageValue) => void
  setIntroProgress:  (p: number) => void
  completeIntro:     () => void
  skipIntro:         () => void
  replayIntro:       () => void

  /** Begin a cinematic travel toward a destination planet. */
  navigateTo:        (planet: PlanetId) => void
  /** Update travel progress (0..1) — called from the canvas. */
  setTravelProgress: (p: number) => void
  /** Mark travel complete; activePlanet stays, previousPlanet collapses. */
  completeTravel:    () => void

  // ── World immersion actions ──────────────────────────────────────────────
  /** Begin diving into the active planet's immersive world. */
  enterWorld:        (planet: PlanetId) => void
  /** Update the world entry/exit dive progress (0..1). */
  setWorldProgress:  (p: number) => void
  /** Entry dive finished — the immersive world is now live. */
  completeWorldEntry: () => void
  /** Begin exiting the immersive world, returning to the orbit. */
  exitWorld:         () => void
  /** Exit dive finished — back in the universe. */
  completeWorldExit: () => void
  /**
   * Cinematic interplanetary transfer from inside one world directly to
   * another: locks a target, then auto-chains exit → orbit → travel → enter
   * reusing every existing animation. No-op if already inside that world.
   */
  transferToPlanet:  (planet: PlanetId) => void
}

const DEFAULT_CAMERA: CameraState = {
  position: [0, 0, 20],
  target: [0, 0, 0],
  fov: 60,
}

const DEFAULT_TRANSITION: TransitionState = {
  phase: 'idle' as TransitionPhase,
  fromSection: null,
  toSection: null,
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAppStore = create<AppState>((set, get) => ({
  activeSection: 'hero',
  isLoaded: false,
  isSceneReady: false,
  camera: DEFAULT_CAMERA,
  transition: DEFAULT_TRANSITION,

  introStage:    IntroStage.VOID,
  introProgress: 0,
  hasEnteredUniverse: false,

  activePlanet:   'home',
  previousPlanet: 'home',
  isTraveling:    false,
  travelProgress: 1,
  travelDuration: 0,

  worldState:    'universe',
  activeWorld:   null,
  worldProgress: 0,
  transferTarget: null,

  setActiveSection: (id) => set({ activeSection: id }),
  setLoaded:        (v)  => set({ isLoaded: v }),
  setSceneReady:    (v)  => set({ isSceneReady: v }),

  setCamera: (config) =>
    set((state) => ({ camera: { ...state.camera, ...config } })),

  startTransition: (to) =>
    set((state) => ({
      transition: {
        phase: 'entering',
        fromSection: state.activeSection,
        toSection: to,
      },
    })),

  endTransition: () =>
    set((state) => {
      const to = state.transition.toSection
      return {
        activeSection: to ?? state.activeSection,
        transition: DEFAULT_TRANSITION,
      }
    }),

  setIntroStage:    (stage) => set({ introStage: stage, introProgress: 0 }),
  setIntroProgress: (p)     => set({ introProgress: p }),

  completeIntro: () => {
    persistHasEntered()
    set({
      introStage: IntroStage.ACTIVE,
      introProgress: 1,
      hasEnteredUniverse: true,
    })
  },

  skipIntro: () => {
    persistHasEntered()
    set({
      introStage: IntroStage.ACTIVE,
      introProgress: 1,
      hasEnteredUniverse: true,
    })
  },

  replayIntro: () => {
    if (typeof window !== 'undefined') {
      try { window.sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    }
    set({
      introStage:         IntroStage.VOID,
      introProgress:      0,
      hasEnteredUniverse: false,
      activePlanet:       'home',
      previousPlanet:     'home',
      isTraveling:        false,
      travelProgress:     1,
      travelDuration:     0,
      worldState:         'universe',
      activeWorld:        null,
      worldProgress:      0,
      transferTarget:     null,
    })
  },

  // ── Planetary navigation ─────────────────────────────────────────────────
  navigateTo: (planet) => {
    const { activePlanet, isTraveling } = get()
    // Same destination → no-op
    if (activePlanet === planet && !isTraveling) return

    const duration = computeTravelDuration(activePlanet, planet)
    set({
      previousPlanet: activePlanet,
      activePlanet:   planet,
      isTraveling:    true,
      travelProgress: 0,
      travelDuration: duration,
    })
  },

  setTravelProgress: (p) => set({ travelProgress: p }),

  completeTravel: () => {
    const { activePlanet, transferTarget } = get()
    set((state) => ({
      isTraveling:    false,
      travelProgress: 1,
      previousPlanet: state.activePlanet,
    }))
    // Auto-chain: if this travel was part of an interplanetary transfer and we
    // arrived at the target, dive straight into its world (planet expansion +
    // entry reuse the normal enterWorld path).
    if (transferTarget && transferTarget === activePlanet) {
      // Defer so the universe view is visible for a beat ("orbit reached"),
      // then the planet expansion begins automatically.
      setTimeout(() => {
        const s = get()
        if (s.transferTarget === transferTarget && s.worldState === 'universe' && !s.isTraveling) {
          set({ worldState: 'entering', activeWorld: transferTarget, worldProgress: 0 })
        }
      }, 360)
    }
  },

  // ── World immersion ──────────────────────────────────────────────────────
  enterWorld: (planet) => {
    const { isTraveling, worldState } = get()
    // Guard: can't enter while still flying between planets or mid-transition
    if (isTraveling || worldState !== 'universe') return
    set({
      worldState:    'entering',
      activeWorld:   planet,
      worldProgress: 0,
    })
  },

  setWorldProgress: (p) => set({ worldProgress: p }),

  completeWorldEntry: () =>
    // Arrived inside the world — clear any transfer lock (chain complete).
    set({ worldState: 'inside', worldProgress: 1, transferTarget: null }),

  exitWorld: () => {
    const { worldState } = get()
    if (worldState !== 'inside') return
    // worldProgress is currently 1 (fully inside); the exit dive counts it
    // back down to 0 via WorldTransitionController.
    set({ worldState: 'exiting' })
  },

  completeWorldExit: () => {
    const { transferTarget, activePlanet } = get()
    set({ worldState: 'universe', activeWorld: null, worldProgress: 0 })
    // Auto-chain: if a transfer is in flight, immediately travel to the target
    // planet (the camera travel reuses the normal navigateTo path). A short
    // defer lets the orbit become visible ("orbit reached") first.
    if (transferTarget && transferTarget !== activePlanet) {
      setTimeout(() => {
        const s = get()
        if (s.transferTarget === transferTarget && s.worldState === 'universe') {
          s.navigateTo(transferTarget)
        }
      }, 300)
    } else if (transferTarget && transferTarget === activePlanet) {
      // Edge case: transferring to the same planet we're already orbiting —
      // just dive back in.
      setTimeout(() => {
        const s = get()
        if (s.transferTarget === transferTarget && s.worldState === 'universe' && !s.isTraveling) {
          set({ worldState: 'entering', activeWorld: transferTarget, worldProgress: 0 })
        }
      }, 300)
    }
  },

  transferToPlanet: (planet) => {
    const { worldState, activeWorld } = get()
    // Only meaningful from inside a world; no-op if already there.
    if (worldState !== 'inside') return
    if (activeWorld === planet) return
    // Lock the target and begin the existing exit dive. The completion
    // handlers (completeWorldExit → navigateTo → completeTravel → enter) chain
    // the rest automatically, reusing every existing animation.
    set({ transferTarget: planet, worldState: 'exiting' })
  },
}))

// ─── Hydrate persistence on the client ────────────────────────────────────────
if (typeof window !== 'undefined') {
  // Clean up legacy localStorage entry that used to skip the intro permanently.
  try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }

  const url           = new URL(window.location.href)
  const forceReplay   = url.searchParams.get('intro') === 'replay'
  const entered       = !forceReplay && readHasEntered()

  if (forceReplay) {
    try { window.sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    url.searchParams.delete('intro')
    window.history.replaceState({}, '', url.toString())
  }

  if (entered) {
    useAppStore.setState({
      hasEnteredUniverse: true,
      introStage: IntroStage.ACTIVE,
      introProgress: 1,
    })
  }
}

// ─── Typed selectors ──────────────────────────────────────────────────────────
export const selectActiveSection      = (s: AppState) => s.activeSection
export const selectIsLoaded           = (s: AppState) => s.isLoaded
export const selectIsSceneReady       = (s: AppState) => s.isSceneReady
export const selectCamera             = (s: AppState) => s.camera
export const selectTransition         = (s: AppState) => s.transition
export const selectIntroStage         = (s: AppState) => s.introStage
export const selectIntroProgress      = (s: AppState) => s.introProgress
export const selectHasEnteredUniverse = (s: AppState) => s.hasEnteredUniverse
export const selectIntroCompleted     = (s: AppState) =>
  s.introStage >= IntroStage.ACTIVE

// Planet selectors
export const selectActivePlanet    = (s: AppState) => s.activePlanet
export const selectPreviousPlanet  = (s: AppState) => s.previousPlanet
export const selectIsTraveling     = (s: AppState) => s.isTraveling
export const selectTravelProgress  = (s: AppState) => s.travelProgress

// World immersion selectors
export const selectWorldState     = (s: AppState) => s.worldState
export const selectActiveWorld    = (s: AppState) => s.activeWorld
export const selectWorldProgress  = (s: AppState) => s.worldProgress
export const selectTransferTarget = (s: AppState) => s.transferTarget
/** True whenever the user is not purely in the universe view. */
export const selectInWorldFlow    = (s: AppState) => s.worldState !== 'universe'
