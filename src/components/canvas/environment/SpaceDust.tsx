'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 600
const SPAWN_RADIUS   = 25

// ─── Vertex shader ────────────────────────────────────────────────────────────
// SPAWN_RADIUS is passed as a uniform — no string replacement.
const VERT = /* glsl */`
  uniform float uTime;
  uniform float uSpawnRadius;
  attribute float aSpeed;
  attribute float aOffset;
  attribute float aSize;
  varying float vAlpha;

  void main() {
    // Each particle drifts upward slowly and independently
    vec3 pos = position;
    float cycle = mod(uTime * aSpeed + aOffset, 1.0);
    pos.y += (cycle - 0.5) * uSpawnRadius * 2.0;

    // Smooth in/out at column edges so particles never pop
    vAlpha = sin(cycle * 3.14159265);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (120.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`

const FRAG = /* glsl */`
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    // Soft circular falloff, with a subtle inner core
    float core = 1.0 - smoothstep(0.0, 0.18, d);
    float halo = 1.0 - smoothstep(0.18, 0.5, d);
    float a = (core * 0.6 + halo * 0.4) * vAlpha * uOpacity;

    // Cool dusty blue tint — never overpowering
    gl_FragColor = vec4(0.72, 0.82, 1.0, a);
  }
`

/**
 * SpaceDust — subtle foreground micro-particle layer.
 *
 * Responsibilities:
 *   • 600 dust motes drifting through a vertical column near the camera
 *   • Each particle cycles independently (different speed + phase)
 *   • Smooth fade at column edges — no popping
 *   • Single draw call, additive blending, no textures
 */
export default function SpaceDust() {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const speeds    = new Float32Array(PARTICLE_COUNT)
    const offsets   = new Float32Array(PARTICLE_COUNT)
    const sizes     = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random position within a thin cylinder around the camera
      const theta = Math.random() * Math.PI * 2
      const r     = Math.sqrt(Math.random()) * SPAWN_RADIUS
      positions[i * 3]     = Math.cos(theta) * r
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPAWN_RADIUS * 2
      positions[i * 3 + 2] = Math.sin(theta) * r

      speeds[i]  = 0.015 + Math.random() * 0.035  // slow upward drift
      offsets[i] = Math.random()                   // stagger phase
      sizes[i]   = 0.4 + Math.random() * 0.9
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSpeed',   new THREE.BufferAttribute(speeds, 1))
    geo.setAttribute('aOffset',  new THREE.BufferAttribute(offsets, 1))
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [])

  // Memoised uniforms — never re-created on render
  const uniforms = useMemo(
    () => ({
      uTime:        { value: 0 },
      uOpacity:     { value: 0.16 },
      uSpawnRadius: { value: SPAWN_RADIUS },
    }),
    []
  )

  // GPU resource cleanup
  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <points geometry={geometry} name="space-dust">
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
