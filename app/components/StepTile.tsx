'use client'
import { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TimerBlock } from '../types'

function DurationInput({
  duration,
  onChange,
  compact = false,
}: {
  duration: number
  onChange: (s: number) => void
  compact?: boolean
}) {
  const [minStr, setMinStr] = useState(String(Math.floor(duration / 60)))
  const [secStr, setSecStr] = useState(String(duration % 60).padStart(2, '0'))

  useEffect(() => {
    setMinStr(String(Math.floor(duration / 60)))
    setSecStr(String(duration % 60).padStart(2, '0'))
  }, [duration])

  const commit = (m: string, s: string) => {
    const mins = Math.max(0, parseInt(m) || 0)
    const secs = Math.min(59, Math.max(0, parseInt(s) || 0))
    onChange(Math.max(1, mins * 60 + secs))
  }

  const inputClass = compact
    ? 'w-9 text-center bg-slate-700 text-cyan-300 font-mono text-sm rounded px-1 py-1 outline-none focus:ring-1 focus:ring-cyan-600 transition-shadow'
    : 'w-12 text-center bg-slate-700 text-cyan-300 font-mono text-xl rounded-lg px-1.5 py-1.5 outline-none focus:ring-1 focus:ring-cyan-600 transition-shadow'

  const sepClass = compact ? 'text-slate-400 text-sm select-none' : 'text-slate-400 text-xl select-none'

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
      <span className={sepClass}>:</span>
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

interface Props {
  timer: TimerBlock
  index: number
  isActive?: boolean
  onUpdate: (patch: Partial<TimerBlock>) => void
  onDelete: () => void
  onDuplicate: () => void
}

function GripHandle(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`flex items-center justify-center text-slate-500 cursor-grab active:cursor-grabbing touch-none select-none shrink-0 ${props.className ?? ''}`}
      aria-label="Déplacer"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <circle cx="4" cy="2.5" r="1.2" />
        <circle cx="10" cy="2.5" r="1.2" />
        <circle cx="4" cy="7" r="1.2" />
        <circle cx="10" cy="7" r="1.2" />
        <circle cx="4" cy="11.5" r="1.2" />
        <circle cx="10" cy="11.5" r="1.2" />
      </svg>
    </div>
  )
}

export function StepTile({
  timer, index, isActive,
  onUpdate, onDelete, onDuplicate,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: timer.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
    zIndex: isDragging ? 50 : undefined,
    touchAction: isDragging ? 'none' : undefined,
  }

  const borderClass = isActive
    ? 'border-cyan-500 bg-cyan-900/20 shadow-lg shadow-cyan-900/30'
    : 'border-slate-700 bg-slate-800/60 hover:border-slate-500'

  const badgeClass = isActive
    ? 'bg-cyan-600/40 text-cyan-300'
    : 'bg-slate-700 text-slate-400'

  return (
    <div ref={setNodeRef} style={style} className={`group rounded-xl border transition-all duration-150 ${borderClass}`}>

      {/* ── MOBILE layout (< sm): compact horizontal row ── */}
      <div className="flex sm:hidden items-center gap-2 px-3 py-2.5">
        {/* Drag handle */}
        <GripHandle {...attributes} {...listeners} className="w-5 h-7" />
        {/* Badge */}
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${badgeClass}`}>
          {index + 1}
        </div>

        {/* Name */}
        <input
          className="flex-1 min-w-0 bg-transparent text-white text-sm font-medium outline-none border-b border-transparent focus:border-cyan-600 transition-colors placeholder:text-slate-600 truncate"
          value={timer.name}
          onChange={e => onUpdate({ name: e.target.value })}
          placeholder="Nom du step"
        />

        {/* Duration compact */}
        <DurationInput
          duration={timer.duration}
          onChange={d => onUpdate({ duration: Math.max(1, d) })}
          compact
        />

        {/* Actions — always visible on mobile */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={onDuplicate}
            className="w-7 h-7 rounded-lg bg-slate-700/60 text-slate-400 active:bg-slate-600 text-xs flex items-center justify-center transition-colors"
            title="Dupliquer">⧉</button>
          <button onClick={onDelete}
            className="w-7 h-7 rounded-lg bg-slate-700/60 text-slate-400 active:text-red-300 active:bg-red-900 text-xs flex items-center justify-center transition-colors"
            title="Supprimer">✕</button>
        </div>
      </div>

      {/* ── DESKTOP layout (≥ sm): tile card ── */}
      <div className="hidden sm:block p-4">
        {/* Top row: drag handle + badge + actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GripHandle {...attributes} {...listeners} className="w-5 h-6 opacity-30 group-hover:opacity-100 transition-opacity" />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 ${badgeClass}`}>
              {index + 1}
            </div>
          </div>
          <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <button onClick={onDuplicate}
              className="w-6 h-6 rounded bg-slate-700/70 hover:bg-slate-600 text-slate-400 hover:text-white text-xs flex items-center justify-center transition-colors" title="Dupliquer">⧉</button>
            <button onClick={onDelete}
              className="w-6 h-6 rounded bg-slate-700/70 hover:bg-red-900 text-slate-400 hover:text-red-300 text-xs flex items-center justify-center transition-colors" title="Supprimer">✕</button>
          </div>
        </div>

        {/* Name */}
        <input
          className="w-full bg-transparent text-white font-semibold text-base outline-none border-b border-transparent focus:border-cyan-600 transition-colors mb-4 placeholder:text-slate-600"
          value={timer.name}
          onChange={e => onUpdate({ name: e.target.value })}
          placeholder="Nom du step"
        />

        {/* Duration large */}
        <div className="flex items-end justify-between">
          <DurationInput
            duration={timer.duration}
            onChange={d => onUpdate({ duration: Math.max(1, d) })}
          />
          <span className="text-xs text-slate-600 pb-1.5">mm : ss</span>
        </div>
      </div>

    </div>
  )
}
