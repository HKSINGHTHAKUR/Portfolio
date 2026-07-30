'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor, Preload } from '@react-three/drei'
import { safePixelRatio } from '@/utils/webgl'
import { useAppStore } from '@/store/useAppStore'
import Scene from './Scene'

// ─── Canvas configuration constants ─────────────────────────────────────────
// Defined outside component to prevent re-allocation on renders.
const GL_CONFIG = {
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance' as const,
  preserveDrawingBuffer: false,
  // Disable stencil and depth buffers we don't use — saves VRAM
  stencil: false,
}

const CAMERA_CONFIG = {
  fov: 60,
  near: 0.1,
  far: 2000,
  position: [0, 0, 22] as [number, number, number],
}

/**
 * Experience — the persistent fullscreen WebGL canvas.
 *
 * Responsibilities:
 *   • Configure the R3F Canvas with production-safe rendering settings
 *   • Wire the performance monitor (adaptive DPR under load)
 *   • Mount the Scene inside a Suspense boundary
 *   • Signal the app store when the GL context is ready
 *
 * This component is dynamically imported (ssr: false) from CanvasGate,
 * so Three.js never appears in the server bundle.
 */
export default function Experience() {
  const setSceneReady = useAppStore((s) => s.setSceneReady)

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
    >
      <Canvas
        dpr={[1, safePixelRatio(2)]}
        gl={GL_CONFIG}
        camera={CAMERA_CONFIG}
        shadows={false}
        flat={false}
        onCreated={({ gl }) => {
          // Transparent clear — HTML layers show through
          gl.setClearColor(0x000000, 0)
          setSceneReady(true)
        }}
        style={{ background: 'transparent' }}
      >
        {/*
          PerformanceMonitor: when the FPS consistently drops below the
          threshold, AdaptiveDpr will lower the pixel ratio automatically.
        */}
        <PerformanceMonitor>
          <AdaptiveDpr pixelated />
        </PerformanceMonitor>

        <AdaptiveEvents />

        <Suspense fallback={null}>
          <Scene />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
