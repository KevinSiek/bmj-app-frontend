# BMJ App Frontend Development Guide

## ⛔ Commit Policy — NEVER auto-commit
- **NEVER run `git commit` without explicit user instruction.**
- Always leave changes in staged state and wait for the user to commit.
- This applies to all subagents and all tasks — no exceptions.

## Engineering Discipline (read before ANY coding task)

For every coding task — fix to feature, zero to finish — follow the unified
pipeline. The contract is workspace-portable: the one authority is
**[.claude/ENGINEERING_DISCIPLINE.md](.claude/ENGINEERING_DISCIPLINE.md)**;
this repo's specific facts are in
**[.claude/discipline-adapter.md](.claude/discipline-adapter.md)**.
It fuses Compound Engineering (`ce:*`), Superpowers, and gstack: understand →
brainstorm (HARD-GATE) → plan → worktree → execute (TDD Iron Law) → review +
codex → QA → verify → finish → compound. Two locked constraints: never
auto-commit (ask first), browser/QA via gstack only. Prime directive: code as
a senior expert would — simple, human-readable, no redundancy, reuse first,
maintainable.

## Codebase Orientation (read before changing code)

This file carries the **rules**; the codebase **map** lives next door:

- **[AGENTS.MD](AGENTS.MD)** — the fast orientation doc: what the app is, tech
  stack, structure, architecture patterns, feature index, dev commands. Read it
  first to understand the code. It also restates the rules above (§0) so
  non-Claude tools — Codex, Cursor — inherit the same guardrails.
- **[docs/CODEBASE_GOTCHAS.md](docs/CODEBASE_GOTCHAS.md)** — cross-cutting edge
  cases, latent bugs, orphaned code, and naming traps. Skim before editing.
- **[docs/](docs/)** — per-feature guides (`FEATURE_*.md`), the state/API/component
  references, and the verified e2e handover
  ([docs/tests/LLM_HANDOVER.md](docs/tests/LLM_HANDOVER.md)).

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **bmj-app-frontend** (3287 symbols, 5238 relationships, 53 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "master"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/bmj-app-frontend/context` | Codebase overview, check index freshness |
| `gitnexus://repo/bmj-app-frontend/clusters` | All functional areas |
| `gitnexus://repo/bmj-app-frontend/processes` | All execution flows |
| `gitnexus://repo/bmj-app-frontend/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
