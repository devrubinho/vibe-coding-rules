---
name: task-flow-refactor
description: Refactors code for task X without changing behavior; removes explanatory comments. Use when the user says task-flow refactor X or refactor completed task code.
disable-model-invocation: true
---

# Task Flow — Refactor

1. Identify files related to task X (from implementation scope).
2. Remove explanatory comments; keep only `// ────────────────────────────────` section separators.
3. Improve names/structure; **no** behavior change.
4. Never run git write commands.

Reference: `.cursor/rules/task_refactor.mdc`, `.cursor/rules/code_comments.mdc`
