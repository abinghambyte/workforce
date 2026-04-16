import { handoffKey } from '@/lib/storage'

type Props = {
  projectId: string
  decided: string
  completed: string
  outstanding: string
  nextBrief: string
  onDecided: (v: string) => void
  onCompleted: (v: string) => void
  onOutstanding: (v: string) => void
  onNextBrief: (v: string) => void
  onClear: () => void
}

export function HandoffSection({
  projectId,
  decided,
  completed,
  outstanding,
  nextBrief,
  onDecided,
  onCompleted,
  onOutstanding,
  onNextBrief,
  onClear,
}: Props) {
  const key = handoffKey(projectId)

  return (
    <section className="mt-10 rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-zinc-200">Session handoff</h2>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
        >
          Clear Handoff
        </button>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        Persists locally (<span className="font-mono text-zinc-400">{key}</span>). See docs/SESSION-HANDOFF-SCHEMA.md.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          DECIDED
          <textarea
            value={decided}
            onChange={(e) => onDecided(e.target.value)}
            rows={4}
            className="mt-1 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-600/40"
          />
        </label>
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          COMPLETED
          <textarea
            value={completed}
            onChange={(e) => onCompleted(e.target.value)}
            rows={4}
            className="mt-1 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-600/40"
          />
        </label>
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          OUTSTANDING
          <textarea
            value={outstanding}
            onChange={(e) => onOutstanding(e.target.value)}
            rows={4}
            className="mt-1 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-600/40"
          />
        </label>
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          NEXT SESSION BRIEF
          <textarea
            value={nextBrief}
            onChange={(e) => onNextBrief(e.target.value)}
            rows={4}
            className="mt-1 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-600/40"
          />
        </label>
      </div>
    </section>
  )
}
