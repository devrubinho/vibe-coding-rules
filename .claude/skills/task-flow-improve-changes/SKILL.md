---
name: task-flow-improve-changes
description: Audits only uncommitted files against coding standards. Use when the user says task-flow improve changes, audit my diff, or check uncommitted changes against standards.
disable-model-invocation: true
---

# Task Flow — Improve changes

1. Run `git diff --name-only HEAD` (read-only git).
2. If empty, stop — no uncommitted changes.
3. Audit **only** those paths using the same checklist as audit (`.cursor/rules/coding_standards.mdc`). Full reference: `.task-flow/docs/coding-standards-full.md` — relevant sections only if a category needs depth.
4. Present findings; ask what to fix.
5. Does **not** run lint/build — use `/task-flow-check` separately.

Reference: `.cursor/rules/task_improve_changes.mdc`
