'use client'
import { useState, useEffect, useCallback } from 'react'
import { Sequence, TimerBlock } from '../types'
import { loadSequences, saveSequences } from '../lib/storage'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function useSequences() {
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const loaded = loadSequences()
    // migrate old sequences missing new fields
    const migrated = loaded.map(s => ({
      ...s,
      gapDuration: (s as Sequence & { gapDuration?: number }).gapDuration ?? 0,
      tickLeadTime: (s as Sequence & { tickLeadTime?: number }).tickLeadTime ?? 3,
      gapTickLeadTime: (s as Sequence & { gapTickLeadTime?: number }).gapTickLeadTime ?? 3,
    }))
    setSequences(migrated)
    if (migrated.length > 0) setActiveId(migrated[0].id)
  }, [])

  const persist = useCallback((next: Sequence[]) => {
    setSequences(next)
    saveSequences(next)
  }, [])

  const createSequence = useCallback(() => {
    const seq: Sequence = {
      id: uid(),
      name: 'Nouvelle séquence',
      timers: [],
      gapDuration: 0,
      tickLeadTime: 3,
      gapTickLeadTime: 3,
    }
    const next = [...sequences, seq]
    persist(next)
    setActiveId(seq.id)
    return seq.id
  }, [sequences, persist])

  const duplicateSequence = useCallback((id: string) => {
    const seq = sequences.find(s => s.id === id)
    if (!seq) return
    const copy: Sequence = {
      ...seq,
      id: uid(),
      name: seq.name + ' (copie)',
      timers: seq.timers.map(t => ({ ...t, id: uid() })),
    }
    const next = [...sequences, copy]
    persist(next)
    setActiveId(copy.id)
  }, [sequences, persist])

  const deleteSequence = useCallback((id: string) => {
    const next = sequences.filter(s => s.id !== id)
    persist(next)
    if (activeId === id) setActiveId(next[0]?.id ?? null)
  }, [sequences, activeId, persist])

  const renameSequence = useCallback((id: string, name: string) => {
    persist(sequences.map(s => s.id === id ? { ...s, name } : s))
  }, [sequences, persist])

  const updateSequenceSettings = useCallback((id: string, patch: Partial<Pick<Sequence, 'gapDuration' | 'tickLeadTime' | 'gapTickLeadTime'>>) => {
    persist(sequences.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [sequences, persist])

  const addTimer = useCallback((sequenceId: string) => {
    const timer: TimerBlock = { id: uid(), name: 'Timer', duration: 60 }
    persist(sequences.map(s =>
      s.id === sequenceId ? { ...s, timers: [...s.timers, timer] } : s
    ))
    return timer.id
  }, [sequences, persist])

  const duplicateTimer = useCallback((sequenceId: string, timerId: string) => {
    persist(sequences.map(s => {
      if (s.id !== sequenceId) return s
      const idx = s.timers.findIndex(t => t.id === timerId)
      if (idx === -1) return s
      const copy = { ...s.timers[idx], id: uid() }
      const timers = [...s.timers]
      timers.splice(idx + 1, 0, copy)
      return { ...s, timers }
    }))
  }, [sequences, persist])

  const updateTimer = useCallback((sequenceId: string, timerId: string, patch: Partial<TimerBlock>) => {
    persist(sequences.map(s =>
      s.id === sequenceId
        ? { ...s, timers: s.timers.map(t => t.id === timerId ? { ...t, ...patch } : t) }
        : s
    ))
  }, [sequences, persist])

  const deleteTimer = useCallback((sequenceId: string, timerId: string) => {
    persist(sequences.map(s =>
      s.id === sequenceId ? { ...s, timers: s.timers.filter(t => t.id !== timerId) } : s
    ))
  }, [sequences, persist])

  const moveTimer = useCallback((sequenceId: string, fromIdx: number, toIdx: number) => {
    persist(sequences.map(s => {
      if (s.id !== sequenceId) return s
      const timers = [...s.timers]
      const [item] = timers.splice(fromIdx, 1)
      timers.splice(toIdx, 0, item)
      return { ...s, timers }
    }))
  }, [sequences, persist])

  const active = sequences.find(s => s.id === activeId) ?? null

  return {
    sequences,
    active,
    activeId,
    setActiveId,
    createSequence,
    duplicateSequence,
    deleteSequence,
    renameSequence,
    updateSequenceSettings,
    addTimer,
    duplicateTimer,
    updateTimer,
    deleteTimer,
    moveTimer,
  }
}
