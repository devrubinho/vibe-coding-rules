# task-flow-run — full workflow

## Commands

| Input | Behavior |
|-------|----------|
| `task-flow: run next X` | Next X **pending** subtasks in order (skip `done`; resolve `manual` first — see below) |
| `task-flow: run next` | X = 1 |
| `task-flow: run X` | All **pending** subtasks of task X |
| `task-flow: run X,Y` | Tasks X then Y sequentially |
| `task-flow: run all` | All **pending** subtasks |

Subtasks in `manual` block later subtasks in the same task until the dev-log shows they are complete.

## Before picking pending subtasks — resolve `manual`

1. List all `manual` subtasks in scope (same task or global for `run next`).
2. Read `.task-flow/dev-logs/task-X.Y-manual.md` for each.
3. Use the **current conversation** (and codebase checks) to assess completion — no separate confirm command.
4. If the user reported progress in chat, append to the dev-log **Conversation log** (see format below).
5. When the log + verification show all manual steps done → set `done`, run `rbin-task-flow render-status`, continue the run.
6. If still incomplete → keep `manual`, tell the user what remains; do not skip marking done prematurely.

## Dependency check (`run X`)

1. For tasks `1 .. X-1`, verify every subtask is `done`.
2. If any `pending`, `manual`, or `in_progress`: stop with  
   `⚠️ Cannot execute task X: complete tasks [list] first. Use task-flow: run Y or finish manual steps in dev-logs.`
3. For task X: if any earlier subtask is still `manual` (dev-log incomplete), stop — resolve via conversation first.

## tasks.json — partial read (>50 subtasks)

1. From `status.json`, collect **pending** `(taskId, subtaskId)` for this run.
2. Count total subtasks in `tasks.json`.
3. If total **>50**: load only each `tasks[]` entry for pending/manual task ids.
4. If **≤50**: full read is OK.

## Per subtask — fully automatable

1. Load subtask from `tasks.json`.
2. Read `.task-flow/contexts/` when cited.
3. Implement; verify (tests/build).
4. `done` in `status.json`; run `rbin-task-flow render-status`.
5. Suggest commit via `@rbin-git` when appropriate.

## Per subtask — manual intervention required

When the agent **cannot** finish alone (deploy, console, credentials, production, third-party dashboard, etc.):

1. Implement everything possible in code/repo first.
2. Set **`manual`** in `status.json` — never `done`.
3. Create `.task-flow/dev-logs/task-X.Y-manual.md`:

```markdown
# Task X.Y — Manual intervention required

**Subtask:** [title]
**Status:** manual
**Created:** [ISO 8601]

## What the AI completed
- [automated work]

## What you need to do manually
1. [clear step]
2. [clear step]

## Conversation log
(AI appends as you report progress in chat — no separate command)

### YYYY-MM-DDTHH:mm:ssZ
**User said:** [from conversation]
**Verified:** pending | complete
**Notes:** [what was checked; what remains]
```

4. Run `rbin-task-flow render-status` — it renders the `- [~] [title] — manual: .task-flow/dev-logs/task-X.Y-manual.md` line from `status.json`.
5. Stop further subtasks in that task.
6. Tell the user the manual steps; they report back **in normal chat** when done.

## Conversation-driven completion (any turn)

Applies during `run`, `status`, or whenever the user mentions manual work — **no `task-flow: confirm` command**.

1. Read `status.json` for `manual` subtasks.
2. Match user message to a dev-log (by task id, keywords, or open manual items).
3. Append **Conversation log** entry with what the user said.
4. Verify against checklist + codebase when possible.
5. All steps satisfied → `done` + run `rbin-task-flow render-status` + continue blocked work on next `run`.
6. Partial → keep `manual`, update dev-log with remaining steps.

## Never during run

- Mark `done` when manual steps remain unverified
- Write `.task-flow/guides/reports/task-*-implementation.md` (`task-flow: report` only)

## Blocked (not manual)

Temporarily blocked without user action: `in_progress` + explain.

## status.json

Subtask status: `pending` | `done` | `in_progress` | `manual`

## Completion summary

```
✅ Completed N subtasks:
- Task 1.2: [title]

🖐️ Manual — waiting on you:
- Task 1.3: .task-flow/dev-logs/task-1.3-manual.md (report in chat when done)

📝 Next pending: Task 1.4 (after 1.3 resolves)
```

## Related

Cursor fallback: `.cursor/rules/task_work.mdc` — prefer `@task-flow-run` / this file.
