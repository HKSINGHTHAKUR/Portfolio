// ─── Particle Vertex Shader ───────────────────────────────────────────────────
// Phase 1 stub. Full sphere → noise morph implemented in Phase 2.

uniform float uTime;
uniform float uProgress;  // 0 = sphere, 1 = noise field (driven by ScrollTrigger)
uniform float uSize;

attribute vec3 aTargetPosition;  // noise-field target positions

varying vec3 vPosition;
varying float vDepth;

void main() {
  // Morph from sphere to noise target
  vec3 pos = mix(position, aTargetPosition, uProgress);

  // Subtle oscillation
  pos.y += sin(uTime * 1.5 + position.x * 2.0) * 0.05;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_PointSize = uSize * (300.0 / -mvPosition.z);
  gl_Position  = projectionMatrix * mvPosition;

  vPosition = pos;
  vDepth    = -mvPosition.z;
}
