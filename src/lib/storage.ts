export type Handoff = {
  decided: string
  completed: string
  outstanding: string
  nextBrief: string
}

const EMPTY: Handoff = {
  decided: '',
  completed: '',
  outstanding: '',
  nextBrief: '',
}

export function handoffKey(projectId: string): string {
  return `dispatcher:${projectId}:handoff`
}

export function readHandoff(projectId: string): Handoff {
  if (typeof window === 'undefined' || !projectId) return { ...EMPTY }
  try {
    const raw = window.localStorage.getItem(handoffKey(projectId))
    if (!raw) return { ...EMPTY }
    const o = JSON.parse(raw) as Record<string, unknown>
    return {
      decided: typeof o?.decided === 'string' ? o.decided : '',
      completed: typeof o?.completed === 'string' ? o.completed : '',
      outstanding: typeof o?.outstanding === 'string' ? o.outstanding : '',
      nextBrief: typeof o?.nextBrief === 'string' ? o.nextBrief : '',
    }
  } catch {
    return { ...EMPTY }
  }
}

export function writeHandoff(projectId: string, h: Handoff): void {
  if (typeof window === 'undefined' || !projectId) return
  try {
    window.localStorage.setItem(handoffKey(projectId), JSON.stringify(h))
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearHandoff(projectId: string): void {
  if (typeof window === 'undefined' || !projectId) return
  try {
    window.localStorage.removeItem(handoffKey(projectId))
  } catch {
    /* ignore */
  }
}
