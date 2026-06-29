---
name: task-flow-sync
description: Synchronizes RBIN Task Flow tasks.input.txt with tasks.json, status.json, and tasks.status.md. Use when the user says task-flow sync, sync tasks, sincronizar tasks, or after editing tasks.input.txt.
disable-model-invocation: false
paths: [".task-flow/**"]
---

# Task Flow — Sync

## Steps

1. Read `.task-flow/tasks.input.txt` (only lines starting with `- `).
2. Read `.task-flow/.internal/tasks.json` and `status.json` if they exist.
3. Compare by `originalRequest`: new, removed, modified, unchanged tasks.
4. **New:** generate subtasks (3–8 each), add pending status. Subtask instructions: follow **checklist** in `.cursor/rules/coding_standards.mdc` only — not `.task-flow/guides/coding-standards-full.md`.
5. **Removed:** delete from all three stores.
6. **Modified:** update title/description, regenerate subtasks, **preserve** done/pending status where possible.
7. **Unchanged:** leave task data and status as-is.
8. `status.json` is the source of truth for all status values.
9. Run `rbin-task-flow render-status` to rebuild `tasks.status.md` (checkboxes + 📊 Summary) from `status.json` — do not hand-write it.

## Contexts

- List `.task-flow/contexts/` and match files to tasks by keywords.
- Honor `task-flow-screen filename.ext` → `.task-flow/contexts/filename.ext` in subtask instructions.

## Full workflow

See [workflow.md](workflow.md). Primary rule: `.cursor/rules/task-flow-sync.mdc` · Subtask templates: `.cursor/rules/task_generation.mdc`.
