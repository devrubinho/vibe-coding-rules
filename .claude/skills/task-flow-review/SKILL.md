---
name: task-flow-review
description: Verifies completed RBIN Task Flow tasks are actually implemented in the codebase. Use when the user says task-flow review X, review task 1, or verify done tasks.
disable-model-invocation: true
---

# Task Flow — Review

1. Read `tasks.json`, `status.json` for task ID(s) X or `all`.
2. For each subtask marked `done`: verify files/code/tests exist and match requirements.
3. Report ✅ correct vs ⚠️ falsely marked done.
4. Ask if user wants status reverted to `pending` / `in_progress`.

Reference: `.cursor/rules/task_review.mdc`
