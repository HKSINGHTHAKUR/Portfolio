'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'

// ─── Vertex shader ────────────────────────────────────────────────────────────
const VERT = /* glsl */`
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldNormal  = normalize(normalMatrix * normal);
    vViewDir      = normalize(cameraPosition - worldPos.xyz);
    vLocalPos     = position;
    gl_Position   = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// ─── Fragment shader ──────────────────────────────────────────────────────────
// Domain-warped + ridged FBM driving sculpted cinematic nebula formations.
//
// Architecture:
//   • Large-scale clouds: domain-warped FBM (`q` perturbation) → organic shapes
//   • Fine filaments:     ridged FBM → sharp cumulus-like edges
//   • Galactic axis:      horizontal band biases warm core colour
//   • Atmospheric depth:  Fresnel rim + dense-pocket luminance lift
//
// Inspired by NASA cinematic renders + the user's reference image — the
// universe should feel like a sculpted living atmosphere, not a wash.
const FRAG = /* glsl */`
  uniform float uTime;
  uniform float uOpacity;
  uniform float uIntensity;
  uniform float uReactivity;

  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  vec3 hash3(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.xxy + p.yxx) * p.zyx);
  }

  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash3(i).x,                       hash3(i + vec3(1.0,0.0,0.0)).x, f.x),
          mix(hash3(i + vec3(0.0,1.0,0.0)).x, hash3(i + vec3(1.0,1.0,0.0)).x, f.x), f.y),
      mix(mix(hash3(i + vec3(0.0,0.0,1.0)).x, hash3(i + vec3(1.0,0.0,1.0)).x, f.x),
          mix(hash3(i + vec3(0.0,1.0,1.0)).x, hash3(i + vec3(1.0,1.0,1.0)).x, f.x), f.y),
      f.z
    );
  }

  // Standard 4-octave FBM
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p  = p * 2.07 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return v;
  }

  // Ridged FBM — creates sharp filament edges between cloud bodies
  float ridgedFBM(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      float n = vnoise(p);
      n = 1.0 - abs(2.0 * n - 1.0);
      n = n * n;
      v += a * n;
      p  = p * 2.13 + vec3(3.7, 2.2, 5.1);
      a *= 0.5;
    }
    return v;
  }

  // Domain-warped FBM — sample noise displaced by another noise field.
  // Produces flowing, organic cloud shapes rather than smooth blobs.
  float warpedFBM(vec3 p) {
    vec3 q = vec3(
      fbm(p + vec3(0.0)),
      fbm(p + vec3(5.2, 1.3, 7.7)),
      fbm(p + vec3(2.6, 4.1, 9.2))
    );
    return fbm(p + 1.4 * q);
  }

  void main() {
    // Stable per-pixel direction on the inside of the sphere
    vec3 dir = normalize(vLocalPos);

    // Ultra-slow cosmic time — the nebula evolves geologically
    float t = uTime * 0.010;

    // Two sampling scales: huge cloud bodies + finer cumulus filaments
    vec3 p1 = dir * 1.5 + vec3( t,        t * 0.6,  t * 0.3);
    vec3 p2 = dir * 4.2 + vec3(-t * 0.4,  t * 0.2, -t * 0.5);

    float fLarge  = warpedFBM(p1);   // primary cloud body
    float fRidged = ridgedFBM(p2);   // sculpted edges + filaments

    // ── Galactic horizontal axis ────────────────────────────────────────
    // Bias colour and density along the equatorial band so the universe
    // has a clear cinematic structure, like the reference image.
    float band = 1.0 - smoothstep(0.0, 0.42, abs(dir.y));
    band = pow(band, 1.6);  // sharpen the band

    // ── Cinematic cosmic palette ────────────────────────────────────────
    vec3 voidColor  = vec3(0.012, 0.014, 0.030);  // near-black indigo void
    vec3 deepNavy   = vec3(0.04,  0.06,  0.16 );  // deep navy
    vec3 indigo     = vec3(0.10,  0.08,  0.26 );  // indigo
    vec3 violet     = vec3(0.22,  0.12,  0.42 );  // soft violet
    vec3 dustyCyan  = vec3(0.18,  0.30,  0.46 );  // atmospheric cyan haze
    vec3 warmCore   = vec3(0.55,  0.42,  0.32 );  // cream warm galactic core
    vec3 emberPink  = vec3(0.48,  0.22,  0.30 );  // dusty ember filaments

    vec3 col = voidColor;
    col = mix(col, deepNavy,  smoothstep(0.20, 0.40, fLarge));
    col = mix(col, indigo,    smoothstep(0.35, 0.55, fLarge));
    col = mix(col, violet,    smoothstep(0.50, 0.72, fLarge));

    // Atmospheric cyan haze along ridged filaments
    col = mix(col, dustyCyan, smoothstep(0.60, 0.85, fRidged) * 0.65);

    // Warm galactic core — only along the horizontal band, in dense regions
    float coreMask = band * smoothstep(0.50, 0.82, fLarge);
    col = mix(col, warmCore, coreMask * 0.55);

    // Sparse warm pink filaments — adds rare colour interest
    float pinkMask = smoothstep(0.76, 0.94, fRidged) * smoothstep(0.55, 0.80, fLarge);
    col = mix(col, emberPink, pinkMask * 0.45);

    // ── Density build-up ────────────────────────────────────────────────
    float rim = 1.0 - abs(dot(vWorldNormal, vViewDir));
    rim = pow(rim, 1.3);

    float breathe = 0.92 + 0.08 * sin(uTime * 0.06);
    float reactBoost = 1.0 + uReactivity * 0.30;

    float density = (
        0.16                                  // base atmospheric haze
      + fLarge   * 0.30                       // primary cloud bodies
      + fRidged  * 0.20 * fLarge              // detail only where clouds exist
      + rim      * 0.18                       // soft edge concentration
      + coreMask * 0.30                       // bright galactic equator
    ) * uOpacity * uIntensity * breathe * reactBoost;

    // Luminance lift in dense pockets + galactic core glow
    col += vec3(0.08, 0.06, 0.10) * fLarge * fLarge * 1.6;
    col += warmCore * 0.18 * coreMask;

    gl_FragColor = vec4(col, clamp(density, 0.0, 0.62));
  }
`

/**
 * Nebula — shader-based full-sphere cinematic atmosphere.
 *
 * Architecture:
 *   • 600-unit BackSide sphere wrapping the entire scene
 *   • Domain-warped FBM produces large-scale sculpted cloud bodies
 *   • Ridged FBM adds cumulus-like filament edges where clouds are densest
 *   • Horizontal galactic-axis bias gives the universe a clear cinematic
 *     structure: warm cream/ember core along the equator, cooler indigo
 *     and violet at higher and lower latitudes
 *   • Fresnel rim concentrates density at the sphere edge — depth illusion
 *   • Ultra-slow breathing envelope (60s period)
 *   • Camera reactivity ramps density +30% during travel
 *
 * Reference: NASA cinematic galaxy renders, Interstellar deep-space
 * cinematography, the user-supplied reference image.
 *
 * Performance: single draw call, 4 octaves × 3 noise samples = 12 noise
 * lookups per fragment. No textures, no postprocessing.
 */
export default function Nebula() {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  // Slightly higher tessellation for smoother large-scale formations.
  // Cost is negligible — this geometry is rendered with depthWrite off.
  const geometry = useMemo(
    () => new THREE.SphereGeometry(600, 64, 40),
    []
  )

  const uniforms = useMemo(
    () => ({
      uTime:       { value: 0 },
      uOpacity:    { value: 1.0 },
      uIntensity:  { value: 1.0 },
      uReactivity: { value: 0 },
    }),
    []
  )

  // GPU cleanup
  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  useFrame((state, delta) => {
    if (!matRef.current) return
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime

    const traveling = useAppStore.getState().isTraveling
    const target    = traveling ? 1.0 : 0.0
    const cur       = matRef.current.uniforms.uReactivity.value
    matRef.current.uniforms.uReactivity.value = cur + (target - cur) * Math.min(1, delta * 1.4)
  })

  return (
    <mesh geometry={geometry} name="nebula" frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  )
}
