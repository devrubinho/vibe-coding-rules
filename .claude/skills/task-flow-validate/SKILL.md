---
name: task-flow-validate
description: Deep-validates RBIN Task Flow tasks against the codebase, reverts false done status, and appends missing gaps to tasks.input.txt then syncs. Use when the user says task-flow validate, validate all, validar tasks, or verificar lacunas.
disable-model-invocation: false
---

# Task Flow — Validate

Thorough implementation audit + automatic gap fill in `tasks.input.txt`.

0. **Schema check first (deterministic):** run `rbin-task-flow validate --schema`. It checks `tasks.json`/`status.json` against the schemas + referential integrity (status↔tasks ids). If it exits non-zero, fix the reported state issue (or re-run sync) before the deep audit below.
1. Read `tasks.input.txt`, `tasks.json`, `status.json`, `contexts/` — scope `X`, `X,Y`, or `all` (default `all`).
2. **Verify** each subtask in scope: `done` must match code; `pending` checked for drift.
3. **Lacunas:** missing work not in `tasks.input.txt` (TODOs, tests, incomplete features).
4. **Apply:**
   - False `done` → `pending` in `status.json`
   - Append new `- Description` lines to `tasks.input.txt` (no duplicates)
   - Run sync workflow (`@task-flow-sync` / `task-flow-sync.mdc`)
5. Report verified / reverted / added / next `run`.

Optional: `graphify query` per task area if `graphify-out/graph.json` exists.

Reference: `.cursor/rules/task_validate.mdc`
