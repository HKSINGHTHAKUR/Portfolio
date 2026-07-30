'use client'

import { useEffect } from 'react'
import type { TransmissionNode } from '@/lib/contactData'

interface NodePanelProps {
  node:    TransmissionNode | null
  accent:  string
  onClose: () => void
}

/**
 * NodePanel — the communication panel opened when a transmission node is
 * clicked. Shows the channel title, primary value, supporting detail, and an
 * action button whose behaviour depends on the node kind:
 *   • mailto   → opens the mail client
 *   • external → opens the link in a new tab
 *   • download → links the dossier, or shows "DOSSIER AVAILABLE SOON" when no
 *     PDF exists yet (href empty)
 *
 * Materialises in (scale/opacity/blur); closes on Escape or backdrop click.
 */
export default function NodePanel({ node, accent, onClose }: NodePanelProps) {
  useEffect(() => {
    if (!node) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [node, onClose])

  if (!node) return null

  const unavailable = node.kind === 'download' && !node.href

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${node.label} communication panel`}
    >
      <div className="proj-chamber-backdrop absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className="proj-chamber-panel relative w-full max-w-md p-7 rounded-lg holo-panel"
        style={{ borderColor: `${accent}33`, boxShadow: `0 0 0 1px ${accent}1f, 0 0 70px ${accent}2e` }}
      >
        <span className="holo-corner holo-corner-tl" style={{ borderColor: `${accent}99` }} />
        <span className="holo-corner holo-corner-tr" style={{ borderColor: `${accent}99` }} />
        <span className="holo-corner holo-corner-bl" style={{ borderColor: `${accent}99` }} />
        <span className="holo-corner holo-corner-br" style={{ borderColor: `${accent}99` }} />

        <div className="flex items-start justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: accent }}>
              Node {node.index}
            </span>
            <h2
              className="mt-2 font-mono text-[11px] tracking-[0.26em] uppercase"
              style={{ color: `${accent}dd` }}
            >
              {node.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-mono text-[10px] tracking-[0.25em] uppercase text-slate-400 hover:text-white transition-colors"
            aria-label="Close communication panel"
          >
            Close ✕
          </button>
        </div>

        <div className="my-5 h-px w-full" style={{ background: `linear-gradient(to right, ${accent}66, transparent)` }} />

        {/* Primary value */}
        <div
          className="font-sans text-lg font-semibold text-white break-words"
          style={{ textShadow: `0 0 24px ${accent}44` }}
        >
          {node.value}
        </div>

        {/* Detail lines */}
        <div className="mt-3 space-y-1">
          {node.detail.map((d, i) => (
            <p key={i} className="font-mono text-[11px] text-slate-400 leading-relaxed flex gap-2">
              {node.detail.length > 1 && <span style={{ color: accent }}>›</span>}
              {d}
            </p>
          ))}
        </div>

        {/* Action */}
        <div className="mt-6">
          {unavailable ? (
            <span
              className="inline-block font-mono text-[11px] tracking-[0.2em] uppercase px-5 py-3 rounded-md cursor-not-allowed opacity-60"
              style={{ color: `${accent}99`, border: `1px dashed ${accent}40` }}
              aria-disabled="true"
            >
              ◷ Dossier Available Soon
            </span>
          ) : (
            <a
              href={node.href}
              {...(node.kind === 'external' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              {...(node.kind === 'download' ? { download: true } : {})}
              className="inline-block font-mono text-[11px] tracking-[0.2em] uppercase px-5 py-3 rounded-md transition-all hover:brightness-125"
              style={{ color: '#fff', backgroundColor: `${accent}24`, border: `1px solid ${accent}66` }}
            >
              ↗ {node.action}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
