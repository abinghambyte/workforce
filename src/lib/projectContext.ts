/** One workforce role as rendered in the dispatcher system prompt roster. */
export type WorkerEntry = {
  /** Full roster line after the leading "- " (name, token costs, responsibilities). */
  rosterLine: string
}

export type ProjectContext = {
  projectId: string
  projectName: string
  stackSummary: string
  rules: string[]
  teamBlueprint: WorkerEntry[]
}

const SKEDDADDLE_TEAM: WorkerEntry[] = [
  {
    rosterLine:
      'Infrastructure Lead (Opus 4.6 — $15 input / $75 output per 1M): Architecture, schema design, security review, decisions where being wrong costs a redeploy',
  },
  {
    rosterLine:
      'Portal Architect (Sonnet 4.6 — $3 input / $15 output per 1M, 1M token context): Cursor handoff writing, iteration, debugging, session architecture',
  },
  {
    rosterLine:
      'Market Intel (Gemini 3.1 Pro — $2 input / $12 output per 1M): Real-time web, eBay comps, pricing research',
  },
  {
    rosterLine:
      'Listing Advisor (Gemini 3.1 Flash-Lite — $0.25 input / $1.50 output per 1M): High-volume listing generation, sell probability, platform copy',
  },
  {
    rosterLine:
      'Listing Advisor Fallback (Haiku 4.5 — $1 input / $5 output per 1M): When Gemini Flash-Lite is unavailable',
  },
  {
    rosterLine:
      'Site Verifier (Antigravity — high cost): Autonomous end-to-end builds with live site verification, no human in the loop',
  },
  {
    rosterLine:
      'Field Executor (Cursor — subscription): All actual file writes, multi-file repo-aware builds',
  },
]

const SKEDDADDLE_CONTEXT: ProjectContext = {
  projectId: 'skedaddle',
  projectName: 'Skedaddle Portal',
  stackSummary:
    'Northern Colorado tire resale operation. Stack: React 19 + Vite + Tailwind, Firebase Gen2 Node 22, firebase-functions v7.2.5.',
  rules: [
    'profit = (paymentAmount - buyPrice - mountCost - deliveryCost - otherCost) × qty',
    'FET washes out — never subtract in margin calcs',
    'No salePrice field exists — always use paymentAmount',
    'CRM is called Rubber CRM, never Fleet CRM',
    'Tanner = silent partner, no portal access ever',
    'Deploy functions: npm run deploy:firebase — never global firebase binary',
    'Deploy frontend: git push (auto-deploys to Vercel)',
  ],
  teamBlueprint: SKEDDADDLE_TEAM,
}

const PROJECTS: Readonly<Record<string, ProjectContext>> = {
  skedaddle: SKEDDADDLE_CONTEXT,
}

export function listProjects(): Pick<ProjectContext, 'projectId' | 'projectName'>[] {
  return Object.values(PROJECTS).map((p) => ({ projectId: p.projectId, projectName: p.projectName }))
}

export function loadProject(projectId: string): ProjectContext | null {
  const id = String(projectId || '').trim()
  if (!id) return null
  return PROJECTS[id] ?? null
}

export function defaultProjectId(): string {
  return 'skedaddle'
}
