'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { GalleryShot } from '@/lib/projectsData'

interface ArchiveGalleryProps {
  shots:       GalleryShot[]
  defaultShot: string
  accent:      string
}

/** Crossfade duration when swapping the active screenshot (ms). */
const FADE_MS = 300

/**
 * ArchiveGallery — the reusable screenshot gallery for every gallery-mode
 * archive (Strocter, CodeMate, Aiva).
 *
 * Large contain-fit preview with a premium crossfade, a caption bar, and a
 * thumbnail strip with a clear active state (brighter border, glow, lift,
 * pulsing dot). Extracted verbatim from the Strocter reference so all archives
 * share one implementation — no duplicated gallery code.
 */
export default function ArchiveGallery({ shots, defaultShot, accent }: ArchiveGalleryProps) {
  const initial = defaultShot || shots[0]?.src || ''

  // `activeSrc` drives thumbnail highlight + caption (updates instantly).
  // `shownSrc` is what the big frame renders; it swaps mid-crossfade so the
  // image never hard-cuts.
  const [activeSrc, setActiveSrc] = useState(initial)
  const [shownSrc,  setShownSrc]  = useState(initial)
  const [visible,   setVisible]   = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const select = useCallback((src: string) => {
    if (src === activeSrc) return
    setActiveSrc(src)            // highlight the new thumbnail immediately
    setVisible(false)            // fade the current image out
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setShownSrc(src)           // swap source while invisible
      setVisible(true)           // fade the new image in
    }, FADE_MS)
  }, [activeSrc])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  if (shots.length === 0) return null
  const activeShot = shots.find((s) => s.src === activeSrc) ?? shots[0]
  const shownShot  = shots.find((s) => s.src === shownSrc)  ?? shots[0]

  return (
    <>
      <figure
        className="proj-strocter-stage-img"
        style={{ borderColor: `${accent}33`, boxShadow: `0 0 44px ${accent}1a` }}
      >
        <div className="proj-strocter-frame">
          <Image
            key={shownShot.src}
            src={shownShot.src}
            alt={`${shownShot.title} (${shownShot.label})`}
            fill
            sizes="(max-width: 1024px) 92vw, 60vw"
            quality={75}
            loading="lazy"
            className="object-contain proj-frame-img"
            style={{ opacity: visible ? 1 : 0, transition: `opacity ${FADE_MS}ms ease` }}
          />
          <span className="proj-gallery-grid" aria-hidden="true" />
        </div>
        <figcaption className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${accent}22` }}>
          <span className="font-sans text-sm font-semibold text-white">{activeShot.title}</span>
          <span className="font-mono text-[9px] tracking-[0.26em] uppercase" style={{ color: `${accent}cc` }}>
            {activeShot.label}
          </span>
        </figcaption>
      </figure>

      {/* Thumbnail strip */}
      <div className="proj-strocter-thumbs">
        {shots.map((shot) => {
          const isActive = shot.src === activeSrc
          return (
            <button
              key={shot.src}
              type="button"
              onClick={() => select(shot.src)}
              className={`proj-thumb ${isActive ? 'proj-thumb-active' : ''}`}
              style={{
                borderColor: isActive ? `${accent}cc` : `${accent}1f`,
                boxShadow:   isActive ? `0 0 24px ${accent}55` : 'none',
              }}
              aria-pressed={isActive}
              aria-label={`Show ${shot.title}`}
            >
              {isActive && (
                <span
                  className="proj-thumb-dot"
                  style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
                  aria-hidden="true"
                />
              )}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
                <Image
                  src={shot.src}
                  alt={`${shot.title} thumbnail`}
                  fill
                  sizes="(max-width: 1024px) 22vw, 130px"
                  quality={75}
                  loading="lazy"
                  className="object-cover object-top proj-thumb-img"
                />
              </div>
              <span
                className="block px-2 py-1.5 font-mono text-[8.5px] tracking-[0.18em] uppercase"
                style={{ color: isActive ? accent : '#94a3b8' }}
              >
                {shot.title}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}
