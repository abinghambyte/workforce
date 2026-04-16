import { useMemo } from 'react'
import type { DispatchResult } from '@/lib/anthropicClient'

const MODEL_HINTS = [
  { value: '', label: 'Let dispatcher decide' },
  { value: 'Portal Architect', label: 'Portal Architect' },
  { value: 'Listing Advisor', label: 'Listing Advisor' },
  { value: 'Market Intel', label: 'Market Intel' },
  { value: 'Site Verifier', label: 'Site Verifier' },
  { value: 'Infrastructure Lead', label: 'Infrastructure Lead' },
  { value: 'Field Executor', label: 'Field Executor' },
] as const

function costCheckBadgeClass(result: string): string {
  const r = String(result || '').toLowerCase().trim()
  if (r === 'passed') return 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/35'
  if (r === 'escalated') return 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/35'
  if (r === 'not applicable' || r === 'not_applicable') return 'bg-zinc-700/50 text-zinc-400 ring-1 ring-zinc-600/40'
  return 'bg-zinc-800 text-zinc-400 ring-1 ring-zinc-600/50'
}

function RoutingSkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
      <div className="h-4 w-[66%] rounded bg-zinc-700/80" />
      <div className="h-3 w-full rounded bg-zinc-800/80" />
      <div className="h-3 w-5/6 rounded bg-zinc-800/80" />
      <div className="h-6 w-24 rounded-full bg-zinc-800/80" />
    </div>
  )
}

type Props = {
  task: string
  sessionNotes: string
  modelHint: string
  onTaskChange: (v: string) => void
  onSessionNotesChange: (v: string) => void
  onModelHintChange: (v: string) => void
  busy: boolean
  error: string
  result: DispatchResult | null
  onRunDispatch: () => void
  copied: boolean
  onCopyPrompt: () => void
}

export function DispatcherPanel({
  task,
  sessionNotes,
  modelHint,
  onTaskChange,
  onSessionNotesChange,
  onModelHintChange,
  busy,
  error,
  result,
  onRunDispatch,
  copied,
  onCopyPrompt,
}: Props) {
  const costLabel = useMemo(() => {
    const r = result?.costCheckResult
    return typeof r === 'string' ? r : '—'
  }, [result])

  const ctxList = Array.isArray(result?.contextToLoad)
    ? (result?.contextToLoad as unknown[]).map((x) => String(x))
    : []

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-5 shadow-inner shadow-black/20 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-200">Task</h2>
        <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Description
        </label>
        <textarea
          value={task}
          onChange={(e) => onTaskChange(e.target.value)}
          rows={5}
          placeholder="Describe the task..."
          className="mt-1 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-600/40 focus:ring-1 focus:ring-amber-500/30"
        />
        <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Session notes
        </label>
        <textarea
          value={sessionNotes}
          onChange={(e) => onSessionNotesChange(e.target.value)}
          rows={3}
          placeholder="Paste previous session handoff here..."
          className="mt-1 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-600/40 focus:ring-1 focus:ring-amber-500/30"
        />
        <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Model hint (optional)
        </label>
        <select
          value={modelHint}
          onChange={(e) => onModelHintChange(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-600/40 focus:ring-1 focus:ring-amber-500/30"
        >
          {MODEL_HINTS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onRunDispatch()}
          className="mt-4 w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {busy ? 'Routing…' : 'Route Task'}
        </button>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      </div>

      <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-5 shadow-inner shadow-black/20 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-200">Routing result</h2>
        {busy ? (
          <div className="mt-4">
            <RoutingSkeleton />
          </div>
        ) : result?.error ? (
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-red-300">{String(result.error)}</p>
            {result.raw ? (
              <pre className="max-h-40 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/90 p-3 font-mono text-xs text-zinc-400">
                {String(result.raw).slice(0, 4000)}
              </pre>
            ) : null}
          </div>
        ) : result && typeof result.assignedWorker === 'string' ? (
          <div className="mt-4 space-y-3 text-sm">
            <p>
              <span className="text-zinc-500">Assigned worker</span>{' '}
              <span className="font-medium text-zinc-100">{String(result.assignedWorker || '—')}</span>
            </p>
            <p>
              <span className="text-zinc-500">Model</span>{' '}
              <span className="font-mono text-xs text-zinc-300">{String(result.modelVersion || '—')}</span>
            </p>
            <p>
              <span className="text-zinc-500">Platform</span>{' '}
              <span className="text-zinc-200">{String(result.platform || '—')}</span>
            </p>
            <p>
              <span className="text-zinc-500">Rationale</span>
              <br />
              <span className="text-zinc-300">{String(result.rationale || '—')}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-zinc-500">Cost check</span>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${costCheckBadgeClass(costLabel)}`}
              >
                {costLabel}
              </span>
            </div>
            <p className="text-zinc-400">
              <span className="text-zinc-500">Note</span> — {String(result.costCheckNote || '—')}
            </p>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Context to load</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-300">
                {ctxList.length ? (
                  ctxList.map((x, i) => (
                    <li key={i} className="[overflow-wrap:anywhere]">
                      {x}
                    </li>
                  ))
                ) : (
                  <li className="text-zinc-500">—</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">Submit a task to see routing output.</p>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-5 shadow-inner shadow-black/20 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">Generated prompt</h2>
          <button
            type="button"
            disabled={!result?.generatedPrompt}
            onClick={() => void onCopyPrompt()}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-medium text-amber-200/90 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
        <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-950/90 p-4 font-mono text-xs leading-relaxed text-zinc-200">
          {String(result?.generatedPrompt || '—')}
        </pre>
      </div>
    </div>
  )
}
