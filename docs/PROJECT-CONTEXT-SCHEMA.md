# Project context schema

This document defines the canonical `ProjectContext` object passed from the Workforce UI (project switcher + bootstrap data) to the `/api/route` serverless handler on every dispatch.

## Shape

| Field | Type | Description |
| --- | --- | --- |
| `projectId` | string | Stable identifier used for storage keys and lookup (e.g. `skedaddle`). Must be non-blank. |
| `projectName` | string | Human-readable label shown in the UI and injected into the dispatcher system prompt (e.g. `Skedaddle Portal`). |
| `stackSummary` | string | One to two sentences: domain, stack, deploy/runtime constraints the model should respect when routing. |
| `rules` | `string[]` | Flat list of invariants. **Each array element is one rule line** and must appear **verbatim** in the system prompt under the project rules section (no splitting or paraphrasing on the server). |
| `teamBlueprint` | `WorkerEntry[]` | Workforce roster for the project. Each entry supplies a `rosterLine` rendered as a single bullet under “WORKFORCE ROSTER (with token costs)”. |

### `WorkerEntry`

```ts
type WorkerEntry = {
  rosterLine: string
}
```

`rosterLine` is the full text after the leading `- ` in the roster (worker name, token economics, responsibilities), matching the style of `docs/TEAM-BLUEPRINT.md`.

## Contract

1. The UI must send `projectContext` on every `POST /api/route` request alongside `task`, optional `sessionNotes`, and optional `modelHint`.
2. The API validates `projectContext.projectId` and rejects requests when it is missing or blank.
3. Session handoff persistence uses `dispatcher:{projectId}:handoff` (see `src/lib/storage.ts`) — `projectId` must remain stable for the life of that project.
4. Adding a new project: extend the project registry in `src/lib/projectContext.ts` (and keep `docs/TEAM-BLUEPRINT.md` / `MODEL-REGISTRY.md` aligned with operational reality).

## Related docs

- [`SESSION-HANDOFF-SCHEMA.md`](./SESSION-HANDOFF-SCHEMA.md) — local handoff fields stored per `projectId`.
- [`TEAM-BLUEPRINT.md`](./TEAM-BLUEPRINT.md) — narrative roster; typed `teamBlueprint` in code should stay in lockstep.
