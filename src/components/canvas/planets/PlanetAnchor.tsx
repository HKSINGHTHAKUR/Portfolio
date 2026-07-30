'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Planet } from '@/lib/planets'
import { useAppStore } from '@/store/useAppStore'

// ─── Vertex shader ────────────────────────────────────────────────────────────
const VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormal       = normalize(normalMatrix * normal);
    vViewDir      = normalize(cameraPosition - worldPos.xyz);
    gl_Position   = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// ─── Fragment shader ──────────────────────────────────────────────────────────
// Fresnel-driven luminous body — strong silhouette glow, soft inner core.
// Slow breathing pulse, brightens when this planet is the active destination.
const FRAG = /* glsl */`
  uniform float uTime;
  uniform float uActive;        // 0..1 — 1 when this is the active planet
  uniform vec3  uColor;
  uniform vec3  uGlow;

  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fresnel = 1.0 - abs(dot(vNormal, vViewDir));
    float rim     = pow(fresnel, 2.0);
    float core    = pow(1.0 - fresnel, 2.5) * 0.6;

    // Slow breathing — frequency increases slightly when active
    float pulseFreq = 0.4 + uActive * 0.3;
    float pulse     = 0.85 + 0.15 * sin(uTime * pulseFreq);

    // Active boost — brighter rim when selected
    float activeBoost = 1.0 + uActive * 0.5;

    vec3 col = mix(uColor, uGlow, rim);
    float a  = (rim * 0.7 + core) * pulse * activeBoost;

    gl_FragColor = vec4(col, clamp(a, 0.0, 0.95));
  }
`

interface PlanetAnchorProps {
  planet: Planet
}

/**
 * PlanetAnchor — a single luminous spherical destination in the universe.
 *
 * Each destination renders one Fresnel-shaded sphere at its world position.
 * The active planet glows brighter; the others sit calm in the background.
 * Anchors slowly bob in place so the universe never feels static.
 */
export default function PlanetAnchor({ planet }: PlanetAnchorProps) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef   = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(
    () => new THREE.SphereGeometry(planet.radius, 48, 48),
    [planet.radius]
  )

  const uniforms = useMemo(
    () => ({
      uTime:   { value: 0 },
      uActive: { value: planet.id === 'home' ? 1 : 0 },
      uColor:  { value: new THREE.Color(planet.color) },
      uGlow:   { value: new THREE.Color(planet.glow) },
    }),
    [planet.color, planet.glow, planet.id]
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_state, delta) => {
    const store = useAppStore.getState()

    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta

      // Live-sync active state — read directly to skip re-renders
      const active = store.activePlanet === planet.id
      const target = active ? 1 : 0
      const cur    = matRef.current.uniforms.uActive.value
      matRef.current.uniforms.uActive.value = cur + (target - cur) * Math.min(1, delta * 2.0)
    }

    if (groupRef.current) {
      const t = (matRef.current?.uniforms.uTime.value ?? 0)

      // Gentle in-place bob so anchors never feel static
      groupRef.current.position.y =
        planet.worldPosition.y + Math.sin(t * 0.4 + planet.worldPosition.x * 0.1) * 0.18

      // ── World-entry expansion ──────────────────────────────────────────
      // When this planet is the one being entered, it scales up massively as
      // the camera dives in — selling the "planet fills the viewport" beat.
      // All other planets stay at unit scale.
      const isEnteredWorld =
        store.activeWorld === planet.id && store.worldState !== 'universe'
      const targetScale = isEnteredWorld ? 1 + store.worldProgress * 6.0 : 1
      const curScale    = groupRef.current.scale.x
      groupRef.current.scale.setScalar(
        curScale + (targetScale - curScale) * Math.min(1, delta * 5.0)
      )
    }
  })

  return (
    <group
      ref={groupRef}
      position={[
        planet.worldPosition.x,
        planet.worldPosition.y,
        planet.worldPosition.z,
      ]}
      name={`planet-${planet.id}`}
    >
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
