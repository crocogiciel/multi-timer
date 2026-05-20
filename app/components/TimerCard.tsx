'use client'
import { useState, useEffect } from 'react'
import { TimerBlock } from '../types'

interface Props {
  timer: TimerBlock
  index: number
  total: number
  isActive?: boolean
  onUpdate: (patch: Partial<TimerBlock>) => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function DurationInput({ duration, onChange }: { duration: number; onChange: (s: number) => void }) {
  const [minStr, setMinStr] = useState(String(Math.floor(duration / 60)))
  const [secStr, setSecStr] = useState(String(duration % 60).padStart(2, '0'))

  // sync if duration changes externally (e.g. duplicate)
  useEffect(() => {
    setMinStr(String(Math.floor(duration / 60)))
    setSecStr(String(duration % 60).padStart(2, '0'))
  }, [duration])

  const commit = (m: string, s: string) => {
    const mins = Math.max(0, parseInt(m) || 0)
    const secs = Math.min(59, Math.max(0, parseInt(s) || 0))
    onChange(Math.max(1, mins * 60 + secs))
  }

  const inputClass = "w-10 text-center bg-slate-700 text-cyan-300 text-sm rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-cyan-600"

  return (
    <div className="flex items-center gap-1 font-mono">
      <input
        type="text"
        inputMode="numeric"
        value={minStr}
        onChange={e => setMinStr(e.target.value.replace(/\D/g, ''))}
        onFocus={e => e.target.select()}
        onBlur={() => {
          const mins = Math.max(0, parseInt(minStr) || 0)
          setMinStr(String(mins))
          commit(String(mins), secStr)
        }}
        onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className={inputClass}
        title="Minutes"
      />
      <span className="text-slate-400 select-none">:</span>
      <input
        type="text"
        inputMode="numeric"
        value={secStr}
        onChange={e => setSecStr(e.target.value.replace(/\D/g, ''))}
        onFocus={e => e.target.select()}
        onBlur={() => {
          const secs = Math.min(59, Math.max(0, parseInt(secStr) || 0))
          setSecStr(String(secs).padStart(2, '0'))
          commit(minStr, String(secs))
        }}
        onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className={inputClass}
        title="Secondes"
      />
    </div>
  )
}

export function TimerCard({ timer, index, total, isActive, onUpdate, onDelete, onDuplicate, onMoveUp, onMoveDown }: Props) {
  return (
    <div className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
      isActive
        ? 'border-cyan-500 bg-cyan-900/20 shadow-lg shadow-cyan-900/30'
        : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
    }`}>
      {/* Reorder */}
      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="text-slate-600 hover:text-slate-300 disabled:opacity-20 text-xs leading-none"
        >▲</button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="text-slate-600 hover:text-slate-300 disabled:opacity-20 text-xs leading-none"
        >▼</button>
      </div>

      {/* Index badge */}
      <div className="shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400 font-mono">
        {index + 1}
      </div>

      {/* Name */}
      <input
        className="flex-1 min-w-0 bg-transparent text-white text-sm font-medium outline-none border-b border-transparent focus:border-cyan-600 transition-colors truncate"
        value={timer.name}
        onChange={e => onUpdate({ name: e.target.value })}
        placeholder="Nom"
      />

      {/* Duration */}
      <DurationInput
        duration={timer.duration}
        onChange={d => onUpdate({ duration: Math.max(1, d) })}
      />

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onDuplicate}
          className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white text-xs flex items-center justify-center"
          title="Dupliquer"
        >⧉</button>
        <button
          onClick={onDelete}
          className="w-6 h-6 rounded bg-slate-700 hover:bg-red-900 text-slate-400 hover:text-red-300 text-xs flex items-center justify-center"
          title="Supprimer"
        >✕</button>
      </div>
    </div>
  )
}
