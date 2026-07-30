'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STREAK_COUNT = 600

// ─── Vertex shader ────────────────────────────────────────────────────────────
// Each streak is a quad-less sprite — we stretch its point size along the
// view direction by inflating gl_PointSize during high warp intensity. The
// fragment shader then draws an elongated soft line within that point.
const VERT = /* glsl */`
  uniform float uTime;
  uniform float uIntensity;   // 0..1 — drives stretch + brightness
  attribute float aSpeed;
  attribute float aOffset;
  attribute float aSize;
  varying float vAlpha;

  void main() {
    // Streaks fly toward the camera along z
    vec3 pos = position;
    float cycle = mod(uTime * aSpeed * (0.4 + uIntensity * 2.5) + aOffset, 1.0);
    pos.z += cycle * 200.0 - 100.0;

    // Fade in from far, fade out near camera
    vAlpha = smoothstep(0.0, 0.15, cycle) * (1.0 - smoothstep(0.85, 1.0, cycle));

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    // Size inflates with warp intensity — that's the stretch illusion
    gl_PointSize = aSize * (1.0 + uIntensity * 12.0) * (180.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`

// ─── Fragment shader ──────────────────────────────────────────────────────────
// Vertical streak inside the point sprite — short ellipse that elongates as
// uIntensity rises. Gives the stretch-into-warp feel without postprocessing.
const FRAG = /* glsl */`
  uniform float uIntensity;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;

    // Compress horizontally / extend vertically as intensity rises.
    // At intensity 0 → uniform circle. At intensity 1 → vertical streak.
    float stretch = 1.0 + uIntensity * 6.0;
    vec2 sUv = vec2(uv.x * stretch, uv.y);
    float d  = length(sUv);
    if (d > 0.5) discard;

    float core = 1.0 - smoothstep(0.0, 0.15, d);
    float halo = 1.0 - smoothstep(0.15, 0.5, d);
    float a    = (core * 0.8 + halo * 0.45) * vAlpha * (0.4 + uIntensity);

    // Cool indigo-white streak
    vec3 col = mix(vec3(0.65, 0.74, 1.0), vec3(0.95, 0.95, 1.0), uIntensity);
    gl_FragColor = vec4(col, a);
  }
`

/**
 * WarpTransition — minimal cinematic warp effect.
 *
 * Renders 600 light streaks flying past the camera. The vertex shader inflates
 * point size with intensity, while the fragment shader stretches the sprite
 * vertically — together they read as elongated star streaks during the warp
 * stage. No postprocessing, no textures.
 *
 * Activation: pass `intensity` from 0 (off) to 1 (full warp). Outside the
 * WARP intro stage, intensity should be 0 — the geometry is still rendered
 * but produces near-zero pixels.
 */
export default function WarpTransition({
  intensity = 0,
}: {
  intensity?: number
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const positions = new Float32Array(STREAK_COUNT * 3)
    const speeds    = new Float32Array(STREAK_COUNT)
    const offsets   = new Float32Array(STREAK_COUNT)
    const sizes     = new Float32Array(STREAK_COUNT)

    for (let i = 0; i < STREAK_COUNT; i++) {
      // Distribute around camera in a thin tube
      const theta = Math.random() * Math.PI * 2
      const r     = 4 + Math.random() * 30
      positions[i * 3]     = Math.cos(theta) * r
      positions[i * 3 + 1] = Math.sin(theta) * r
      positions[i * 3 + 2] = 0

      speeds[i]  = 0.4 + Math.random() * 0.8
      offsets[i] = Math.random()
      sizes[i]   = 0.6 + Math.random() * 1.2
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSpeed',   new THREE.BufferAttribute(speeds, 1))
    geo.setAttribute('aOffset',  new THREE.BufferAttribute(offsets, 1))
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime:      { value: 0 },
      uIntensity: { value: intensity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    if (matRef.current) matRef.current.uniforms.uIntensity.value = intensity
  }, [intensity])

  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  useFrame((_state, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += delta
  })

  // Skip rendering entirely when fully off — saves draw call
  if (intensity <= 0.001) return null

  return (
    <points geometry={geometry} name="warp-transition">
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
