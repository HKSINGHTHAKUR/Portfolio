/**
 * Detect WebGL2 support. Returns true when the GPU / driver supports it.
 * Falls back to false on old hardware, iOS <15, and server-side environments.
 */
export function supportsWebGL2(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!canvas.getContext('webgl2')
  } catch {
    return false
  }
}

/**
 * Clamp the renderer pixel ratio to [1, max] to avoid overdraw on
 * high-DPI screens that would blow the fragment budget.
 */
export function safePixelRatio(max = 2): number {
  if (typeof window === 'undefined') return 1
  return Math.min(window.devicePixelRatio, max)
}

/**
 * Convert degrees to radians.
 */
export const degToRad = (deg: number): number => (deg * Math.PI) / 180

/**
 * Linear interpolation.
 */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t

/**
 * Map a value from one range to another.
 */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin
