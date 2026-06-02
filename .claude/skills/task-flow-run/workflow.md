# task-flow-run — full workflow

## Commands

| Input | Behavior |
|-------|----------|
| `task-flow: run next X` | Next X pending subtasks in order (task 1.1, 1.2, …, 2.1, …) |
| `task-flow: run next` | X = 1 |
| `task-flow: run X` | All pending subtasks of task X |
| `task-flow: run X,Y` | Tasks X then Y sequentially |
| `task-flow: run all` | All pending subtasks |

## Dependency check (`run X`)

1. For tasks `1 .. X-1`, verify every subtask is `done`.
2. If any pending: stop with  
   `⚠️ Cannot execute task X: complete tasks [list] first. Use task-flow: run Y.`
3. Do not execute any subtask of X until cleared.

## tasks.json — partial read (>50 subtasks)

1. From `status.json`, collect pending `(taskId, subtaskId)` for this run.
2. Count total subtasks in `tasks.json` (quick parse or `jq '[.tasks[].subtasks | length] | add'`).
3. If total **>50**: load **only** each `tasks[]` entry where `id` is in the pending set — not the full array.
4. If **≤50**: loading the full `tasks.json` is acceptable.

## Per subtask

1. Load subtask from `tasks.json` (title, description, instructions) — slice for that task id only when using partial read.
2. If instructions cite `.task-flow/contexts/...`, read those files.
3. Implement; verify (tests/build as appropriate).
4. Set subtask to `done` in `status.json`.
5. Update `tasks.status.md`: `- [x]` on subtask; regenerate Summary (✅ / ⏳ / 📝 counts).
6. If blocked: set `in_progress` and explain.

## status.json shape

```json
{
  "tasks": {
    "1": {
      "status": "pending",
      "subtasks": { "1": "done", "2": "pending" }
    }
  }
}
```

## Completion summary

```
✅ Completed N subtasks:
- Task 1.2: [title]
📝 Next pending: Task 1.3
```

## Related rules

Cursor fallback (short): `.cursor/rules/task_work.mdc` — prefer `@task-flow-run` / this file.
