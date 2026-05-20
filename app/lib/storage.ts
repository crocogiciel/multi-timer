import { Sequence } from '../types'

const KEY = 'apnea-sequences'

export function loadSequences(): Sequence[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSequences(sequences: Sequence[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(sequences))
}
