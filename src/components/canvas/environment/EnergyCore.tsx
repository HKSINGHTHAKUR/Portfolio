'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

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
// Fresnel halo — most of the surface is invisible; only the edge glows.
// This is what makes it feel like a "soft energy core" rather than a planet.
const FRAG = /* glsl */`
  uniform float uTime;
  uniform vec3  uColor;
  uniform vec3  uColorDeep;
  uniform float uIntensity;

  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    // Inverse Fresnel — strong at silhouette edge, near-zero at centre
    float fresnel = 1.0 - abs(dot(vNormal, vViewDir));
    float rim     = pow(fresnel, 2.4);

    // Slow breathing pulse
    float pulse = 0.88 + 0.12 * sin(uTime * 0.45);

    // Inner soft luminance — barely visible centre glow
    float inner = pow(fresnel, 6.0) * 0.18;

    vec3 col   = mix(uColorDeep, uColor, rim);
    float a    = (rim * 0.55 + inner) * pulse * uIntensity;

    gl_FragColor = vec4(col, a);
  }
`

interface EnergyCoreProps {
  /** Where the core sits in world space. Defaults to origin. */
  position?: [number, number, number]
  /** Visual radius of the core sphere. */
  radius?: number
  /** Master opacity multiplier — drive this from scroll for fade-out later. */
  intensity?: number
}

/**
 * EnergyCore — the hero section's environmental focal anchor.
 *
 * Renders a soft Fresnel-halo sphere at the world origin that sits behind
 * the hero typography. The shader makes it look like a distant energy
 * field rather than a solid object — strong silhouette glow, near-empty
 * centre, very slow breathing pulse.
 *
 * Purpose:
 *   • Give the eye a focal anchor near "Enter the System."
 *   • Introduce the visual identity of the future "sun" without
 *     pre-empting the planet system.
 *   • Strengthen the visual hierarchy of the hero composition.
 *
 * Performance: a single low-poly sphere, no textures, ~30 lines of shader.
 */
export default function EnergyCore({
  position = [0, 0, 0],
  radius = 4.5,
  intensity = 1.0,
}: EnergyCoreProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(
    () => new THREE.SphereGeometry(radius, 48, 48),
    [radius]
  )

  const uniforms = useMemo(
    () => ({
      uTime:      { value: 0 },
      uColor:     { value: new THREE.Color('#818cf8') }, // indigo-400 rim
      uColorDeep: { value: new THREE.Color('#1e1b4b') }, // indigo-950 core
      uIntensity: { value: intensity },
    }),
    [intensity]
  )

  // GPU cleanup
  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh geometry={geometry} position={position} name="energy-core">
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
  )
}
