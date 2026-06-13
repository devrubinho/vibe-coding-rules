---
name: task-flow-split
description: Plans N parallel IA streams from pending tasks (split:N required). Non-conflicting areas, ordered by difficulty, outputs task-flow run X,Y,Z per tier. Use for task-flow split:3, split:2, dividir em 3 ias — not plain split.
disable-model-invocation: false
paths: [".task-flow/**"]
---

# Task Flow — Split

## Status

!`head -20 .task-flow/tasks.status.md 2>/dev/null || echo "Run sync first"`

## Steps

1. Parse **`split:N`** — N required (e.g. `split:3`). Plain `split` without `:N` → ask user. Optional scope: `split:3 50-72` or `split:2 50,51`.
2. Load pending IDs from `status.json`; read `tasks.json` for those tasks.
3. Partition into **N** non-conflicting streams; keep dependency chains together.
4. Order streams IA-1 (strongest) → IA-N by difficulty.
5. Output **N lines:** `task-flow: run id,id,id` + coordination notes.
6. **Do not** implement or update status.

Reference: `.cursor/rules/task_split.mdc`
