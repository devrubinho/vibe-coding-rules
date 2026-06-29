---
name: task-flow-split
description: Splits pending RBIN Task Flow work into N non-conflicting streams (split:N required). On Claude, dispatches them in parallel via task-runner subagents; can also just plan copy-paste run lines. Use for task-flow split:3, split:2, dividir em 3 ias — not plain split.
disable-model-invocation: false
paths: [".task-flow/**"]
---

# Task Flow — Split

## Status

!`head -20 .task-flow/tasks.status.md 2>/dev/null || echo "Run sync first"`

## Modes

- **Dispatch (default on Claude):** run the N streams now, in parallel, via `task-runner` subagents.
- **Plan (copy-paste):** if the user wants to run elsewhere / on other machines / in other tools, output N `task-flow: run …` lines instead (Cursor/Codex always use this — see `.cursor/rules/task_split.mdc`).

Pick Dispatch unless the user asks to "just plan" / "give me the lines" / "split for N machines".

## Steps

1. Parse **`split:N`** — N required (e.g. `split:3`). Plain `split` without `:N` → ask the user. Optional scope: `split:3 50-72` or `split:2 50,51`.
2. `rbin-task-flow validate --schema` for a clean baseline; load pending IDs from `status.json`; read `tasks.json` for those tasks.
3. Partition into **N file-disjoint** streams; keep dependency chains together. If `.task-flow/guides/graphify-out/graph.json` exists, use `graphify query` to confirm module/file boundaries.
4. Order streams IA-1 (strongest) → IA-N by difficulty.
5. **Dispatch mode:** spawn one `task-runner` per file-disjoint stream **in parallel** (one message, multiple Task calls), each given only its ids and told to implement + verify and **report** outcomes — not to write `status.json`/`tasks.status.md`. Serialize any streams that share files.
6. **Apply centrally:** after all runners return, you (the orchestrator) update `status.json` from their reports sequentially, run `rbin-task-flow validate --schema`, then `rbin-task-flow render-status` once.
7. Report aggregated done / manual / blocked; suggest a commit via `/rbin-git`.

**Plan mode:** do steps 1–4, then output N lines `task-flow: run id,id,id` + coordination notes. Do not implement or update status.

Full protocol (concurrency safety): [workflow.md](workflow.md). Cursor/Codex: `.cursor/rules/task_split.mdc`.
