import type { VercelRequest, VercelResponse } from '@vercel/node'

// TODO: when multi-user ships, gate on a Vercel-issued session token here.

const MODEL = 'claude-sonnet-4-6'

type WorkerEntry = { rosterLine: string }

type ProjectContextIn = {
  projectId: string
  projectName: string
  stackSummary: string
  rules: string[]
  teamBlueprint: WorkerEntry[]
}

function stripJsonFences(text: string): string {
  const s = String(text || '').trim()
  const full = /^```(?:json)?\s*([\s\S]*?)```\s*$/im.exec(s)
  if (full) return full[1].trim()
  const inner = /```(?:json)?\s*([\s\S]*?)```/im.exec(s)
  if (inner) return inner[1].trim()
  return s.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
}

function rosterBlock(teamBlueprint: WorkerEntry[]): string {
  const lines = teamBlueprint
    .map((w) => (typeof w?.rosterLine === 'string' ? w.rosterLine.trim() : ''))
    .filter(Boolean)
  return lines.length ? lines.map((l) => `- ${l}`).join('\n') : '- (no roster configured)'
}

function rulesBlock(projectName: string, rules: string[]): string {
  const cleaned = rules
    .map((r) => String(r ?? '').trim())
    .filter((r) => r.length > 0)
  const header = `${projectName} RULES (never get these wrong):`
  if (!cleaned.length) return `${header}\n- (none configured)`
  return `${header}\n${cleaned.map((r) => `- ${r}`).join('\n')}`
}

function buildSystemPrompt(ctx: ProjectContextIn): string {
  const roster = rosterBlock(ctx.teamBlueprint)
  const rules = rulesBlock(ctx.projectName, ctx.rules)

  return `You are the AI Task Dispatcher for ${ctx.projectName}. You manage a named AI workforce. Your job is to evaluate an incoming task, run the cost-check protocol, and route it to the correct worker.

PROJECT CONTEXT:
- Stack / domain summary: ${ctx.stackSummary}

WORKFORCE ROSTER (with token costs):
${roster}

COST-CHECK PROTOCOL (execute before every routing decision):
1. Before routing to Opus ($15/input): Confirm Sonnet ($3/input) cannot handle this even with a full context load. Sonnet's 1M token window fits the entire project repo plus all docs. If Sonnet with maximum context load would solve this → route to Portal Architect.
2. Before routing to Antigravity (high cost): Confirm this genuinely requires autonomous browser verification against the live site. If human QA is acceptable → route to Field Executor (Cursor).
3. Real-time web or market data needed? → Market Intel (Gemini Pro)
4. High-volume listing output? → Listing Advisor (Gemini Flash-Lite)
5. Fast one-sentence output, Slack copy? → Listing Advisor Fallback (Haiku)
6. All file writes go to Field Executor regardless of who designed the solution

${rules}

GENERATED PROMPT FORMAT — depends on the assigned worker:

- For Field Executor (Cursor), Portal Architect (Sonnet), Infrastructure Lead (Opus), Market Intel (Gemini Pro), Listing Advisor (Gemini Flash-Lite), or Listing Advisor Fallback (Haiku): write the generatedPrompt as freeform prose preloaded with ${ctx.projectName} domain context from PROJECT RULES above (e.g. paymentAmount, FET, Rubber CRM, Tanner-as-silent-partner, deploy commands) where applicable.

- For Site Verifier (Antigravity): generatedPrompt MUST follow this exact section structure — Antigravity is autonomous and tightens compliance with rigid format. Do not mix freeform prose between sections.

## Goal
[One sentence — what state of the live system this brief is supposed to verify or produce.]

## Verification steps
1. [Concrete navigable action against the live URL — open page, click element, submit form, etc.]
2. [Next step — observe specific element, value, or response.]
3. [Continue until the goal is testable.]

## Success criteria
- [Binary, observable condition #1.]
- [Binary condition #2.]
- [Binary condition #3.]
A run is "passed" only when every criterion is satisfied. No partial passes.

## What NOT to touch
- [Specific routes, functions, or data the agent must not modify or write to.]
- Always include: "/orders, Slack integration, Firestore rules, slackSecrets.js, any function not named in this brief".
- If a step requires modifying anything on this list, stop and report — do not proceed.

Respond ONLY with valid JSON — no preamble, no markdown fences:
{
  "assignedWorker": "Portal Architect",
  "modelVersion": "claude-sonnet-4-6",
  "platform": "Claude.ai",
  "rationale": "one sentence why this worker owns this task",
  "costCheckResult": "passed | escalated | not applicable",
  "costCheckNote": "one sentence explaining the cost-check decision",
  "contextToLoad": ["AI-CONTEXT.md", "ROADMAP.md"],
  "generatedPrompt": "the full ready-to-paste prompt for that worker — freeform prose for most workers, the Antigravity Goal/Verification steps/Success criteria/What NOT to touch structure for Site Verifier"
}`
}

function parseBody(body: unknown): Record<string, unknown> | null {
  if (body && typeof body === 'object' && !Array.isArray(body)) return body as Record<string, unknown>
  if (typeof body === 'string') {
    try {
      const o = JSON.parse(body) as unknown
      return o && typeof o === 'object' && !Array.isArray(o) ? (o as Record<string, unknown>) : null
    } catch {
      return null
    }
  }
  return null
}

function readProjectContext(body: Record<string, unknown>): ProjectContextIn | { error: string; status: number } {
  const raw = body.projectContext
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { error: 'projectContext is required', status: 400 }
  }
  const pc = raw as Record<string, unknown>
  const projectId = String(pc.projectId ?? '').trim()
  const projectName = String(pc.projectName ?? '').trim()
  const stackSummary = String(pc.stackSummary ?? '').trim()
  if (!projectId) {
    return { error: 'projectContext.projectId is required', status: 400 }
  }
  if (!projectName) {
    return { error: 'projectContext.projectName is required', status: 400 }
  }

  const rulesRaw = pc.rules
  const rules = Array.isArray(rulesRaw)
    ? rulesRaw.map((r) => String(r ?? '').trim()).filter((r) => r.length > 0)
    : []

  const bpRaw = pc.teamBlueprint
  const teamBlueprint: WorkerEntry[] = Array.isArray(bpRaw)
    ? bpRaw
        .map((row) => {
          if (!row || typeof row !== 'object' || Array.isArray(row)) return null
          const line = String((row as Record<string, unknown>).rosterLine ?? '').trim()
          return line ? { rosterLine: line } : null
        })
        .filter((x): x is WorkerEntry => Boolean(x))
    : []

  return {
    projectId,
    projectName,
    stackSummary: stackSummary || '(not provided)',
    rules,
    teamBlueprint,
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = parseBody(req.body)
  if (!body) {
    res.status(400).json({ error: 'Invalid JSON body' })
    return
  }

  const task = String(body.task ?? '').trim()
  if (!task) {
    res.status(400).json({ error: 'task is required' })
    return
  }

  const sessionNotes =
    body.sessionNotes != null ? String(body.sessionNotes).trim().slice(0, 12000) : ''

  let modelHint = body.modelHint != null ? String(body.modelHint).trim() : ''
  if (!modelHint || modelHint === 'Let dispatcher decide') {
    modelHint = ''
  }

  const pcResult = readProjectContext(body)
  if ('error' in pcResult) {
    res.status(pcResult.status).json({ error: pcResult.error })
    return
  }
  const projectContext = pcResult

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
    return
  }

  const userContent = [
    `TASK: ${task}`,
    sessionNotes ? `SESSION NOTES:\n${sessionNotes}` : null,
    modelHint ? `USER MODEL HINT: ${modelHint}` : null,
  ]
    .filter(Boolean)
    .join('\n\n')

  const system = buildSystemPrompt(projectContext)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      temperature: 0.2,
      system,
      messages: [{ role: 'user', content: userContent }],
    }),
  })

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>
  if (!response.ok) {
    const msg =
      typeof data?.error === 'object' &&
      data.error &&
      'message' in (data.error as object) &&
      typeof (data.error as { message?: string }).message === 'string'
        ? (data.error as { message: string }).message
        : response.statusText || 'Anthropic request failed'
    res.status(502).json({ error: msg })
    return
  }

  const content = data?.content
  const text = Array.isArray(content)
    ? content
        .map((c) => {
          if (c && typeof c === 'object' && 'text' in c && typeof (c as { text?: string }).text === 'string') {
            return (c as { text: string }).text
          }
          return ''
        })
        .join('')
    : ''

  const stripped = stripJsonFences(text)

  try {
    const parsed = JSON.parse(stripped) as unknown
    res.status(200).json(parsed)
  } catch {
    res.status(200).json({ error: 'Routing failed', raw: stripped })
  }
}
