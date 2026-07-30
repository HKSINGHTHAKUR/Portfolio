'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

interface SmoothScrollProviderProps {
  children: React.ReactNode
}

/**
 * Mounts a Lenis smooth-scroll instance for the entire page.
 * Placed in the root layout so it persists across route changes.
 */
export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenisRef.current = lenis

    let raf: number

    const tick = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    // Pause when tab is hidden to save GPU cycles
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else {
        raf = requestAnimationFrame(tick)
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
