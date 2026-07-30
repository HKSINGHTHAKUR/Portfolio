'use client'

import type { Project } from '@/lib/projectsData'

interface DocumentationVisualProps {
  project: Project
  accent:  string
}

/**
 * DocumentationVisual — the LEFT panel for documentation-mode archives
 * (BizFlow, which has no screenshots). Instead of a gallery it renders
 * software-engineering visuals: a module-relationship graph and a database-
 * entity map drawn as holographic relationship cards, so the space reads as a
 * software engineering dossier rather than an empty gallery.
 *
 * Pure CSS/SVG, GPU-composited; no images required.
 */
export default function DocumentationVisual({ project, accent }: DocumentationVisualProps) {
  const { archive } = project
  const modules  = archive.features
  const entities = archive.entities ?? []

  return (
    <div className="proj-doc">
      {/* ── Module relationship graph ──────────────────────────────── */}
      <figure
        className="proj-doc-panel"
        style={{ borderColor: `${accent}33`, boxShadow: `0 0 44px ${accent}1a` }}
      >
        <div className="proj-doc-graph">
          {/* Central system core */}
          <div
            className="proj-doc-core"
            style={{ borderColor: `${accent}66`, boxShadow: `0 0 30px ${accent}44, inset 0 0 20px ${accent}1a` }}
          >
            <span className="font-mono text-[8px] tracking-[0.22em] uppercase" style={{ color: accent }}>
              {project.title}
            </span>
            <span className="font-sans text-[11px] font-semibold tracking-wide text-white">CORE</span>
          </div>

          {/* Module cards around the core */}
          <div className="proj-doc-modules">
            {modules.map((m, i) => (
              <div
                key={m}
                className="proj-doc-module"
                style={{
                  borderColor: `${accent}33`,
                  background: `linear-gradient(180deg, ${accent}10, ${accent}05)`,
                  animationDelay: `${i * 0.12}s`,
                }}
              >
                <span className="proj-doc-dot" style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }} aria-hidden="true" />
                <span className="font-mono text-[10px] tracking-wide text-slate-200">{m}</span>
              </div>
            ))}
          </div>
        </div>
        <figcaption className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${accent}22` }}>
          <span className="font-sans text-sm font-semibold text-white">Module Relationships</span>
          <span className="font-mono text-[9px] tracking-[0.26em] uppercase" style={{ color: `${accent}cc` }}>
            SYSTEM TOPOLOGY
          </span>
        </figcaption>
      </figure>

      {/* ── Database entity map ────────────────────────────────────── */}
      {entities.length > 0 && (
        <figure
          className="proj-doc-panel mt-4"
          style={{ borderColor: `${accent}33`, boxShadow: `0 0 30px ${accent}14` }}
        >
          <div className="proj-doc-entities">
            {entities.map((e, i) => (
              <div key={e} className="proj-doc-entity-wrap">
                <div
                  className="proj-doc-entity"
                  style={{ borderColor: `${accent}3a`, background: `linear-gradient(180deg, ${accent}0e, ${accent}05)` }}
                >
                  <span className="proj-doc-entity-key font-mono text-[7.5px] tracking-[0.2em] uppercase" style={{ color: `${accent}aa` }}>
                    ENTITY
                  </span>
                  <span className="font-sans text-[12px] font-semibold text-white">{e}</span>
                </div>
                {i < entities.length - 1 && (
                  <span className="proj-doc-rel" style={{ color: `${accent}99` }} aria-hidden="true">—</span>
                )}
              </div>
            ))}
          </div>
          <figcaption className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${accent}22` }}>
            <span className="font-sans text-sm font-semibold text-white">Database Entities</span>
            <span className="font-mono text-[9px] tracking-[0.26em] uppercase" style={{ color: `${accent}cc` }}>
              DATA MODEL
            </span>
          </figcaption>
        </figure>
      )}
    </div>
  )
}
