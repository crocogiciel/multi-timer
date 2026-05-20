'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { TimerBlock } from '../types'
import { playBeep, initAudio } from '../lib/sound'

export type PlayerState = 'idle' | 'running' | 'paused' | 'done'
export type PlayerPhase = 'timer' | 'gap'

export function usePlayer(timers: TimerBlock[], gapDuration: number, tickLeadTime: number, gapTickLeadTime: number) {
  const [state, setState] = useState<PlayerState>('idle')
  const [phase, setPhase] = useState<PlayerPhase>('timer')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [gapElapsed, setGapElapsed] = useState(0)

  const stateRef = useRef<PlayerState>('idle')
  const phaseRef = useRef<PlayerPhase>('timer')
  const indexRef = useRef(0)
  const elapsedRef = useRef(0)
  const gapElapsedRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timersRef = useRef(timers)
  const gapDurationRef = useRef(gapDuration)
  const tickLeadTimeRef = useRef(tickLeadTime)
  const gapTickLeadTimeRef = useRef(gapTickLeadTime)

  useEffect(() => { timersRef.current = timers }, [timers])
  useEffect(() => { gapDurationRef.current = gapDuration }, [gapDuration])
  useEffect(() => { tickLeadTimeRef.current = tickLeadTime }, [tickLeadTime])
  useEffect(() => { gapTickLeadTimeRef.current = gapTickLeadTime }, [gapTickLeadTime])

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const goTimer = useCallback((index: number, playStartSound = false) => {
    indexRef.current = index
    elapsedRef.current = 0
    phaseRef.current = 'timer'
    setCurrentIndex(index)
    setElapsed(0)
    setPhase('timer')
    if (playStartSound) playBeep('start')
  }, [])

  const goGap = useCallback(() => {
    gapElapsedRef.current = 0
    phaseRef.current = 'gap'
    setGapElapsed(0)
    setPhase('gap')
  }, [])

  const finishSequence = useCallback(() => {
    clearTick()
    setState('done')
    stateRef.current = 'done'
    playBeep('done')
  }, [])

  const startTick = useCallback(() => {
    clearTick()
    intervalRef.current = setInterval(() => {
      if (stateRef.current !== 'running') return

      if (phaseRef.current === 'gap') {
        gapElapsedRef.current += 1
        setGapElapsed(gapElapsedRef.current)
        const gapRemaining = gapDurationRef.current - gapElapsedRef.current
        if (gapTickLeadTimeRef.current > 0 && gapRemaining <= gapTickLeadTimeRef.current && gapRemaining > 0) {
          playBeep('tick')
        }
        if (gapElapsedRef.current >= gapDurationRef.current) {
          goTimer(indexRef.current + 1, true)
        }
      } else {
        elapsedRef.current += 1
        setElapsed(elapsedRef.current)

        const current = timersRef.current[indexRef.current]
        if (!current) return

        const remaining = current.duration - elapsedRef.current
        if (tickLeadTimeRef.current > 0 && remaining <= tickLeadTimeRef.current && remaining > 0) {
          playBeep('tick')
        }

        if (elapsedRef.current >= current.duration) {
          playBeep('end')
          const nextIndex = indexRef.current + 1
          if (nextIndex >= timersRef.current.length) {
            finishSequence()
          } else if (gapDurationRef.current > 0) {
            goGap()
          } else {
            goTimer(nextIndex)
          }
        }
      }
    }, 1000)
  }, [goTimer, goGap, finishSequence])

  const play = useCallback(async () => {
    if (timersRef.current.length === 0) return
    await initAudio() // iOS: must resume AudioContext from user gesture
    if (stateRef.current === 'idle' || stateRef.current === 'done') {
      goTimer(0, true)
    }
    setState('running')
    stateRef.current = 'running'
    startTick()
  }, [goTimer, startTick])

  const pause = useCallback(() => {
    clearTick()
    setState('paused')
    stateRef.current = 'paused'
  }, [])

  const resume = useCallback(async () => {
    await initAudio() // iOS: re-activate AudioContext on resume gesture
    setState('running')
    stateRef.current = 'running'
    startTick()
  }, [startTick])

  const stop = useCallback(() => {
    clearTick()
    setState('idle')
    stateRef.current = 'idle'
    phaseRef.current = 'timer'
    setPhase('timer')
    setCurrentIndex(0)
    setElapsed(0)
    setGapElapsed(0)
    indexRef.current = 0
    elapsedRef.current = 0
    gapElapsedRef.current = 0
  }, [])

  // skip always jumps directly to the next timer (bypasses gap too)
  const skipNext = useCallback(() => {
    if (stateRef.current === 'idle' || stateRef.current === 'done') return
    const nextIndex = indexRef.current + 1
    if (nextIndex >= timersRef.current.length) {
      finishSequence()
    } else {
      playBeep('end')
      goTimer(nextIndex)
    }
  }, [finishSequence, goTimer])

  useEffect(() => () => clearTick(), [])

  const current = timers[currentIndex] ?? null
  const remaining = current ? Math.max(0, current.duration - elapsed) : 0
  const progress = current ? Math.min(1, elapsed / current.duration) : 0
  const gapRemaining = Math.max(0, gapDuration - gapElapsed)
  const gapProgress = gapDuration > 0 ? Math.min(1, gapElapsed / gapDuration) : 0

  return {
    state, phase, currentIndex, elapsed, remaining, progress,
    gapRemaining, gapProgress, current,
    play, pause, resume, stop, skipNext,
  }
}
