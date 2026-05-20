'use client'
import { Sequence } from '../types'

interface Props {
  sequences: Sequence[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}

export function SequenceSidebar({ sequences, activeId, onSelect, onCreate, onDuplicate, onDelete, onRename }: Props) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold text-cyan-400 tracking-wide">Multi Timer</h1>
        <p className="text-xs text-slate-500 mt-0.5">Séquences</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sequences.map(seq => (
          <div
            key={seq.id}
            onClick={() => onSelect(seq.id)}
            className={`group flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              seq.id === activeId
                ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <input
              className="flex-1 min-w-0 bg-transparent text-sm outline-none cursor-pointer focus:cursor-text truncate"
              value={seq.name}
              onClick={e => e.stopPropagation()}
              onChange={e => onRename(seq.id, e.target.value)}
            />
            <button
              onClick={e => { e.stopPropagation(); onDuplicate(seq.id) }}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition-opacity text-xs px-0.5"
              title="Dupliquer"
            >⧉</button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(seq.id) }}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity text-xs px-0.5"
              title="Supprimer"
            >✕</button>
          </div>
        ))}
        {sequences.length === 0 && (
          <p className="text-slate-600 text-xs text-center py-6">Aucune séquence</p>
        )}
      </div>

      <div className="p-3 border-t border-slate-700">
        <button
          onClick={onCreate}
          className="w-full py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-sm font-medium transition-colors"
        >
          + Nouvelle séquence
        </button>
      </div>
    </aside>
  )
}
