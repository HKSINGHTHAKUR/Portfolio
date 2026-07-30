'use client'

import { useEffect } from 'react'
import type { Project } from '@/lib/projectsData'
import ArchiveGallery from './ArchiveGallery'
import DocumentationVisual from './DocumentationVisual'

interface ProjectArchiveChamberProps {
  project: Project
  onClose: () => void
}

/**
 * ProjectArchiveChamber — the shared, full-screen Intelligence Archive for
 * EVERY project. One framework, four personalities.
 *
 * A sticky header (back-nav + archive title) frames a 60/40 body:
 *   LEFT  (60%) — gallery-mode: real screenshot gallery (Strocter, CodeMate,
 *                 Aiva); documentation-mode: engineering visuals (BizFlow).
 *   RIGHT (40%) — shared engineering readout: overview, problem (+ solution),
 *                 architecture pipeline, core features/modules, tech stack,
 *                 engineering highlights, and system links.
 *
 * Per-project personality comes through `accent`, `archiveType`/`archiveTitle`,
 * and content. Closing returns to the node map only — never exits the world.
 */
export default function ProjectArchiveChamber({ project, onClose }: ProjectArchiveChamberProps) {
  const { accent, archive } = project
  const hasGallery = !!archive.gallery && archive.gallery.length > 0

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="proj-strocter-stage" role="dialog" aria-modal="true" aria-label={archive.archiveTitle}>
      <div className="proj-strocter-backdrop" aria-hidden="true" />

      <div className="proj-strocter-panel" style={{ borderColor: `${accent}33`, boxShadow: `0 0 90px ${accent}22` }}>
        {/* ── Sticky header — never scrolls ──────────────────────────── */}
        <header className="proj-strocter-bar" style={{ borderColor: `${accent}22` }}>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] tracking-[0.22em] uppercase text-slate-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <span style={{ color: accent }}>←</span> Back to Systems Network
          </button>
          <span className="proj-strocter-title font-mono text-[10px] tracking-[0.4em] uppercase" style={{ color: `${accent}cc` }}>
            {archive.archiveTitle}
          </span>
        </header>

        {/* ── Body: 60 / 40 split ────────────────────────────────────── */}
        <div className="proj-strocter-body">
          {/* LEFT — gallery (60%) or documentation visuals */}
          <div className="proj-strocter-gallery proj-scroll">
            {hasGallery ? (
              <ArchiveGallery
                shots={archive.gallery!}
                defaultShot={archive.defaultShot ?? archive.gallery![0].src}
                accent={accent}
              />
            ) : (
              <DocumentationVisual project={project} accent={accent} />
            )}
          </div>

          {/* RIGHT — engineering readout (40%) */}
          <div className="proj-strocter-info proj-scroll">
            {/* Identity */}
            <div className="mb-6">
              <span
                className="proj-flag-badge"
                style={{ color: accent, borderColor: `${accent}55`, backgroundColor: `${accent}14` }}
              >
                <span
                  className="proj-status-pulse w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
                />
                {project.flagship ? 'Flagship System' : archive.archiveType}
              </span>
              <h2
                className="mt-3 font-sans text-[clamp(1.9rem,4vw,2.6rem)] font-bold text-white leading-none tracking-tight"
                style={{ textShadow: `0 0 40px ${accent}66` }}
              >
                {project.title}
              </h2>
              <p className="mt-2 font-mono text-[11px] tracking-[0.22em] uppercase text-slate-400">
                {project.category}
              </p>
            </div>

            {/* Overview */}
            <Section accent={accent} label="Overview">
              <p className="font-mono text-[12px] text-slate-300 leading-relaxed">{project.description}</p>
            </Section>

            {/* Problem */}
            <Section accent={accent} label="Problem">
              <p className="font-mono text-[12px] text-slate-300 leading-relaxed">{archive.problem}</p>
            </Section>

            {/* Solution — documentation archives */}
            {archive.solution && (
              <Section accent={accent} label="Solution">
                <p className="font-mono text-[12px] text-slate-300 leading-relaxed">{archive.solution}</p>
              </Section>
            )}

            {/* Architecture — vertical system pipeline */}
            <Section accent={accent} label="Architecture">
              <ul className="proj-pipeline">
                {archive.architecture.map((tier, i) => (
                  <li key={tier.id}>
                    <div className="proj-pipe-node" style={{ ['--accent' as string]: accent }}>
                      <span className="proj-pipe-rail" style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }} aria-hidden="true" />
                      <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-slate-400">{tier.tier}</span>
                      <span className="font-sans text-[13px] font-semibold text-white">{tier.tech}</span>
                    </div>
                    {i < archive.architecture.length - 1 && (
                      <span className="proj-pipe-link" aria-hidden="true">
                        <span className="proj-pipe-line" style={{ background: `linear-gradient(${accent}, ${accent}22)` }} />
                        <span className="proj-pipe-pulse" style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }} />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Core features / modules — holographic cards */}
            <Section accent={accent} label={archive.featuresLabel ?? 'Core Features'}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {archive.features.map((f) => (
                  <div
                    key={f}
                    className="proj-feature"
                    style={{ borderColor: `${accent}2a`, background: `linear-gradient(180deg, ${accent}0c, ${accent}04)` }}
                  >
                    <span className="proj-feature-dot" style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }} aria-hidden="true" />
                    <span className="font-mono text-[10.5px] text-slate-200 leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Tech stack — grouped technology chips */}
            <Section accent={accent} label="Tech Stack">
              <div className="space-y-3">
                {archive.techStack.map((group) => (
                  <div key={group.label}>
                    <div className="font-mono text-[8.5px] tracking-[0.26em] uppercase text-slate-500 mb-1.5">
                      {group.label}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[10px] tracking-wide uppercase px-2.5 py-1 rounded"
                          style={{ color: `${accent}ee`, backgroundColor: `${accent}10`, border: `1px solid ${accent}2e` }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Engineering highlights — archive entries */}
            <Section accent={accent} label="Engineering Highlights">
              <ul className="space-y-1.5">
                {archive.highlights.map((h, i) => (
                  <li key={h} className="proj-archive-entry" style={{ borderColor: `${accent}1f` }}>
                    <span className="font-mono text-[9px] tracking-[0.2em]" style={{ color: `${accent}aa` }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[11px] text-slate-200 leading-snug">{h}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* System links */}
            <Section accent={accent} label="System Links">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="proj-sysbtn"
                  style={{ color: '#fff', backgroundColor: `${accent}22`, borderColor: `${accent}66` }}
                >
                  ↗ Open Repository
                </a>
                {project.links.live ? (
                  <a
                    href={project.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="proj-sysbtn"
                    style={{ color: '#fff', backgroundColor: `${accent}16`, borderColor: `${accent}55` }}
                  >
                    ↗ Live System
                  </a>
                ) : (
                  <span
                    className="proj-sysbtn proj-sysbtn-disabled"
                    style={{ color: `${accent}99`, borderColor: `${accent}33` }}
                    aria-disabled="true"
                    title="Live demo coming soon"
                  >
                    ◷ Live Demo · Coming Soon
                  </span>
                )}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}

/** A labelled section block inside the right-hand readout. */
function Section({
  accent,
  label,
  children,
}: {
  accent:   string
  label:    string
  children: React.ReactNode
}) {
  return (
    <section className="mb-7">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="inline-block w-4 h-px" style={{ backgroundColor: accent }} />
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: accent }}>{label}</span>
      </div>
      {children}
    </section>
  )
}
