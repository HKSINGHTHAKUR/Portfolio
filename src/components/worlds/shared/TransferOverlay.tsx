'use client'

import {
  useAppStore,
  selectWorldState,
  selectTransferTarget,
  selectIsTraveling,
} from '@/store/useAppStore'
import { TRANSIT_BY_ID, TRANSFER_STEPS } from '@/lib/galaxyTransit'

/**
 * TransferOverlay — the cinematic HUD shown during an interplanetary transfer.
 *
 * Mounted globally; renders only while a `transferTarget` is locked. It tracks
 * the transfer through the existing state machine and surfaces:
 *   • the destination's two-line transfer message
 *   • a "TRAVELLING THROUGH HK GALAXY" banner with progress steps
 *     (departure → orbit → target locked → arrival → docking)
 *
 * Pure presentational overlay; it never drives the animation — the store's
 * auto-chain does. Pointer-events off so it can't block the scene.
 */
export default function TransferOverlay() {
  const target      = useAppStore(selectTransferTarget)
  const worldState  = useAppStore(selectWorldState)
  const isTraveling = useAppStore(selectIsTraveling)

  if (!target) return null
  const dest = TRANSIT_BY_ID[target]
  if (!dest) return null

  // Derive the current cinematic step from the live state machine:
  //   exiting  → "Departure complete" (leaving the source world)
  //   universe + traveling → "Orbit reached" / "Target locked"
  //   entering → "Arrival imminent" / "Docking..."
  let step = 0
  if (worldState === 'exiting')        step = 0
  else if (worldState === 'universe')  step = isTraveling ? 2 : 1
  else if (worldState === 'entering')  step = 4
  else                                 step = 4

  const [line1, line2] = dest.transfer

  return (
    <div className="transfer-overlay" aria-hidden="true">
      {/* Top banner */}
      <div className="transfer-banner" style={{ borderColor: `${dest.accent}40` }}>
        <span className="transfer-banner-scan" style={{ background: `linear-gradient(90deg, transparent, ${dest.accent}, transparent)` }} />
        <span className="font-mono transfer-banner-title" style={{ color: dest.accent }}>
          Travelling Through HK Galaxy
        </span>
        <span className="font-mono transfer-banner-msg text-slate-300">{line1}</span>
        <span className="font-mono transfer-banner-sub" style={{ color: `${dest.accent}aa` }}>{line2}</span>
      </div>

      {/* Bottom progress steps */}
      <div className="transfer-steps">
        {TRANSFER_STEPS.map((s, i) => (
          <span
            key={s}
            className="transfer-step font-mono"
            style={{
              color: i < step ? `${dest.accent}dd` : i === step ? '#fff' : '#475569',
              opacity: i <= step ? 1 : 0.4,
            }}
          >
            <span className="transfer-step-tick" style={{ color: dest.accent }}>
              {i < step ? '✓' : i === step ? '▸' : '·'}
            </span>
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}
