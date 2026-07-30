'use client'

import { useState } from 'react'
import type { TransmissionNode as TNode } from '@/lib/contactData'

interface TransmissionNodeProps {
  node:    TNode
  pos:     { x: number; y: number }
  order:   number
  active:  boolean
  accent:  string
  onOpen:  (node: TNode) => void
}

/**
 * TransmissionNode — a communication endpoint orbiting the core. Idle: a
 * glyph ring with a soft signal glow and a gentle float. Hover: glow + signal
 * intensify and the outer ring expands. Click: opens the node's communication
 * panel (handled by the parent).
 *
 * Anchored by its centre so the expanding ring never shifts the orbit layout.
 */
export default function TransmissionNode({ node, pos, order, active, accent, onOpen }: TransmissionNodeProps) {
  const [hover, setHover] = useState(false)
  const lit = hover || active

  return (
    <div
      className="cx-node world-reveal"
      style={{
        left: `${pos.x}%`,
        top:  `${pos.y}%`,
        zIndex: lit ? 40 : 22,
        animationDelay: `${order * 120 + 400}ms`,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="cx-node-float" style={{ animationPlayState: lit ? 'paused' : 'running' }}>
        <button
          type="button"
          onClick={() => onOpen(node)}
          className="cx-node-btn"
          style={{
            borderColor: lit ? `${accent}cc` : `${accent}40`,
            boxShadow: lit
              ? `0 0 0 1px ${accent}66, 0 0 46px ${accent}44, inset 0 0 22px ${accent}1f`
              : `0 0 0 1px ${accent}16, 0 0 22px ${accent}26, inset 0 0 16px ${accent}10`,
          }}
          aria-label={`Open ${node.label} communication panel`}
        >
          {/* Rotating outer ring — the satellite antenna */}
          <span className="cx-node-ring" style={{ borderColor: `${accent}55`, borderTopColor: accent }} />

          {/* Expanding signal ring on hover */}
          <span
            className="cx-node-signal"
            style={{ borderColor: `${accent}66`, opacity: lit ? 1 : 0, transform: `scale(${lit ? 1.35 : 1})` }}
          />

          {/* Transmission activity indicator */}
          <span className="cx-node-activity" style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }} />

          <span className="cx-node-glyph" style={{ color: accent, textShadow: `0 0 12px ${accent}cc` }}>
            {node.glyph}
          </span>
        </button>

        {/* Caption under the node */}
        <div className="cx-node-cap">
          <span className="font-mono text-[8px] tracking-[0.3em] uppercase" style={{ color: `${accent}cc` }}>
            Node {node.index}
          </span>
          <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-slate-200">
            {node.label}
          </span>
        </div>
      </div>
    </div>
  )
}
