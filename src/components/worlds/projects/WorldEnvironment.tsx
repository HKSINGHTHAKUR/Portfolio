'use client'

import ChamberEnvironment, { TONE_CYAN } from '../shared/ChamberEnvironment'

/**
 * WorldEnvironment — the Projects World backdrop.
 *
 * Thin wrapper around the shared, accent-driven {@link ChamberEnvironment}
 * using the cyan engineering tone. The shared chamber is fully opaque once
 * inside, sealing off the procedural WebGL universe so there is zero shimmer.
 */
export default function WorldEnvironment() {
  return <ChamberEnvironment tone={TONE_CYAN} />
}
