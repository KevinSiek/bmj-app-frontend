# Discipline Adapter — bmj-app-frontend

> This file declares the capabilities of **this repo** for the Engineering
> Discipline pipeline. The process itself lives in the core discipline file;
> this adapter only supplies facts.

## Repository Facts

| Capability | Value |
| ---------- | ----- |
| `indexed` | no |
| `rulesRef` | `.claude/bmj-rules.json` + `AGENTS.MD` + `docs/*.md` |
| `testCommand` | none (no test harness configured) |
| `buildCommand` | `npm run build` |
| `monorepo` | false |
| `polyglot` | single (JavaScript/Vue) |
| `crossRepoCallers` | none (this is the frontend consumer) |

## Degradation Notes

- **Phase 0 (Understand)**: No graph index — use bounded Grep/Glob/Read on
  task-named symbols. Start with `AGENTS.MD`, then `src/config/index.js`,
  then relevant `docs/*.md`.
- **Phase 5 (Execute)**: No test harness exists. TDD Iron Law degrades to
  VERIFIED-WITH-GAP. If adding tests, bootstrap with Vitest.
- **Phase 8 (Verify)**: No build errors = `npm run build` passes. No test
  suite to run.

## Development

```bash
npm run dev       # Vite dev server
npm run build     # Production build
npm run lint      # ESLint
npm run format    # Prettier
```

## Key Entry Points

1. `AGENTS.MD` — full system overview and orchestration
2. `src/config/index.js` — central config (routes, statuses, roles, APIs)
3. `src/router/index.js` — route tree
4. `docs/` — feature-specific documentation
