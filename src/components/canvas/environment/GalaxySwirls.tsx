'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Distant galaxies — config ────────────────────────────────────────────────
//
// Three faint, deeply-recessed spirals composed for visual balance. They
// should feel atmospheric, not like discrete effects — the viewer notices
// them subconsciously while focusing on the planets in the foreground.
//
// Composition: positions chosen so the three swirls anchor different
// quadrants — preventing the right-heavy clustering of the previous pass.
const SWIRLS = [
  // Upper-left — violet, the largest of the three but pushed deeper
  { particles: 700, position: [-260,  140, -420], color: '#8b5cf6', tilt:  0.55, scale: 80, rotSpeed: 0.00018 },
  // Lower-right — cool teal, smaller, mid-depth
  { particles: 560, position: [ 220, -160, -360], color: '#67e8f9', tilt: -0.40, scale: 60, rotSpeed: 0.00012 },
  // Far upper-centre-right — soft mauve, the most distant
  { particles: 420, position: [ 100,  220, -540], color: '#c4b5fd', tilt:  0.95, scale: 55, rotSpeed: 0.00009 },
] as const

// ─── Vertex shader ────────────────────────────────────────────────────────────
const VERT = /* glsl */`
  uniform float uTime;
  uniform float uRotation;
  attribute float aRadius;
  attribute float aAngle;
  attribute float aSize;
  attribute float aBrightness;
  varying float vBrightness;
  varying float vRadial;
  varying float vAtmoFade;

  void main() {
    // Logarithmic spiral evaluated per-frame on the GPU
    float angle = aAngle + uRotation;

    vec3 pos = position;
    pos.x = cos(angle) * aRadius;
    pos.z = sin(angle) * aRadius;
    // pos.y comes from the attribute (disc thickness)

    vBrightness = aBrightness;
    vRadial     = aRadius;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float dist = -mv.z;

    // Atmospheric perspective — particles dissolve into the deep nebula
    // smoothly, never popping into focus. Far swirls fade harder than near
    // swirls, contributing depth rather than discrete shapes.
    vAtmoFade = 1.0 - smoothstep(360.0, 620.0, dist);

    // Render scale — calibrated against typical camera distances
    gl_PointSize = aSize * (340.0 / dist);
    gl_Position  = projectionMatrix * mv;
  }
`

// ─── Fragment shader ──────────────────────────────────────────────────────────
const FRAG = /* glsl */`
  uniform vec3 uColor;
  varying float vBrightness;
  varying float vRadial;
  varying float vAtmoFade;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    // Pure soft halo — no hard core. Reads as nebular gas, not particles.
    float halo = 1.0 - smoothstep(0.05, 0.5, d);
    float shape = pow(halo, 1.6);

    // Brighter near the galactic core of each swirl, dimmer at edge
    float coreFade = 1.0 - smoothstep(0.0, 1.0, vRadial / 1.0);

    // Final alpha: shape × brightness × core × atmospheric depth × master cap.
    // Master cap sits at 0.62 — present enough to read as cosmic structure,
    // restrained enough to never compete with the nebula.
    float a = shape * vBrightness * (0.45 + coreFade * 0.55) * vAtmoFade * 0.62;
    gl_FragColor = vec4(uColor, a);
  }
`

// ─── Per-swirl geometry builder ───────────────────────────────────────────────
function buildSwirl(particles: number, scale: number) {
  const positions  = new Float32Array(particles * 3)
  const radii      = new Float32Array(particles)
  const angles     = new Float32Array(particles)
  const sizes      = new Float32Array(particles)
  const brightness = new Float32Array(particles)

  const arms      = 2
  const tightness = 0.32

  for (let i = 0; i < particles; i++) {
    // Bias radius toward the centre — denser core
    const rNorm = Math.pow(Math.random(), 1.5)
    const r     = (0.1 + rNorm * 0.9) // normalised 0.1..1.0; scaled later

    // Pin to one of the two arms with scatter that grows with radius
    const armIdx     = Math.floor(Math.random() * arms)
    const armOffset  = (armIdx / arms) * Math.PI * 2
    const spiralBase = Math.log(r / 0.1) / tightness
    const scatter    = (Math.random() - 0.5) * 1.4 * (r + 0.3)
    const angle      = spiralBase + armOffset + scatter

    radii[i]  = r * scale
    angles[i] = angle

    positions[i * 3]     = 0
    positions[i * 3 + 1] = (Math.random() - 0.5) * scale * 0.04 * (1 - r * 0.6)
    positions[i * 3 + 2] = 0

    sizes[i]      = 1.4 + Math.random() * 2.2
    // Brightness distribution: most particles dim, a meaningful fraction
    // brighter — the spiral arms need articulation against the deep nebula.
    brightness[i] = 0.32 + Math.pow(Math.random(), 2.2) * 0.62
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position',    new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aRadius',     new THREE.BufferAttribute(radii, 1))
  geo.setAttribute('aAngle',      new THREE.BufferAttribute(angles, 1))
  geo.setAttribute('aSize',       new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1))
  return geo
}

interface SwirlMeshProps {
  cfg: typeof SWIRLS[number]
}

/**
 * SwirlMesh — single distant spiral galaxy.
 *
 * Mounted by GalaxySwirls. Each owns its own rotation accumulator and a
 * single shader material; the parent group applies the position + tilt.
 */
function SwirlMesh({ cfg }: SwirlMeshProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const rotation = useRef(0)

  const geometry = useMemo(() => buildSwirl(cfg.particles, cfg.scale), [cfg])
  const uniforms = useMemo(
    () => ({
      uTime:     { value: 0 },
      uRotation: { value: 0 },
      uColor:    { value: new THREE.Color(cfg.color) },
    }),
    [cfg.color]
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_state, delta) => {
    if (!matRef.current) return
    // Rotation in radians per second — extremely slow, sub-conscious motion.
    // Previous pass mistakenly multiplied by 60, making "slow" too fast.
    rotation.current += delta * cfg.rotSpeed
    matRef.current.uniforms.uTime.value += delta
    matRef.current.uniforms.uRotation.value = rotation.current
  })

  return (
    <group
      position={cfg.position as unknown as [number, number, number]}
      rotation={[cfg.tilt, 0, 0]}
    >
      <points geometry={geometry}>
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
    </group>
  )
}

/**
 * GalaxySwirls — Layer 4 of the cinematic background.
 *
 * Three ultra-distant rotating galaxies. Each is a thin spiral disc rendered
 * as ~300-500 additive points. They rotate so slowly that the motion is
 * subconscious — but their presence dramatically increases environmental
 * richness.
 *
 * GPU footprint: 3 draw calls, 0 textures, ~1130 vertices total.
 */
export default function GalaxySwirls() {
  return (
    <group name="galaxy-swirls">
      {SWIRLS.map((cfg, i) => (
        <SwirlMesh key={i} cfg={cfg} />
      ))}
    </group>
  )
}
