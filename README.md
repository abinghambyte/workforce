# Workforce

Standalone **AI Task Dispatcher** for routing work to a named AI workforce. Extracted from the Skedaddle Portal: no Firebase, Anthropic calls only through a Vercel serverless proxy (`/api/route`), API key never exposed to the client.

## Stack

- Vite 7, React 19, TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Vercel Serverless (Node.js 22) — [`api/route.ts`](api/route.ts)

## Local development

1. `npm install`
2. Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`.
3. Run the app **with Vercel** so `/api/route` is available:

```bash
npx vercel dev
```

Plain `npm run dev` (Vite only) serves the UI but **will not** run the API route.

## Deploy

Connect this repository to Vercel. Pushes to the production branch trigger automatic builds.

Set **Environment Variables** in the Vercel project (Production and Preview):

- `ANTHROPIC_API_KEY` — required for routing.

## Adding a new project

1. Edit [`src/lib/projectContext.ts`](src/lib/projectContext.ts): add roster lines, rules, and stack summary; register the project in the `PROJECTS` map.
2. Update [`docs/PROJECT-CONTEXT-SCHEMA.md`](docs/PROJECT-CONTEXT-SCHEMA.md) if the contract changes.
3. Optionally extend [`src/components/ProjectSwitcher.tsx`](src/components/ProjectSwitcher.tsx) behavior when multiple projects exist (data is already list-driven).

## Model registry and team blueprint

Authoritative references (copied from the portal repo):

- [`docs/MODEL-REGISTRY.md`](docs/MODEL-REGISTRY.md)
- [`docs/TEAM-BLUEPRINT.md`](docs/TEAM-BLUEPRINT.md)

When you add or rename a worker, update the markdown **and** the typed `teamBlueprint` in `projectContext.ts` so the dispatcher system prompt stays accurate.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server (UI only) |
| `npm run build` | Typecheck + production bundle |
| `npm run lint` | ESLint |
| `npm run preview` | Preview the production build |

## Agent notes

See [`AGENTS.md`](AGENTS.md) for repository rules for coding agents.
