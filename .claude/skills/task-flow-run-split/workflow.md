# task-flow-run-split — dispatch workflow (Claude)

Turns `run-split:N` from "N copy-paste lines for N machines" into "N parallel `task-runner`
subagents in one session" — safely. The hard part (computing non-conflicting streams)
is the same as Plan mode; this file is about running them without corrupting shared state.

## Why central state writes

Code areas can be disjoint, but `.task-flow/.internal/status.json` and
`.task-flow/tasks.status.md` are **single shared files**. If parallel runners each write
them, you get lost updates (status.json) and a garbled render (tasks.status.md).

**Rule:** dispatched runners change *code only* and **report** outcomes. The orchestrator
(this skill, in the main session) is the *only* writer of `status.json` and the only caller
of `render-status`.

## Protocol

### 1. Baseline

- `rbin-task-flow validate --schema` — abort dispatch if state is already broken; fix first.
- Load pending `(taskId.subtaskId)` from `status.json`; read `tasks.json` for those tasks.

### 2. Partition into file-disjoint streams

- N streams, dependency chains kept together (a task's subtasks stay in one stream; a task
  that depends on an earlier one runs in the same or a later stream, never concurrently).
- Confirm **file disjointness**, not just task disjointness. When
  `graphify-out/graph.json` exists, `graphify query "<module>" --graph
  graphify-out/graph.json` to see which files each task touches.
- If two streams would touch the same file → they are **not** disjoint: either merge them
  into one stream or run them in separate sequential waves (never in parallel).

### 3. Dispatch (parallel, one wave)

For each disjoint stream, spawn a `task-runner` subagent **in the same message** (parallel).
Each dispatch prompt must contain:

```
You are task-runner. Implement ONLY these subtask ids: <ids>. Project root: <path>.
Read their instructions from .task-flow/.internal/tasks.json and cited .task-flow/contexts/.
Implement the code and verify (tests/build) where possible. Follow
.cursor/rules/coding_standards.mdc.

IMPORTANT (parallel dispatch): do NOT modify .task-flow/.internal/status.json and do NOT
run render-status — the orchestrator owns those. Touch only files for YOUR ids. Never run
git writes.

Return a compact report, one line per subtask:
  <taskId>.<subId>: done | manual | blocked — <one-line note; for manual, the dev-log path>
```

If some streams share files, run them as **sequential waves**: dispatch wave 1 in parallel,
wait for all to return, then wave 2, etc.

### 4. Apply centrally (orchestrator only)

After all runners in a wave return:

1. Parse each runner's per-subtask report.
2. Update `status.json` **sequentially** (no concurrency): set `done` / `manual` per report;
   set a parent task `done` only when all its subtasks are `done`. For `manual`, ensure the
   runner created `.task-flow/dev-logs/task-X.Y-manual.md` (create it from the report if not).
3. `rbin-task-flow validate --schema` — must pass; if not, fix the offending id before render.
4. `rbin-task-flow render-status` — rebuild `tasks.status.md` once.

### 5. Report

```
✅ Dispatched N streams (M subtasks):
- Stream 1 (task-runner): 2.1, 2.2 done
- Stream 2 (task-runner): 5.1 done · 5.2 manual → .task-flow/dev-logs/task-5.2-manual.md

🖐️ Manual — waiting on you: 5.2
📝 Next: task-flow: run next  (after manual resolves)
```

Then suggest a Conventional Commit message (policy: `.cursor/rules/rbin-git-policy.mdc`) — never git write.

## Optional review pass

For a quality gate, after step 4 dispatch one `task-reviewer` (read-only) over the
just-completed ids; apply any "false done" it reports by reverting that subtask to `pending`
/`manual` in `status.json` and re-running `render-status`.

## Guardrails

- Never dispatch streams that share files in the same wave.
- Runners never write `status.json` / `tasks.status.md`; the orchestrator does, sequentially.
- Always `validate --schema` before the final `render-status`.
- Lines mode (copy-paste run lines) stays available; Cursor/Codex keep using `task_split.mdc`.
