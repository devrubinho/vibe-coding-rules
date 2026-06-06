# RBIN Task Flow - Quick Commands

**Optimize by AI platform:**

| Platform | Guide |
|----------|--------|
| Index | [AI-PLATFORMS.md](AI-PLATFORMS.md) |
| Claude Code | [platforms/claude-code.md](platforms/claude-code.md) |
| Cursor | [platforms/cursor.md](platforms/cursor.md) |
| Codex | [platforms/codex.md](platforms/codex.md) |
| Graphify + Task Flow | [GRAPHIFY.md](GRAPHIFY.md) |
| Codex | [CODEX.md](CODEX.md) · [platforms/codex.md](platforms/codex.md) |
| Cursor | [CURSOR.md](CURSOR.md) · [platforms/cursor.md](platforms/cursor.md) |
| Otimização (tokens / roadmap) | [OPTIMIZATION-PLAN.md](OPTIMIZATION-PLAN.md) |
| Subtarefas para implementar otimização | [OPTIMIZATION-IMPLEMENTATION-TASKS.md](OPTIMIZATION-IMPLEMENTATION-TASKS.md) |
| Coding standards (full, on demand) | [docs/coding-standards-full.md](docs/coding-standards-full.md) |

## 🚀 Quick Commands

| Command | Description |
|---------|-------------|
| `task-flow: sync` | Complete synchronization: adds new, removes deleted, updates modified, preserves status |
| `task-flow: think` | Analyzes code and suggests new tasks |
| `task-flow: status` | Shows current task status |
| `task-flow: run next X` | Works on next X subtasks (e.g., `task-flow: run next 4`) |
| `task-flow: run X` | Executes all pending subtasks of task X (e.g., `task-flow: run 1`) |
| `task-flow: run X,Y` | Executes multiple tasks (e.g., `task-flow: run 10,11`) |
| `task-flow: run all` | Executes all tasks |
| `task-flow: review X` | Reviews specific task(s) (e.g., `task-flow: review 1` or `task-flow: review 10,11` or `task-flow: review all`) |
| `task-flow: validate` | Deep-validates tasks vs codebase, reverts false done, appends gaps to `tasks.input.txt`, syncs (default: all) |
| `task-flow: refactor X` | Refactors specific task(s) (e.g., `task-flow: refactor 1` or `task-flow: refactor 10,11` or `task-flow: refactor all`) |
| `task-flow: estimate X` | Estimates time for task X (e.g., `task-flow: estimate 1` or `task-flow: estimate 10,11`) |
| `task-flow: report X` | Generates implementation report for task X (e.g., `task-flow: report 1` or `task-flow: report 10,11`) |
| `task-flow: generate flow` | Populates tasks.flow.md with dependencies, estimated hours, and AI model recommendations |
| `task-flow: audit` | Audits codebase against **coding standards checklist**; full doc on demand |
| `task-flow: check` | Run lint fix (if available) and build; fix any warnings or errors until both pass |
| `task-flow: improve changes` | Audit only uncommitted files vs **checklist** (same as audit, scoped to diff) |
| `rbin-task-flow audit` | **(CLI)** Lists files with unstaged changes (not yet `git add`) |

**See complete details below ↓**

---

## Detailed Commands

### `task-flow: sync`
Complete synchronization between `tasks.input.txt` and the system:
- ✅ Adds new tasks from `tasks.input.txt`
- ✅ Removes tasks that were deleted from `tasks.input.txt`
- ✅ Updates tasks that were modified in `tasks.input.txt`
- ✅ Preserves status (done/pending) of existing tasks
- ✅ Synchronizes status between `status.json` and `tasks.status.md` (ensures they are always aligned)

### `task-flow: think`
Analyzes code and suggests new tasks. Asks before adding to `tasks.input.txt`.

### `task-flow: status`
Shows current status of tasks and subtasks from the `tasks.status.md` file.

### `task-flow: audit`
Audits the **entire codebase** against the **checklist** in [coding_standards.mdc](.cursor/rules/coding_standards.mdc). Deep reference: [docs/coding-standards-full.md](docs/coding-standards-full.md) (sections only, on demand). Non-destructive: reports gaps and suggests incremental improvements; the user chooses what to adopt. See [task_audit.mdc](.cursor/rules/task_audit.mdc) for the full flow.

### `task-flow: check`
Runs **lint fix** and **build** for the project. Check `package.json` for a lint-with-fix script (e.g. `lint:fix`, `lint -- --fix`) and a build script; run lint fix first, fix any warnings or errors, then run build and fix until it passes. Use before committing or before `task-flow: improve changes` to ensure the project is clean.

### `task-flow: improve changes`
Same as **task-flow: audit**, but **only for files that were changed and not yet committed** (unstaged + staged). The AI obtains the list via `git diff --name-only HEAD`, and scores those paths against the **checklist** in `coding_standards.mdc` (not the full standards doc unless depth is needed). Use before committing. Does **not** run lint or build — use `task-flow: check` for that.

### `rbin-task-flow audit` (CLI only)
Lists **unstaged** file paths (modified but not yet `git add`). Run in the project root: `rbin-task-flow audit`. Option: `-p, --path <path>`.

---

## Commands with Task ID

### `task-flow: run next X`
Works on next X pending subtasks in sequential order. Implements and marks as "done".

**Examples:**
- `task-flow: run next 4` → Next 4 subtasks
- `task-flow: run next` → Next 1 subtask

### `task-flow: run X` (simplified syntax)
Executes all pending subtasks of a specific task. Implements and marks as "done".

**⚠️ Dependency Check:**
- Only executes if all previous tasks (1, 2, ..., X-1) are completely finished
- Allows parallel work by multiple AIs without conflicts
- If there are pending previous tasks, warns which ones need to be completed first

**Examples:**
- `task-flow: run 1` → All pending subtasks of task 1 (can always execute)
- `task-flow: run 10,11` → All pending subtasks of tasks 10 and 11
- `task-flow: run all` → All pending subtasks of all tasks
- `task-flow: run 3` → Only executes if tasks 1 and 2 are complete

### `task-flow: review X`
Reviews specific task(s) marked as "done" to verify they are actually completed.

**Examples:**
- `task-flow: review 1` → Reviews task 1
- `task-flow: review 10,11` → Reviews tasks 10 and 11
- `task-flow: review all` → Reviews all tasks

### `task-flow: validate`
Deep validation: checks all subtasks (done and pending) against the codebase, reverts falsely marked `done`, discovers lacunas (missing tests, TODOs, incomplete work), **appends** them to `tasks.input.txt`, and runs sync. Unlike `think` (asks before add) or `review` (done only, asks before revert).

**Examples:**
- `task-flow: validate` → Validates all tasks
- `task-flow: validate 1` → Validates task 1 only
- `task-flow: validate 2,3` → Validates tasks 2 and 3

**Invoke:** `@task-flow-validate` (Cursor) · `/task-flow-validate` (Claude)

### `task-flow: refactor X`
Refactors code from specific task(s). Removes explanatory comments, improves code without changing functionality.

**Examples:**
- `task-flow: refactor 1` → Refactors task 1
- `task-flow: refactor 10,11` → Refactors tasks 10 and 11
- `task-flow: refactor all` → Refactors all tasks

### `task-flow: estimate X` (simplified syntax)
Estimates time required to complete task(s) based on the real complexity of the task, assuming an average developer working at an average pace without AI acceleration. Subtask count informs scope, but is not the sole criterion.

**Output includes:**
- A single estimate range for the majority of developers
- Estimates in hours and business days
- Recommendation for management with buffer

**Examples:**
- `task-flow: estimate 1` → Shows time estimate for task 1
- `task-flow: estimate 10,11` → Shows time estimates for tasks 10 and 11
- `task-flow: estimate all` → Shows time estimates for all tasks

### `task-flow: generate flow`
Populates `tasks.flow.md` with: (1) task dependencies (for parallelization), (2) estimated hours, and (3) AI model recommendations (GPT-5.x, Composer, Claude) with effort levels. Model ranking and effort must be defined by the AI from task context, not from a fixed order or only from subtask count. Run after `task-flow: sync` when you want to know which tasks can run in parallel and which model/effort to use.

### `task-flow: report X` (simplified syntax)
Generates a detailed implementation report for completed task(s) in Markdown format.

**Report includes:**
- Task overview and completion status
- List of completed subtasks
- Files created and modified (detected from git history)
- Code change summaries with analysis
- Task creation and completion dates

**Report location:** `.task-flow/docs/task-X-implementation.md`

**Examples:**
- `task-flow: report 1` → Generates report for task 1
- `task-flow: report 10,11` → Generates reports for tasks 10 and 11
- `task-flow: report all` → Generates reports for all tasks

---

## Files

- `.task-flow/tasks.input.txt` - Edit tasks here (format: `- Task description`)
- `.task-flow/tasks.status.md` - ⚠️ **DO NOT EDIT** - Automatically updated by AI
- `.task-flow/tasks.flow.md` - Dependencies, estimated hours, and model recommendations (populated by `task-flow: generate flow`)
- `.task-flow/.internal/` - ⚠️ **IGNORE** - Internal system files (no need to read or edit)
