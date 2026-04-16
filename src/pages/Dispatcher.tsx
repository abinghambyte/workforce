import { useCallback, useEffect, useMemo, useState } from 'react'
import { DispatcherPanel } from '@/components/DispatcherPanel'
import { HandoffSection } from '@/components/HandoffSection'
import { ProjectSwitcher } from '@/components/ProjectSwitcher'
import { dispatchTask, type DispatchResult } from '@/lib/anthropicClient'
import { defaultProjectId, listProjects, loadProject } from '@/lib/projectContext'
import { clearHandoff, readHandoff, writeHandoff } from '@/lib/storage'

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    window.prompt('Copy:', text)
  }
}

export function DispatcherPage() {
  const projectOptions = useMemo(() => listProjects(), [])
  const [activeProjectId, setActiveProjectId] = useState(defaultProjectId)

  const projectContext = useMemo(() => {
    return loadProject(activeProjectId) ?? loadProject(defaultProjectId())
  }, [activeProjectId])

  const [task, setTask] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [modelHint, setModelHint] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DispatchResult | null>(null)

  const [decided, setDecided] = useState('')
  const [completed, setCompleted] = useState('')
  const [outstanding, setOutstanding] = useState('')
  const [nextBrief, setNextBrief] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const h = readHandoff(activeProjectId)
    setDecided(h.decided)
    setCompleted(h.completed)
    setOutstanding(h.outstanding)
    setNextBrief(h.nextBrief)
  }, [activeProjectId])

  useEffect(() => {
    writeHandoff(activeProjectId, { decided, completed, outstanding, nextBrief })
  }, [activeProjectId, decided, completed, outstanding, nextBrief])

  const runDispatch = useCallback(async () => {
    const ctx = loadProject(activeProjectId) ?? loadProject(defaultProjectId())
    if (!ctx) {
      setError('Project context unavailable.')
      return
    }
    const t = String(task || '').trim()
    if (!t) {
      setError('Describe the task first.')
      return
    }
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const data = await dispatchTask({
        task: t,
        sessionNotes: String(sessionNotes || '').trim(),
        ...(modelHint ? { modelHint } : {}),
        projectContext: ctx,
      })
      setResult(data)
      if (data.error) {
        setError(String(data.error))
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }, [task, sessionNotes, modelHint, activeProjectId])

  const onCopyPrompt = useCallback(async () => {
    const text = String(result?.generatedPrompt || '')
    if (!text) return
    await copyText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }, [result])

  const handleClearHandoff = useCallback(() => {
    if (!window.confirm('Clear all four handoff fields?')) return
    setDecided('')
    setCompleted('')
    setOutstanding('')
    setNextBrief('')
    clearHandoff(activeProjectId)
  }, [activeProjectId])

  if (!projectContext) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-red-300 sm:px-6">
        <p className="text-sm">No project configuration found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 text-zinc-100 sm:px-6 sm:py-8">
      <header className="border-b border-zinc-800/80 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl max-sm:text-xl">
          AI Task Dispatcher
        </h1>
        <p className="mt-1.5 text-sm font-normal leading-relaxed text-zinc-400 max-sm:text-[13px]">
          Route work to the named workforce — reads MODEL-REGISTRY and TEAM-BLUEPRINT on each run.
        </p>
      </header>

      <ProjectSwitcher
        projects={projectOptions}
        activeProjectId={activeProjectId}
        onProjectChange={setActiveProjectId}
      />

      <DispatcherPanel
        task={task}
        sessionNotes={sessionNotes}
        modelHint={modelHint}
        onTaskChange={setTask}
        onSessionNotesChange={setSessionNotes}
        onModelHintChange={setModelHint}
        busy={busy}
        error={error}
        result={result}
        onRunDispatch={runDispatch}
        copied={copied}
        onCopyPrompt={onCopyPrompt}
      />

      <HandoffSection
        projectId={activeProjectId}
        decided={decided}
        completed={completed}
        outstanding={outstanding}
        nextBrief={nextBrief}
        onDecided={setDecided}
        onCompleted={setCompleted}
        onOutstanding={setOutstanding}
        onNextBrief={setNextBrief}
        onClear={handleClearHandoff}
      />
    </div>
  )
}
