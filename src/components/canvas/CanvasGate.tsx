'use client'

import dynamic from 'next/dynamic'
import { useWebGLSupport } from '@/hooks/useWebGLSupport'
import WebGLFallback from './WebGLFallback'

// Dynamically import Experience so Three.js / R3F never enters the
// server bundle. ssr: false is required — R3F uses browser-only APIs.
// Must be imported from the client component file directly.
const Experience = dynamic(() => import('./core/Experience'), {
  ssr: false,
  loading: () => null,
})

/**
 * CanvasGate — the SSR-safe entry point for the WebGL layer.
 *
 * Responsibilities:
 *   • Detect WebGL2 support at runtime (client only)
 *   • Render the full R3F canvas when supported
 *   • Render a CSS gradient fallback on unsupported devices
 */
export default function CanvasGate() {
  const webglSupported = useWebGLSupport()

  if (!webglSupported) return <WebGLFallback />

  return <Experience />
}
