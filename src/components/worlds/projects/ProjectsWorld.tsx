'use client'

import { useCallback, useState } from 'react'
import {
  useAppStore,
  selectWorldState,
  selectActiveWorld,
} from '@/store/useAppStore'
import { PROJECTS, type Project } from '@/lib/projectsData'
import WorldEnvironment from './WorldEnvironment'
import NetworkLines from './NetworkLines'
import ProjectNode from './ProjectNode'
import ProjectArchiveChamber from './flagship/ProjectArchiveChamber'
import GalaxyTransitPanel from '../shared/GalaxyTransitPanel'

/**
 * ProjectsWorld — Harsh Kumar Singh's Engineering Archive.
 *
 * Level 1 — the Systems Network: every project as a connected node.
 * Level 2 — hover a node: soft glow + slight scale + one-line preview. Nothing
 *           more.
 * Level 3 — click a node: open its dedicated, full-screen Intelligence Archive.
 *           Every project runs on ONE shared archive framework, themed per
 *           project (accent + archive type). Strocter/CodeMate/Aiva are
 *           gallery-mode; BizFlow is documentation-mode.
 *
 * Closing a chamber returns to the node map only — it never exits the world.
 * The entry FLOW into the world (planet click → travel → expansion → dive) is
 * owned by the navigation/transition controllers and is untouched here.
 */
export default function ProjectsWorld() {
  const worldState  = useAppStore(selectWorldState)
  const activeWorld = useAppStore(selectActiveWorld)
  const exitWorld   = useAppStore((s) => s.exitWorld)

  const [active, setActive] = useState<Project | null>(null)

  const open  = useCallback((project: Project) => setActive(project), [])
  const close = useCallback(() => setActive(null), [])

  if (activeWorld !== 'projects') return null
  if (worldState === 'universe') return null

  // Content is only interactive/visible once we're fully inside.
  const inside       = worldState === 'inside'
  const chamberOpen  = inside && active !== null

  return (
    <div className="fixed inset-0 z-20">
      {/* Atmospheric chamber backdrop — always present during the world */}
      <WorldEnvironment />

      {/* Galaxy transit network — only on the node map, not over a chamber */}
      {inside && !chamberOpen && <GalaxyTransitPanel current="projects" accent="#22d3ee" />}

      {/* Node map — fades in once inside, dims out while a chamber is open */}
      <div
        className="relative z-10 w-full h-full flex flex-col items-center px-6 py-20"
        style={{
          opacity: inside ? (chamberOpen ? 0 : 1) : 0,
          transition: 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: inside && !chamberOpen ? 'auto' : 'none',
        }}
      >
        {inside && (
          <>
            <header className="text-center mb-6 shrink-0 world-reveal">
              <div className="font-mono text-[10px] tracking-[0.5em] uppercase text-sky-300/80 mb-3">
                HK · Engineering Archive
              </div>
              <h2
                className="font-sans text-[clamp(1.8rem,4.5vw,3.2rem)] font-bold text-white tracking-tight"
                style={{ textShadow: '0 0 40px rgba(56,189,248,0.35)' }}
              >
                Systems Network.
              </h2>
              <p className="mt-3 font-mono text-[11px] tracking-[0.2em] uppercase text-slate-500">
                {PROJECTS.length} connected systems · select a node to interrogate
              </p>
            </header>

            <div className="proj-network">
              <NetworkLines />
              {PROJECTS.map((project, i) => (
                <ProjectNode key={project.id} project={project} order={i} onOpen={open} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Level 3 — every project opens the shared Intelligence Archive */}
      {chamberOpen && (
        <ProjectArchiveChamber project={active} onClose={close} />
      )}

      {/* Exit affordance — leaves the world entirely (only when on the map) */}
      {inside && !chamberOpen && (
        <button
          type="button"
          onClick={exitWorld}
          className="fixed top-20 right-8 z-50 pointer-events-auto font-mono text-[10px] tracking-[0.3em] uppercase text-slate-400 hover:text-white transition-colors flex items-center gap-2 world-reveal"
          aria-label="Exit Projects World, return to orbit"
        >
          <span className="text-sky-300">←</span> Exit to orbit
        </button>
      )}
    </div>
  )
}
