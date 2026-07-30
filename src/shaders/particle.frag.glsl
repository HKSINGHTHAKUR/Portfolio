// ─── Particle Fragment Shader ─────────────────────────────────────────────────
// < 3ms fragment budget: no texture lookups in hot path.

uniform float uTime;
uniform vec3  uColor;

varying vec3  vPosition;
varying float vDepth;

void main() {
  // Circular point sprite
  vec2  uv    = gl_PointCoord - 0.5;
  float dist  = length(uv);
  if (dist > 0.5) discard;

  // Soft edge
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // Depth fade — farther particles are dimmer
  float depthFade = 1.0 - clamp(vDepth * 0.008, 0.0, 0.6);

  // Subtle pulse
  float pulse = 0.85 + 0.15 * sin(uTime * 2.0 + vPosition.x);

  gl_FragColor = vec4(uColor, alpha * depthFade * pulse);
}
