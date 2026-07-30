'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Vertex shader ────────────────────────────────────────────────────────────
const VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormal       = normalize(normalMatrix * normal);
    vViewDir      = normalize(cameraPosition - worldPos.xyz);
    vLocalPos     = position;
    gl_Position   = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// ─── Fragment shader ──────────────────────────────────────────────────────────
// Layered radial gradient with light noise distortion. Strong inner glow
// blends through violet → cyan → fade. Pulses very slowly.
const FRAG = /* glsl */`
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3  uColorHot;
  uniform vec3  uColorMid;
  uniform vec3  uColorEdge;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  // Simple smooth value noise — single octave, cheap
  float hash(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i),                    hash(i + vec3(1.0,0.0,0.0)), f.x),
          mix(hash(i + vec3(0.0,1.0,0.0)), hash(i + vec3(1.0,1.0,0.0)), f.x), f.y),
      mix(mix(hash(i + vec3(0.0,0.0,1.0)), hash(i + vec3(1.0,0.0,1.0)), f.x),
          mix(hash(i + vec3(0.0,1.0,1.0)), hash(i + vec3(1.0,1.0,1.0)), f.x), f.y),
      f.z
    );
  }

  void main() {
    // Inverse Fresnel — glow concentrated at silhouette
    float fresnel = 1.0 - abs(dot(vNormal, vViewDir));

    // Radial position from sphere centre, normalised
    float radial = length(vLocalPos) / 8.0;

    // Slow energy noise — barely perceptible distortion
    float n = vnoise(vLocalPos * 0.4 + uTime * 0.04);

    // Triple-band radial colour ramp
    vec3 col = uColorHot;
    col = mix(col, uColorMid,  smoothstep(0.0,  0.5,  fresnel + n * 0.1));
    col = mix(col, uColorEdge, smoothstep(0.4,  0.95, fresnel));

    // Slow breathing pulse
    float pulse = 0.92 + 0.08 * sin(uTime * 0.35);

    float coreGlow  = pow(1.0 - fresnel, 2.0) * 0.7;   // bright inner
    float edgeHalo  = pow(fresnel, 2.0) * 0.55;        // soft outer
    float a         = (coreGlow + edgeHalo) * pulse * uIntensity;

    gl_FragColor = vec4(col, clamp(a, 0.0, 0.95));
  }
`

interface GalaxyCoreProps {
  /** 0..1 — fade controlled by intro stage. */
  intensity?: number
  /** Sphere radius — keep low; the bulk of the visual mass is the particles. */
  radius?: number
}

/**
 * GalaxyCore — the glowing galactic centre.
 *
 * A single Fresnel-driven sphere that visually anchors the galaxy. The inner
 * region glows hot indigo / violet, the silhouette fades to cool cyan and
 * dissolves into the surrounding particle disk. Slow noise distortion plus a
 * gentle pulse give it living energy without ever feeling animated.
 *
 * Performance: one draw call, ~50 lines of shader, single-octave noise only.
 */
export default function GalaxyCore({ intensity = 1.0, radius = 4 }: GalaxyCoreProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(
    () => new THREE.SphereGeometry(radius, 48, 48),
    [radius]
  )

  const uniforms = useMemo(
    () => ({
      uTime:      { value: 0 },
      uIntensity: { value: intensity },
      uColorHot:  { value: new THREE.Color('#c7d2fe') }, // bright indigo-200
      uColorMid:  { value: new THREE.Color('#7c3aed') }, // violet-600
      uColorEdge: { value: new THREE.Color('#0ea5e9') }, // sky-500
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

  return (
    <mesh geometry={geometry} name="galaxy-core">
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
