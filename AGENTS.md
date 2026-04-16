# Agent rules — Workforce

Short prescriptive rules for automated coding agents working in this repository.

## Do

- Keep `ANTHROPIC_API_KEY` only in Vercel project settings or local `.env.local` for `vercel dev`. Never commit real secrets.
- Send all Anthropic traffic through **`POST /api/route`** (`api/route.ts`). Do not call `api.anthropic.com` from browser code or add a client-side API key.
- Read and write session handoff state **only** through [`src/lib/storage.ts`](src/lib/storage.ts). Do not call `localStorage` directly from components or pages.
- Treat **project context as data**: `projectId`, `projectName`, `stackSummary`, `rules[]`, and `teamBlueprint[]` come from [`src/lib/projectContext.ts`](src/lib/projectContext.ts) (or a future backend). Do not hardcode project-specific invariant strings into `api/route.ts` except via that context object.
- Run `npm run lint` and `npm run build` before declaring work complete.

## Do not

- Do not add Firebase, Clerk, or any authentication / multi-user system in v1 unless explicitly specified.
- Do not add new serverless routes that embed the Anthropic key with different validation rules — keep a single audited entry point.
- Do not weaken the JSON-only response contract from the dispatcher system prompt without updating the UI types and docs.

## Local API

Use `npx vercel dev` for full-stack local testing. Vite alone does not serve `/api/route`.
