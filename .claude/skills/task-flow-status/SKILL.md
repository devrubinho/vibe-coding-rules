---
name: task-flow-status
description: Shows RBIN Task Flow progress from tasks.status.md. Use when the user says task-flow status, show task status, status das tasks, or ver progresso das tarefas.
disable-model-invocation: false
---

# Task Flow — Status

1. Read `.task-flow/tasks.status.md`.
2. Display summary (✅ completed, ⏳ in progress, 🖐️ manual, 📝 remaining) and task/subtask checkboxes (`[x]` `[ ]` `[~]`).
3. Call out any `🤖 AI N available` tags — those tasks are unblocked right now and can be handed to separate parallel streams (`/task-flow-run-split`).
4. If file missing, suggest `/task-flow-sync`.

Reference: `.cursor/rules/task_status.mdc`
