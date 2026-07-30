'use client'

import type { CSSProperties, ReactNode } from 'react'

interface HolographicPanelProps {
  children:  ReactNode
  /** Accent colour (hex) — tints the border, corners, and glow. */
  accent?:   string
  className?: string
  style?:    CSSProperties
  /** Show the animated scan-line overlay. */
  scanline?: boolean
}

/**
 * HolographicPanel — the base spatial UI surface for the Projects World.
 *
 * Renders a glass-morphic projected-light panel with HUD corner brackets,
 * an optional scan-line sweep, and an accent-tinted edge glow. Used as the
 * shell for project nodes and the chamber header.
 *
 * Everything reads as holographic projection, never a flat web card.
 */
export default function HolographicPanel({
  children,
  accent = '#7dd3fc',
  className = '',
  style,
  scanline = true,
}: HolographicPanelProps) {
  return (
    <div
      className={[
        'holo-panel holo-flicker rounded-lg',
        scanline ? 'holo-scanline overflow-hidden' : '',
        className,
      ].join(' ')}
      style={{
        // Tint the border + glow toward the accent
        borderColor: `${accent}30`,
        boxShadow:
          `0 0 0 1px ${accent}10, ` +
          `0 0 40px ${accent}14, ` +
          `inset 0 0 30px ${accent}08`,
        ...style,
      }}
    >
      {/* HUD corner brackets */}
      <span className="holo-corner holo-corner-tl" style={{ borderColor: `${accent}99` }} />
      <span className="holo-corner holo-corner-tr" style={{ borderColor: `${accent}99` }} />
      <span className="holo-corner holo-corner-bl" style={{ borderColor: `${accent}99` }} />
      <span className="holo-corner holo-corner-br" style={{ borderColor: `${accent}99` }} />

      {children}
    </div>
  )
}
