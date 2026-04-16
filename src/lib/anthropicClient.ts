import type { ProjectContext } from './projectContext'

export type DispatchPayload = {
  task: string
  sessionNotes?: string
  modelHint?: string
  projectContext: ProjectContext
}

export type DispatchResult = Record<string, unknown> & {
  error?: string
  raw?: string
  assignedWorker?: string
  modelVersion?: string
  platform?: string
  rationale?: string
  costCheckResult?: string
  costCheckNote?: string
  contextToLoad?: unknown
  generatedPrompt?: string
}

export async function dispatchTask(payload: DispatchPayload): Promise<DispatchResult> {
  const res = await fetch('/api/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    return { error: 'Invalid response from server', raw: text.slice(0, 4000) }
  }

  const obj = data && typeof data === 'object' ? (data as DispatchResult) : {}

  if (!res.ok) {
    const err =
      typeof obj.error === 'string'
        ? obj.error
        : `Request failed (${res.status})`
    return { ...obj, error: err }
  }

  return obj
}
