'use client'

interface TransmissionLinesProps {
  /** Node centres over the 0–100 canvas, in orbit order. */
  nodePos: { id: string; x: number; y: number }[]
  accent:  string
}

/**
 * TransmissionLines — animated channels from the communication core (50,50)
 * out to each transmission node. Each channel has a faint base wire, a slow
 * flowing dash, and a tiny data packet that travels node ↔ core every few
 * seconds and glows briefly — reading as real communication traffic.
 *
 * Pure SVG over a 0–100 space; only stroke-dashoffset + a small transform
 * animate, so it stays effectively free.
 */
export default function TransmissionLines({ nodePos, accent }: TransmissionLinesProps) {
  const core = { x: 50, y: 50 }

  return (
    <svg
      className="cx-lines"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {nodePos.map((n, i) => (
        <g key={n.id}>
          <line
            x1={core.x} y1={core.y} x2={n.x} y2={n.y}
            stroke={`${accent}26`} strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <line
            className="cx-line-flow"
            x1={core.x} y1={core.y} x2={n.x} y2={n.y}
            stroke={`${accent}b0`} strokeWidth={1.1}
            vectorEffect="non-scaling-stroke"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
          {/* Travelling data packet — animates along the line via offset-path */}
          <circle
            className="cx-packet"
            r="0.9"
            fill="#e0fcff"
            style={{
              offsetPath: `path('M ${core.x} ${core.y} L ${n.x} ${n.y}')`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        </g>
      ))}
    </svg>
  )
}
