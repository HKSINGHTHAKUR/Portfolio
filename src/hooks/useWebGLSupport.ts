'use client'

import { useState, useEffect } from 'react'
import { supportsWebGL2 } from '@/utils/webgl'

/**
 * Returns whether the current device supports WebGL2.
 * Runs only on the client; defaults to `false` during SSR.
 */
export function useWebGLSupport(): boolean {
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(supportsWebGL2())
  }, [])

  return supported
}
