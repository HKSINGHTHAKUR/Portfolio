'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

/**
 * Initialises a Lenis smooth-scroll instance and returns it.
 * Cleans up automatically on unmount.
 */
export function useSmoothScroll(): React.RefObject<Lenis | null> {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenisRef.current = lenis

    let raf: number

    const onRaf = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(onRaf)
    }

    raf = requestAnimationFrame(onRaf)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}
