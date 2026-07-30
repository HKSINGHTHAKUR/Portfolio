'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'

// ─── Vertex shader ────────────────────────────────────────────────────────────
// Camera-facing plane. We bypass model rotation so the plane always renders
// behind the scene at a fixed depth, regardless of camera orientation.
const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// ─── Fragment shader ──────────────────────────────────────────────────────────
// Two-octave FBM driving a slow flowing gradient. The "flow" is achieved by
// sampling the noise field at uv + uTime offsets along two different vectors,
// then mixing the two — gives the illusion of currents drifting at different
// rates without raymarching or texture lookups.
//
// Output is intentionally low-alpha (max ~0.18) so the layer never dominates.
const FRAG = /* glsl */`
  uniform float uTime;
  uniform float uIntensity;     // 1.0 idle, ramps to ~1.4 during travel
  uniform vec2  uResolution;
  varying vec2  vUv;

  // Cheap hash + smooth value noise
  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p.yx + 33.33);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * vnoise(p);
      p  = p * 2.07 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Aspect-correct UV centred at origin
    vec2 uv = vUv - 0.5;
    uv.x *= uResolution.x / uResolution.y;

    // Radial vignette — softer falloff so the flow feels atmospheric
    // rather than a bounded effect. Fades fully by viewport edges.
    float radial = 1.0 - smoothstep(0.0, 0.75, length(uv) * 1.4);

    // Two flow samples drifting along different vectors at different speeds.
    // Slowed down further — the previous pacing felt slightly looped.
    float t   = uTime * 0.025;
    float fA  = fbm(uv * 1.6 + vec2( t * 0.7, -t * 0.5));
    float fB  = fbm(uv * 2.8 + vec2(-t * 0.4,  t * 0.9));
    float f   = mix(fA, fB, 0.5);

    // Cinematic palette — restrained indigo / violet / cyan tones.
    // These contribute as colour wash, never as discrete bands.
    vec3 indigo = vec3(0.06, 0.05, 0.20);
    vec3 violet = vec3(0.18, 0.10, 0.38);
    vec3 cyan   = vec3(0.05, 0.20, 0.36);
    vec3 cool   = vec3(0.08, 0.12, 0.26);

    vec3 col = cool;
    col = mix(col, indigo, smoothstep(0.30, 0.55, f));
    col = mix(col, violet, smoothstep(0.50, 0.78, f));
    col = mix(col, cyan,   smoothstep(0.65, 0.92, fA));

    // Density: balanced so the flow blends with the nebula rather than
    // overpowering it. Edge fade is more aggressive — the layer feels
    // softer at the periphery and concentrates near the centre of vision.
    float density = (0.10 + f * 0.20) * radial * uIntensity;

    gl_FragColor = vec4(col, clamp(density, 0.0, 0.32));
  }
`

interface EnergyFlowProps {
  /** Distance behind the camera. Negative = forward in camera space. */
  depth?: number
  /** Plane size in world units. Should fully cover the visible frustum. */
  size?: number
}

/**
 * EnergyFlow — Layer 3 of the cinematic background.
 *
 * A camera-anchored plane carrying a slow procedural gradient flow. The
 * plane follows the camera (it tracks position, not rotation, so it always
 * sits behind the rendered scene). Fragment cost: ~3 octaves of value noise.
 *
 * Reads `isTraveling` directly from the store each frame and ramps the
 * intensity uniform from 1.0 → 1.4 during travel, then back. This is the
 * "camera-reactive environment" hook described in the brief.
 *
 * GPU footprint: 1 draw call, 0 textures, ~30 fragment ops per pixel at
 * the layer's coverage area.
 */
export default function EnergyFlow({ depth = -120, size = 600 }: EnergyFlowProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef  = useRef<THREE.ShaderMaterial>(null)
  const intensityRef = useRef(1.0)

  const { size: viewportSize } = useThree()

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(size, size, 1, 1),
    [size]
  )

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uIntensity:  { value: 1.0 },
      uResolution: { value: new THREE.Vector2(viewportSize.width, viewportSize.height) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Live-sync resolution on resize
  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.uResolution.value.set(viewportSize.width, viewportSize.height)
    }
  }, [viewportSize.width, viewportSize.height])

  // GPU cleanup
  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state, delta) => {
    if (!matRef.current || !meshRef.current) return

    matRef.current.uniforms.uTime.value += delta

    // Camera-reactive intensity: ramp toward 1.2 while traveling.
    // Pulled back from 1.4 → 1.2 — the swell should be felt, not seen.
    const traveling   = useAppStore.getState().isTraveling
    const targetI     = traveling ? 1.2 : 1.0
    intensityRef.current += (targetI - intensityRef.current) * Math.min(1, delta * 1.2)
    matRef.current.uniforms.uIntensity.value = intensityRef.current

    // Anchor the plane in front of the camera (in view-space depth) so it
    // always covers the frustum regardless of camera position.
    const cam = state.camera
    meshRef.current.position.copy(cam.position)
    meshRef.current.quaternion.copy(cam.quaternion)
    meshRef.current.translateZ(depth)
  })

  return (
    <mesh ref={meshRef} geometry={geometry} frustumCulled={false} renderOrder={-1000} name="energy-flow">
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
