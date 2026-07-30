'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Cinematic palette ─────────────────────────────────────────────────────────
const AMBIENT_COLOR = new THREE.Color('#080a14')  // near-black indigo tint
const KEY_COLOR     = new THREE.Color('#818cf8')  // indigo-400 key
const RIM_COLOR     = new THREE.Color('#0ea5e9')  // sky-500 cyan rim
const FILL_SKY      = new THREE.Color('#2e1065')  // deep violet sky
const FILL_GROUND   = new THREE.Color('#020617')  // near-black ground
const ACCENT_COLOR  = new THREE.Color('#7c3aed')  // violet-600 accent
const CORE_COLOR    = new THREE.Color('#a5b4fc')  // indigo-300 core anchor

/**
 * Lighting — cinematic deep-space lighting engine.
 *
 * Layers:
 *   • Ambient        — barely perceptible; preserves the void of space
 *   • Key            — cool indigo directional; primary form definition
 *   • Rim            — cyan point opposite the key; depth separation
 *   • Hemisphere     — deep violet → near-black sky-to-ground fill
 *   • Accent (orbit) — slow-orbiting violet point; gentle highlight motion
 *   • Core anchor    — soft indigo point at world origin; lights future
 *                      planets and the EnergyCore silhouette from inside
 */
export default function Lighting() {
  const accentRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    if (accentRef.current) {
      const t = state.clock.elapsedTime * 0.07
      accentRef.current.position.set(
        Math.sin(t) * 28,
        Math.cos(t * 0.6) * 10,
        Math.cos(t) * 28
      )
    }
  })

  return (
    <group name="lighting">
      <ambientLight intensity={0.10} color={AMBIENT_COLOR} />

      <directionalLight
        position={[15, 12, 8]}
        intensity={0.65}
        color={KEY_COLOR}
        castShadow={false}
      />

      <pointLight
        position={[-20, -8, -15]}
        intensity={0.85}
        distance={120}
        decay={2}
        color={RIM_COLOR}
      />

      {/* Hemisphere: skyColor / groundColor / intensity via args */}
      <hemisphereLight args={[FILL_SKY, FILL_GROUND, 0.18]} />

      <pointLight
        ref={accentRef}
        intensity={0.45}
        distance={80}
        decay={2}
        color={ACCENT_COLOR}
      />

      {/* Core anchor — sits at origin. Gives the EnergyCore visible inner
          luminance and pre-lights the future central planet. */}
      <pointLight
        position={[0, 0, 0]}
        intensity={0.55}
        distance={30}
        decay={2.2}
        color={CORE_COLOR}
      />
    </group>
  )
}
