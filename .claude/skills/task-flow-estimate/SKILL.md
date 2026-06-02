---
name: task-flow-estimate
description: Estimates hours for RBIN Task Flow tasks for an average developer at average pace without AI acceleration. Use when the user says task-flow estimate X, estimate task 1, or time estimate for tasks.
disable-model-invocation: true
paths: [".task-flow/**"]
---

# Task Flow — Estimate

1. Read `.task-flow/.internal/tasks.json` for task ID(s) or all.
2. Infer complexity (low/medium/high) from title, description, subtasks, risk — not subtask count alone.
3. Output single range in hours, e.g. `10-14 hours`.
4. State assumption: average developer, average pace, no AI acceleration.

Reference: `.cursor/rules/task_estimate.mdc`
