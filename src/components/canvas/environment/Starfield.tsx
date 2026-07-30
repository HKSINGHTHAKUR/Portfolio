'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'

// ─── Layer definitions ────────────────────────────────────────────────────────
// Three concentric shells of stars with widened depth bands. The far layer
// is pushed further back and the near layer pulled closer — this creates a
// stronger parallax separation and a more believable spatial illusion.
//
// fogStart / fogEnd: distance range over which the layer's stars dim toward
// the deep-space background — a cinematic "atmospheric perspective" effect
// even though no real fog is present.
const LAYERS = [
  // Far — sparse pinpricks, deepest dim, slowest drift
  { count: 4_000, minR: 240, maxR: 520, minSize: 0.5, maxSize: 1.2, drift: 0.008, opacity: 1.00, fogStart: 200, fogEnd: 540, twinkle: 0.20 },
  // Mid — the most populated, primary visual layer
  { count: 2_400, minR: 100, maxR: 220, minSize: 0.7, maxSize: 1.6, drift: 0.012, opacity: 0.85, fogStart:  90, fogEnd: 240, twinkle: 0.40 },
  // Near — sparse, larger, more pronounced twinkle
  { count:   500, minR:  35, maxR:  85, minSize: 0.4, maxSize: 1.0, drift: 0.005, opacity: 0.55, fogStart:  30, fogEnd:  95, twinkle: 0.65 },
] as const

// ─── Vertex shader ────────────────────────────────────────────────────────────
const VERT = /* glsl */`
  uniform float uTime;
  uniform float uDrift;
  uniform float uFogStart;
  uniform float uFogEnd;
  uniform float uReactivity;       // 0 idle, ramps to ~1 during travel
  attribute float aSize;
  attribute float aBrightness;
  attribute float aPhase;
  varying float vBrightness;
  varying float vDepthFade;
  varying float vPhase;
  varying float vReactivity;

  void main() {
    vBrightness = aBrightness;
    vPhase      = aPhase;
    vReactivity = uReactivity;

    // Drift amplitude scales subtly with reactivity — stars feel more alive
    // during travel without any aggressive movement.
    float driftBoost = 1.0 + uReactivity * 1.2;

    vec3 pos = position;
    pos.x += sin(uTime * uDrift + position.z * 0.01) * 0.08 * driftBoost;
    pos.y += cos(uTime * uDrift * 0.7 + position.x * 0.01) * 0.06 * driftBoost;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float dist = -mv.z;

    vDepthFade = 1.0 - smoothstep(uFogStart, uFogEnd, dist);

    // Star size grows slightly during travel — subtle stretch illusion
    gl_PointSize = aSize * (260.0 / dist) * (1.0 + uReactivity * 0.4);
    gl_Position  = projectionMatrix * mv;
  }
`

// ─── Fragment shader ──────────────────────────────────────────────────────────
const FRAG = /* glsl */`
  uniform float uOpacity;
  uniform float uTime;
  uniform float uTwinkleAmount;
  varying float vBrightness;
  varying float vDepthFade;
  varying float vPhase;
  varying float vReactivity;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;

    // Subtle vertical stretch during travel — the "stars stretch slightly"
    // cue from the reference. Stretch is gentle, never warp-clichéd.
    uv.x *= 1.0 + vReactivity * 0.6;
    float d = length(uv);
    if (d > 0.5) discard;

    float core = 1.0 - smoothstep(0.0, 0.15, d);
    float halo = 1.0 - smoothstep(0.15, 0.5, d);
    float pointShape = core + halo * 0.55;

    float twinkle = 1.0 - uTwinkleAmount
                  + uTwinkleAmount * (0.5 + 0.5 * sin(uTime * 1.6 + vPhase * 6.28318));

    vec3 cool = vec3(0.78, 0.85, 1.00);
    vec3 warm = vec3(1.00, 0.95, 0.86);
    vec3 col  = mix(cool, warm, vBrightness * 0.7);

    float alpha = pointShape * vBrightness * vDepthFade * twinkle * uOpacity;
    gl_FragColor = vec4(col, alpha);
  }
`

// ─── Helper: build one star layer ─────────────────────────────────────────────
type LayerCfg = (typeof LAYERS)[number]

function buildLayer(cfg: LayerCfg): [THREE.BufferGeometry, THREE.ShaderMaterial] {
  const { count, minR, maxR, minSize, maxSize, drift, opacity, fogStart, fogEnd, twinkle } = cfg

  const positions  = new Float32Array(count * 3)
  const sizes      = new Float32Array(count)
  const brightness = new Float32Array(count)
  const phases     = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    // Uniform sphere distribution
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.acos(2 * Math.random() - 1)
    const r     = minR + Math.random() * (maxR - minR)

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)

    sizes[i]      = minSize + Math.random() * (maxSize - minSize)
    // Bias brightness so most stars are dim, a few are bright
    brightness[i] = Math.pow(Math.random(), 1.8) * 0.7 + 0.3
    phases[i]     = Math.random()
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position',    new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aSize',       new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1))
  geo.setAttribute('aPhase',      new THREE.BufferAttribute(phases, 1))

  const mat = new THREE.ShaderMaterial({
    vertexShader:   VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime:           { value: 0 },
      uDrift:          { value: drift },
      uOpacity:        { value: opacity },
      uFogStart:       { value: fogStart },
      uFogEnd:         { value: fogEnd },
      uTwinkleAmount:  { value: twinkle },
      uReactivity:     { value: 0 },
    },
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  })

  return [geo, mat]
}

/**
 * Starfield — three-layer procedural star system.
 *
 * Responsibilities:
 *   • Distribute stars across three depth shells with widened separation
 *   • Per-layer atmospheric perspective fog — stars dim toward layer edge
 *   • Per-star twinkle, biased brightness distribution
 *   • Single draw call per layer, additive blending, no textures
 */
export default function Starfield() {
  const materialsRef = useRef<THREE.ShaderMaterial[]>([])

  const layers = useMemo(() => LAYERS.map((cfg) => buildLayer(cfg)), [])

  // GPU resource cleanup on unmount
  useEffect(() => {
    return () => {
      layers.forEach(([geo, mat]) => {
        geo.dispose()
        mat.dispose()
      })
    }
  }, [layers])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // Camera-reactive intensity — eased toward 1 during travel, 0 at idle.
    // Read directly via getState to avoid component re-renders.
    const traveling = useAppStore.getState().isTraveling
    const target    = traveling ? 1.0 : 0.0

    materialsRef.current.forEach((mat) => {
      if (!mat?.uniforms.uTime) return
      mat.uniforms.uTime.value = t
      const cur = mat.uniforms.uReactivity.value
      mat.uniforms.uReactivity.value = cur + (target - cur) * Math.min(1, delta * 1.4)
    })
  })

  return (
    <group name="starfield">
      {layers.map(([geo, mat], i) => (
        <points key={i} geometry={geo}>
          <primitive
            object={mat}
            ref={(ref: THREE.ShaderMaterial | null) => {
              if (ref) materialsRef.current[i] = ref
            }}
            attach="material"
          />
        </points>
      ))}
    </group>
  )
}
