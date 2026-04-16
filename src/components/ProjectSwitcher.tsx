type ProjectOption = { projectId: string; projectName: string }

type Props = {
  projects: ProjectOption[]
  activeProjectId: string
  onProjectChange: (projectId: string) => void
}

export function ProjectSwitcher({ projects, activeProjectId, onProjectChange }: Props) {
  const active = projects.find((p) => p.projectId === activeProjectId) ?? projects[0]
  const single = projects.length <= 1

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800/90 bg-zinc-950/60 px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Project</span>
        <div className="relative min-w-[12rem] max-w-md flex-1">
          <select
            aria-label="Active project"
            disabled={single}
            value={activeProjectId}
            onChange={(e) => onProjectChange(e.target.value)}
            className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-900/90 py-2 pl-3 pr-9 text-sm font-medium text-zinc-100 outline-none focus:border-amber-600/40 focus:ring-1 focus:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectName}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
            aria-hidden
          >
            ▾
          </span>
        </div>
      </div>
      {active ? (
        <p className="truncate text-xs text-zinc-500 sm:max-w-[50%]">
          Active: <span className="font-medium text-zinc-300">{active.projectName}</span>
          {single ? <span className="ml-2 text-zinc-600">(multi-project soon)</span> : null}
        </p>
      ) : null}
    </div>
  )
}
