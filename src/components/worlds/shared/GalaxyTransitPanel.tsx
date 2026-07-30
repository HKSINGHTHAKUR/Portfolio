'use client'

import { useState } from 'react'
import {
  useAppStore,
  selectActiveWorld,
  selectWorldState,
  selectTransferTarget,
} from '@/store/useAppStore'
import { TRANSIT, transitDistance } from '@/lib/galaxyTransit'
import type { PlanetId } from '@/lib/planets'

interface GalaxyTransitPanelProps {
  /** The world this panel is rendered inside. */
  current: PlanetId
  /** Accent for the panel frame (matches the host world tone). */
  accent:  string
}

/**
 * GalaxyTransitPanel — the in-world interplanetary navigation computer.
 *
 * Shown inside every world (top-left), it lists all five worlds with the
 * current one locked/highlighted and the rest selectable. Selecting another
 * world fires `transferToPlanet`, which auto-chains the existing exit → orbit
 * → travel → enter animations — one continuous cinematic journey, no manual
 * return to orbit.
 *
 * Styled as a deep-space navigation terminal: thin cyan borders, mono HUD
 * type, scan-line header. Hover reveals a flavour distance readout.
 */
export default function GalaxyTransitPanel({ current, accent }: GalaxyTransitPanelProps) {
  const worldState     = useAppStore(selectWorldState)
  const activeWorld    = useAppStore(selectActiveWorld)
  const transferTarget = useAppStore(selectTransferTarget)
  const transferTo     = useAppStore((s) => s.transferToPlanet)

  const [hover, setHover] = useState<PlanetId | null>(null)

  // Lock the panel while a transfer is mid-flight so a second click can't
  // interrupt the cinematic chain.
  const locked = worldState !== 'inside' || transferTarget !== null

  return (
    <nav
      className="galaxy-transit world-reveal"
      style={{ borderColor: `${accent}33` }}
      aria-label="Galaxy transit network"
    >
      <div className="galaxy-transit-head" style={{ color: accent }}>
        <span className="galaxy-transit-scan" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        Galaxy Transit Network
      </div>

      <ul className="galaxy-transit-list">
        {TRANSIT.map((d) => {
          const isCurrent = d.id === current
          const isTarget  = transferTarget === d.id
          const dist      = isCurrent ? null : transitDistance(current, d.id)
          return (
            <li key={d.id}>
              <button
                type="button"
                disabled={isCurrent || locked}
                onClick={() => { if (!isCurrent && !locked) transferTo(d.id) }}
                onMouseEnter={() => setHover(d.id)}
                onMouseLeave={() => setHover((h) => (h === d.id ? null : h))}
                className={`galaxy-transit-item ${isCurrent ? 'is-current' : ''} ${isTarget ? 'is-target' : ''}`}
                style={{ ['--dot' as string]: d.accent }}
                aria-current={isCurrent ? 'page' : undefined}
              >
                <span className="galaxy-transit-marker" aria-hidden="true">
                  {isCurrent ? '◉' : '○'}
                </span>
                <span className="galaxy-transit-label" style={isCurrent ? { color: accent } : undefined}>
                  {d.label}
                </span>
                {/* Distance flavour on hover */}
                {!isCurrent && (
                  <span
                    className="galaxy-transit-dist"
                    style={{ color: `${accent}cc`, opacity: hover === d.id ? 1 : 0 }}
                  >
                    {dist} AU
                  </span>
                )}
                {isCurrent && (
                  <span className="galaxy-transit-here" style={{ color: `${accent}aa` }}>
                    ◂ here
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
