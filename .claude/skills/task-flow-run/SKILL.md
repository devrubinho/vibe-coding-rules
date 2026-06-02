---
name: task-flow-run
description: Executes RBIN Task Flow subtasks from tasks.json and status.json. Use when the user says task-flow run, run next X subtasks, work on task N, execute pending subtasks, implement task flow, or trabalhar nas próximas subtarefas.
disable-model-invocation: true
paths: [".task-flow/**"]
---

# Task Flow — Run

## Status

!`head -40 .task-flow/tasks.status.md 2>/dev/null || echo "No tasks.status.md yet — run /task-flow-sync first"`

## Steps

1. Read `status.json` first; list **pending** task/subtask IDs only.
2. **tasks.json (token discipline):** Count subtasks across all tasks. If **>50**, do **not** load the full file — read only the JSON slice for each active task id (pending subtasks you will run). If ≤50, full read is OK.
3. Parse intent: `run next X` (default X=1) | `run X` | `run X,Y` | `run all`.
4. **`run X` / `run X,Y`:** If any task before X has pending subtasks, **stop** and list blocking tasks.
5. For each subtask: follow `instructions`; read `.task-flow/contexts/` files when referenced.
6. If `graphify-out/graph.json` exists, prefer `graphify query "<module from subtask>"` before broad grep (summarized output only — see GRAPHIFY.md).
7. After each subtask: update `status.json` and `tasks.status.md` (regenerate 📊 Summary).
8. When parent task complete: mark task `done` in both files.
9. Invoke `/rbin-git` logic to **suggest** commit only — never `git add`/`commit`/`push`.

## Full workflow

See [workflow.md](workflow.md).
