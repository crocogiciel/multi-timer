'use client'
import { useState, useEffect } from 'react'

export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape')

  useEffect(() => {
    const mql = window.matchMedia('(orientation: portrait)')
    const update = (matches: boolean) => setOrientation(matches ? 'portrait' : 'landscape')
    update(mql.matches)
    const handler = (e: MediaQueryListEvent) => update(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return orientation
}
