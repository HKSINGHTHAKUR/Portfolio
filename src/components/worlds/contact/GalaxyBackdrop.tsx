'use client'

/**
 * GalaxyBackdrop — subtle deep-space energy formations behind the entire hub.
 *
 * Massive cosmic swirls, nebula streams, and a faint spiral, all at very low
 * opacity and rotating extremely slowly (60–120s) so the motion is almost
 * subconscious. Pure CSS gradients + blur + transform — GPU-composited, no
 * shaders, no particles. Sits behind the content, above the chamber backdrop.
 */
export default function GalaxyBackdrop() {
  return (
    <div className="cx-galaxy" aria-hidden="true">
      <span className="cx-galaxy-swirl cx-galaxy-swirl-1" />
      <span className="cx-galaxy-swirl cx-galaxy-swirl-2" />
      <span className="cx-galaxy-spiral" />
      <span className="cx-galaxy-nebula cx-galaxy-nebula-1" />
      <span className="cx-galaxy-nebula cx-galaxy-nebula-2" />
    </div>
  )
}
