'use client'
import { useSequences } from './hooks/useSequences'
import { useOrientation } from './hooks/useOrientation'
import { LandscapeLayout } from './components/LandscapeLayout'
import { PortraitLayout } from './components/PortraitLayout'

export default function Home() {
  const {
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
    importSequences,
  } = useSequences()

  const orientation = useOrientation()

  const layoutProps = {
    sequences,
    active,
    activeId,
    onSelect: setActiveId,
    onCreate: createSequence,
    onDuplicate: duplicateSequence,
    onDelete: deleteSequence,
    onRename: renameSequence,
    onAddTimer: () => active && addTimer(active.id),
    onUpdateTimer: (timerId: string, patch: Parameters<typeof updateTimer>[2]) =>
      active && updateTimer(active.id, timerId, patch),
    onDuplicateTimer: (timerId: string) => active && duplicateTimer(active.id, timerId),
    onDeleteTimer: (timerId: string) => active && deleteTimer(active.id, timerId),
    onMoveTimer: (from: number, to: number) => active && moveTimer(active.id, from, to),
    onUpdateSettings: (patch: Parameters<typeof updateSequenceSettings>[1]) =>
      active && updateSequenceSettings(active.id, patch),
    onImport: importSequences,
  }

  return orientation === 'portrait'
    ? <PortraitLayout {...layoutProps} />
    : <LandscapeLayout {...layoutProps} />
}
