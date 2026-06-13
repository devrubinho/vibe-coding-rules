---
name: task-flow-estimate
description: Estimates hours for RBIN Task Flow tasks (single ID, comma-separated IDs, or all). Use when the user says task-flow estimate 1, estimate 1,2, estimate all, or time estimate for tasks.
disable-model-invocation: false
paths: [".task-flow/**"]
---

# Task Flow — Estimate

1. Parse intent: `estimate X` | `estimate X,Y` | `estimate all`.
2. Read `.task-flow/.internal/tasks.json` for the matching task ID(s).
3. Infer complexity (low/medium/high) from title, description, subtasks, risk — not subtask count alone.
4. Output one range in hours per task, e.g. `10-14 hours`.
5. State assumption: average developer, average pace, no AI acceleration.

**CLI (optional):** `rbin-task-flow estimate 1` · `rbin-task-flow estimate 1,2` · `rbin-task-flow estimate all`

Reference: `.cursor/rules/task_estimate.mdc`
