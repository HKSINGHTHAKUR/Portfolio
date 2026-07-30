'use client'

import {
  useAppStore,
  selectIntroCompleted,
  selectWorldState,
  selectTransferTarget,
} from '@/store/useAppStore'
import DestinationPanels from '@/components/ui/DestinationPanels'
import PlanetHUD from '@/components/ui/PlanetHUD'
import HomeWorld from '@/components/worlds/home/HomeWorld'
import ProjectsWorld from '@/components/worlds/projects/ProjectsWorld'
import TechWorld from '@/components/worlds/tech/TechWorld'
import MissionControlWorld from '@/components/worlds/mission/MissionControlWorld'
import TransmissionHubWorld from '@/components/worlds/contact/TransmissionHubWorld'
import WorldPortalTransition from '@/components/worlds/shared/WorldPortalTransition'
import TransferOverlay from '@/components/worlds/shared/TransferOverlay'

/**
 * PageContent — the post-intro UI shell.
 *
 * Two coexisting layers:
 *   • Universe UI (DestinationPanels + PlanetHUD) — shown only in the
 *     'universe' world state; hidden the instant a world dive begins, and
 *     suppressed entirely during an interplanetary transfer (so the brief
 *     pass-through orbit never flashes the destination panel).
 *   • World UI — the immersive chambers; each self-gates internally.
 *   • WorldPortalTransition — the shared portal overlay that masks every
 *     dive→world cut, tinted to the active destination.
 *   • TransferOverlay — the cinematic HUD during a world-to-world transfer.
 *
 * Returns null while the intro is running.
 */
export default function PageContent() {
  const introDone      = useAppStore(selectIntroCompleted)
  const worldState     = useAppStore(selectWorldState)
  const transferTarget = useAppStore(selectTransferTarget)

  if (!introDone) return null

  // Universe UI shows only when truly parked in orbit — never mid-transfer.
  const inUniverse = worldState === 'universe' && transferTarget === null

  return (
    <>
      {/* Universe-level UI — only while standing in the solar system */}
      {inUniverse && (
        <>
          <DestinationPanels />
          <PlanetHUD />
        </>
      )}

      {/* Immersive worlds (self-gate on activeWorld + worldState) */}
      <HomeWorld />
      <ProjectsWorld />
      <TechWorld />
      <MissionControlWorld />
      <TransmissionHubWorld />

      {/* Portal transition overlay — renders only during entering/exiting */}
      <WorldPortalTransition />

      {/* Interplanetary transfer HUD — renders only during a transfer */}
      <TransferOverlay />
    </>
  )
}
