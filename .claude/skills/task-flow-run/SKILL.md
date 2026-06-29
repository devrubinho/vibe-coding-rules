---
name: task-flow-run
description: Executes RBIN Task Flow subtasks from tasks.json and status.json. Use when the user says task-flow run, run next X subtasks, work on task N, execute pending subtasks, implement task flow, or trabalhar nas próximas subtarefas.
disable-model-invocation: false
paths: [".task-flow/**"]
---

# Task Flow — Run

## Status

!`head -40 .task-flow/tasks.status.md 2>/dev/null || echo "No tasks.status.md yet — run /task-flow-sync first"`

## Steps

1. Read `status.json`; resolve **`manual`** subtasks first via dev-logs + current conversation (see workflow).
2. List **pending** task/subtask IDs (`done`, `manual` until resolved).
3. **tasks.json:** partial read by task id if **>50** subtasks total.
4. Parse intent: `run next X` (default X=1) | `run X` | `run X,Y` | `run all`.
5. **`run X` / `run X,Y`:** Stop if earlier tasks/subtasks are not `done`.
6. Per subtask: `instructions` + `contexts/`; optional `graphify query`.
7. **Automatable** → `done` in `status.json`; run `rbin-task-flow render-status` to refresh `tasks.status.md`.
8. **Manual intervention** → `manual` + `.task-flow/dev-logs/task-X.Y-manual.md`; user reports progress **in chat**; AI appends **Conversation log** and marks `done` only when verified complete.
9. Parent task all `done` → mark task `done`.
10. Suggest commit via `/rbin-git` — never git write.

## Never during run

- Mark `done` when manual steps remain unverified
- Write `guides/reports/task-*-implementation.md`

## Full workflow

See [workflow.md](workflow.md).
