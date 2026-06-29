# task-flow-sync — full workflow

**Primary rule:** `.cursor/rules/task-flow-sync.mdc` · Subtask templates: `task_generation.mdc`

## New task generation

For each new line in `tasks.input.txt`:

- Assign sequential task id (order in file).
- `originalRequest`: exact input line text.
- `createdAt`: ISO 8601.
- 3–8 subtasks with title, description, instructions (3–5 steps).
- Reference contexts when relevant.

## tasks.json (minimal)

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Task Title",
      "description": "Task description",
      "originalRequest": "- Task from input",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "subtasks": [
        {
          "id": 1,
          "title": "Subtask",
          "description": "What it does",
          "instructions": "Step 1: ...\nStep 2: ..."
        }
      ]
    }
  ]
}
```

## status.json (new tasks)

All subtasks `pending`; task `pending`.

## tasks.status.md

Rendered deterministically by `rbin-task-flow render-status` from `status.json` — do **not** hand-write it. It produces the do-not-edit banner, 📊 Summary (counts incl. 🖐️ manual when any), and `- [ ]` / `- [x]` / `- [~]` for tasks and indented subtasks (`[~]` → dev-log link).

## Sync-only rules

- Preserve status on modified tasks when subtasks still match (`done`, `manual`, `pending`).
- New subtasks after regen → `pending`; removed subtasks → drop from status.
- Never explore codebase during pure sync unless user explicitly asks for codebase analysis in the same message.

## After sync

Tell user: `task-flow: status` or `/task-flow-run run next X`.
