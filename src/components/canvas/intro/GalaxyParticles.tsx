'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Particle distribution ────────────────────────────────────────────────────
// Logarithmic spiral disk — particles cluster along two soft arms while a
// background halo gives volume. All sampling done once at mount time.
const PARTICLE_COUNT = 12_000
const ARM_COUNT      = 2
const RADIUS_INNER   = 6
const RADIUS_OUTER   = 60
const ARM_TIGHTNESS  = 0.22       // smaller = looser arms
const ARM_SCATTER    = 1.2        // perpendicular noise around arm centre
const DISK_THICKNESS = 0.8        // vertical scatter
const HALO_FRACTION  = 0.18       // % of points scattered as background halo

// ─── Vertex shader ────────────────────────────────────────────────────────────
const VERT = /* glsl */`
  uniform float uTime;
  uniform float uIntensity;       // master fade 0..1 from intro stages
  uniform float uRotation;        // accumulated rotation (radians)
  uniform float uCoreBoost;       // brightens core during DIVE stage
  attribute float aRadius;
  attribute float aAngle;
  attribute float aSize;
  attribute float aBrightness;
  attribute float aPhase;
  varying float vBrightness;
  varying float vDistFromCore;

  void main() {
    // Orbital speed scales with 1/sqrt(r) — Keplerian feel
    float speed   = 1.0 / sqrt(aRadius * 0.04 + 0.6);
    float angle   = aAngle + uRotation * speed;

    vec3 pos;
    pos.x = cos(angle) * aRadius;
    pos.z = sin(angle) * aRadius;
    pos.y = position.y;

    // Subtle vertical bobbing — adds life without breaking the disk illusion
    pos.y += sin(uTime * 0.3 + aPhase * 6.28318) * 0.08;

    vDistFromCore = aRadius;
    vBrightness   = aBrightness;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uIntensity * (260.0 / -mv.z) * (1.0 + uCoreBoost * (1.0 - aRadius / 60.0));
    gl_Position  = projectionMatrix * mv;
  }
`

// ─── Fragment shader ──────────────────────────────────────────────────────────
const FRAG = /* glsl */`
  uniform float uIntensity;
  uniform vec3  uColorCore;
  uniform vec3  uColorMid;
  uniform vec3  uColorEdge;
  varying float vBrightness;
  varying float vDistFromCore;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    // Dual falloff — sharp inner core + soft halo
    float core = 1.0 - smoothstep(0.0, 0.18, d);
    float halo = 1.0 - smoothstep(0.18, 0.5, d);
    float shape = core + halo * 0.45;

    // Colour ramp: hot indigo near centre → violet → cool cyan at edges
    float t   = smoothstep(0.0, 60.0, vDistFromCore);
    vec3 col  = mix(uColorCore, uColorMid,  smoothstep(0.0, 0.45, t));
         col  = mix(col,         uColorEdge, smoothstep(0.45, 1.0, t));

    float a = shape * vBrightness * uIntensity;
    gl_FragColor = vec4(col, a);
  }
`

/**
 * GalaxyParticles — large-scale orbital particle disk.
 *
 * Sampling: logarithmic spiral with two arms + halo background. Each particle
 * is given its own polar coordinates, brightness, size, and phase. The vertex
 * shader rotates angles by `uRotation` per frame and scales orbital speed by
 * 1/√r for a believable galactic rotation curve.
 *
 * Performance: a single `THREE.Points` draw call, additive blending, no
 * textures, no per-frame allocations.
 */
export default function GalaxyParticles({
  intensity = 1.0,
  coreBoost = 0.0,
}: {
  intensity?: number
  coreBoost?: number
}) {
  const matRef    = useRef<THREE.ShaderMaterial>(null)
  const rotationRef = useRef(0)

  const geometry = useMemo(() => {
    const positions  = new Float32Array(PARTICLE_COUNT * 3)
    const radii      = new Float32Array(PARTICLE_COUNT)
    const angles     = new Float32Array(PARTICLE_COUNT)
    const sizes      = new Float32Array(PARTICLE_COUNT)
    const brightness = new Float32Array(PARTICLE_COUNT)
    const phases     = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isHalo = Math.random() < HALO_FRACTION

      // Radius — biased toward the core for cinematic density
      const rNorm = Math.pow(Math.random(), 1.6)
      const r     = RADIUS_INNER + rNorm * (RADIUS_OUTER - RADIUS_INNER)

      let angle: number

      if (isHalo) {
        // Halo: uniformly distributed
        angle = Math.random() * Math.PI * 2
      } else {
        // Pin to one of the spiral arms
        const armIdx     = Math.floor(Math.random() * ARM_COUNT)
        const armOffset  = (armIdx / ARM_COUNT) * Math.PI * 2
        const spiralBase = Math.log(r / RADIUS_INNER) / ARM_TIGHTNESS
        // Random scatter perpendicular to arm centre — falls off near core
        const scatter    = (Math.random() - 0.5) * ARM_SCATTER * (r / RADIUS_OUTER + 0.4)
        angle            = spiralBase + armOffset + scatter
      }

      radii[i]  = r
      angles[i] = angle

      // Position attribute carries only Y; X/Z are computed in the shader
      positions[i * 3]     = 0
      positions[i * 3 + 1] = (Math.random() - 0.5) * DISK_THICKNESS *
                             (1.0 - Math.min(r / RADIUS_OUTER, 1.0) * 0.7)
      positions[i * 3 + 2] = 0

      sizes[i]      = 0.6 + Math.random() * 1.2
      brightness[i] = isHalo
        ? 0.15 + Math.random() * 0.25
        : 0.45 + Math.pow(Math.random(), 2.0) * 0.55
      phases[i]     = Math.random()
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position',    new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aRadius',     new THREE.BufferAttribute(radii, 1))
    geo.setAttribute('aAngle',      new THREE.BufferAttribute(angles, 1))
    geo.setAttribute('aSize',       new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1))
    geo.setAttribute('aPhase',      new THREE.BufferAttribute(phases, 1))
    return geo
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uRotation:   { value: 0 },
      uIntensity:  { value: intensity },
      uCoreBoost:  { value: coreBoost },
      uColorCore:  { value: new THREE.Color('#a5b4fc') }, // hot indigo
      uColorMid:   { value: new THREE.Color('#7c3aed') }, // violet
      uColorEdge:  { value: new THREE.Color('#0ea5e9') }, // cool cyan
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Live-sync intensity / coreBoost without recreating uniforms
  useEffect(() => {
    if (matRef.current) matRef.current.uniforms.uIntensity.value = intensity
  }, [intensity])

  useEffect(() => {
    if (matRef.current) matRef.current.uniforms.uCoreBoost.value = coreBoost
  }, [coreBoost])

  // GPU cleanup
  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  useFrame((_state, delta) => {
    if (!matRef.current) return
    rotationRef.current += delta * 0.04 // slow, majestic rotation
    matRef.current.uniforms.uTime.value     += delta
    matRef.current.uniforms.uRotation.value  = rotationRef.current
  })

  return (
    <points geometry={geometry} name="galaxy-particles">
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
