'use client'

import { useEffect, useRef, useState } from 'react'

interface CounterProps {
  value:   number
  suffix?: string
  /** Count-up duration in ms. */
  duration?: number
}

/**
 * Counter — animates a number from 0 to `value` once, on mount. Uses a single
 * rAF loop with an ease-out curve and cancels cleanly. Cheap: one element,
 * one animation frame loop that stops at completion.
 */
export default function Counter({ value, suffix = '', duration = 1200 }: CounterProps) {
  const [n, setN] = useState(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setN(Math.round(eased * value))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [value, duration])

  return <>{n}{suffix}</>
}
