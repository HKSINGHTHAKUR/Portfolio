'use client'

import { useEffect } from 'react'
import { COMMAND_LOG } from '@/lib/missionData'

interface CommandLogProps {
  open:    boolean
  accent:  string
  onClose: () => void
}

/**
 * CommandLog — the Captain's Log: a terminal-style archive of HK Galaxy
 * command events.
 *
 * Slides up from the bottom as a fixed terminal panel. Each entry types in on
 * a stagger (opacity/translate only). Closes on Escape, backdrop, or button.
 */
export default function CommandLog({ open, accent, onClose }: CommandLogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Command log">
      <div className="proj-chamber-backdrop absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className="mc-log relative w-full max-w-2xl m-4 sm:m-8 rounded-lg holo-panel"
        style={{ borderColor: `${accent}33`, boxShadow: `0 0 0 1px ${accent}1f, 0 0 60px ${accent}26` }}
      >
        {/* Terminal title bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: `${accent}22` }}>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.28em] uppercase" style={{ color: accent }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }} />
            HK · Captain's Log
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-slate-400 hover:text-white transition-colors"
            aria-label="Close command log"
          >
            Close ✕
          </button>
        </div>

        {/* Terminal body */}
        <div className="px-5 py-4 font-mono text-[12px] leading-relaxed max-h-[40vh] overflow-y-auto proj-scroll">
          {COMMAND_LOG.map((entry, i) => (
            <div
              key={i}
              className="mc-log-line flex gap-3"
              style={{ animationDelay: `${i * 90 + 120}ms` }}
            >
              <span style={{ color: `${accent}aa` }}>[{entry.stamp}]</span>
              <span className="text-slate-300">{entry.text}</span>
            </div>
          ))}
          <div className="mc-log-line flex gap-2 mt-1" style={{ animationDelay: `${COMMAND_LOG.length * 90 + 120}ms` }}>
            <span style={{ color: accent }}>{'>'}</span>
            <span className="mc-log-caret" style={{ backgroundColor: accent }} aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}
