/**
 * Shown when WebGL2 is unavailable (old hardware, bots, iOS <15).
 * Pure CSS — no JS animation — intentionally lightweight.
 */
export default function WebGLFallback() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%), ' +
          'radial-gradient(ellipse at 80% 80%, rgba(14,165,233,0.1) 0%, transparent 60%), ' +
          '#030712',
      }}
    />
  )
}
