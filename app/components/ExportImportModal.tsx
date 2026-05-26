'use client'
import { useState, useRef, useCallback } from 'react'
import { Sequence } from '../types'

interface Props {
  sequences: Sequence[]
  onImport: (seqs: Sequence[]) => void
  onClose: () => void
}

type Tab = 'export' | 'import'
type ImportState = 'idle' | 'parsed' | 'error'

export function ExportImportModal({ sequences, onImport, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('export')

  // ── Export state ──────────────────────────────────────────────────────────
  const [exportSelected, setExportSelected] = useState<Set<string>>(
    () => new Set(sequences.map(s => s.id))
  )

  const toggleExport = (id: string) =>
    setExportSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleExport = () => {
    const toExport = sequences.filter(s => exportSelected.has(s.id))
    const blob = new Blob(
      [JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), sequences: toExport }, null, 2)],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `multi-timer-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Import state ──────────────────────────────────────────────────────────
  const [importState, setImportState] = useState<ImportState>('idle')
  const [importError, setImportError] = useState('')
  const [importCandidates, setImportCandidates] = useState<Sequence[]>([])
  const [importSelected, setImportSelected] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const raw = JSON.parse(e.target?.result as string)
        const rawSeqs: unknown[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.sequences)
          ? raw.sequences
          : null
        if (!rawSeqs) throw new Error('Format invalide : aucun tableau de séquences trouvé')

        const parsed: Sequence[] = rawSeqs.map((s: any, i) => ({
          id: s.id ?? `imp-${i}`,
          name: s.name ?? `Séquence ${i + 1}`,
          gapDuration: s.gapDuration ?? 0,
          tickLeadTime: s.tickLeadTime ?? 3,
          gapTickLeadTime: s.gapTickLeadTime ?? 3,
          timers: Array.isArray(s.timers)
            ? s.timers.map((t: any, j: number) => ({
                id: t.id ?? `t-${i}-${j}`,
                name: t.name ?? `Timer ${j + 1}`,
                duration: typeof t.duration === 'number' ? t.duration : 60,
              }))
            : [],
        }))

        setImportCandidates(parsed)
        setImportSelected(new Set(parsed.map(s => s.id)))
        setImportState('parsed')
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Erreur de lecture')
        setImportState('error')
      }
    }
    reader.readAsText(file)
  }, [])

  const toggleImport = (id: string) =>
    setImportSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const resetImport = () => {
    setImportState('idle')
    setImportError('')
    setImportCandidates([])
    setImportSelected(new Set())
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImport = () => {
    onImport(importCandidates.filter(s => importSelected.has(s.id)))
    onClose()
  }

  const exportCount = exportSelected.size
  const importCount = importSelected.size

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0">
          <h2 className="text-white font-semibold text-base">Import / Export</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 shrink-0">
          {(['export', 'import'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? 'text-cyan-400 border-b-2 border-cyan-500'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t === 'export' ? '↑ Exporter' : '↓ Importer'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4">

          {/* ── EXPORT ── */}
          {tab === 'export' && (
            <div className="space-y-2">
              {sequences.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-10">Aucun flow à exporter</p>
              ) : (
                <>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-slate-500">
                      {sequences.length} flow{sequences.length > 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-3 text-xs">
                      <button
                        onClick={() => setExportSelected(new Set(sequences.map(s => s.id)))}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                      >Tout</button>
                      <span className="text-slate-700">·</span>
                      <button
                        onClick={() => setExportSelected(new Set())}
                        className="text-slate-400 hover:text-slate-300 transition-colors"
                      >Aucun</button>
                    </div>
                  </div>

                  {sequences.map(seq => (
                    <label
                      key={seq.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={exportSelected.has(seq.id)}
                        onChange={() => toggleExport(seq.id)}
                        className="w-4 h-4 accent-cyan-500 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{seq.name}</p>
                        <p className="text-xs text-slate-500">
                          {seq.timers.length} step{seq.timers.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </label>
                  ))}
                </>
              )}
            </div>
          )}

          {/* ── IMPORT ── */}
          {tab === 'import' && (
            <div className="space-y-3">
              {importState !== 'parsed' ? (
                <>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-cyan-500 bg-cyan-950/30'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => {
                      e.preventDefault(); setIsDragging(false)
                      const file = e.dataTransfer.files[0]
                      if (file) parseFile(file)
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) parseFile(f) }}
                    />
                    <div className="text-4xl mb-3 select-none">📂</div>
                    <p className="text-slate-300 text-sm font-medium">
                      Cliquer ou déposer un fichier JSON
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      Fichier exporté par Multi Timer
                    </p>
                  </div>

                  {importState === 'error' && (
                    <div className="flex items-start gap-2 bg-red-950/40 border border-red-900/50 rounded-xl px-3 py-2.5 text-red-400 text-sm">
                      <span className="shrink-0">⚠</span>
                      <span>{importError}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-slate-500">
                      {importCandidates.length} flow{importCandidates.length > 1 ? 's' : ''} trouvé{importCandidates.length > 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <button
                        onClick={resetImport}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >Changer</button>
                      <span className="text-slate-700">·</span>
                      <button
                        onClick={() => setImportSelected(new Set(importCandidates.map(s => s.id)))}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                      >Tout</button>
                      <span className="text-slate-700">·</span>
                      <button
                        onClick={() => setImportSelected(new Set())}
                        className="text-slate-400 hover:text-slate-300 transition-colors"
                      >Aucun</button>
                    </div>
                  </div>

                  {importCandidates.map(seq => (
                    <label
                      key={seq.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={importSelected.has(seq.id)}
                        onChange={() => toggleImport(seq.id)}
                        className="w-4 h-4 accent-cyan-500 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{seq.name}</p>
                        <p className="text-xs text-slate-500">
                          {seq.timers.length} step{seq.timers.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </label>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700 shrink-0">
          {tab === 'export' ? (
            <button
              onClick={handleExport}
              disabled={exportCount === 0}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {exportCount > 0
                ? `Exporter ${exportCount} flow${exportCount > 1 ? 's' : ''}`
                : 'Sélectionner des flows'}
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={importState !== 'parsed' || importCount === 0}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {importState === 'parsed' && importCount > 0
                ? `Importer ${importCount} flow${importCount > 1 ? 's' : ''}`
                : 'Importer'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
