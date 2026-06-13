---
name: task-flow-report
description: Generates implementation markdown report for completed RBIN Task Flow tasks. Use when the user says task-flow report X or document completed task.
disable-model-invocation: false
paths: [".task-flow/**"]
---

# Task Flow — Report

1. Verify task X is fully `done` in `status.json` (warn if partial).
2. Read `tasks.json`; analyze related code changes (read-only git ok).
3. Write `.task-flow/guides/reports/task-X-implementation.md` using project template.
4. Create `.task-flow/guides/reports/` if missing.

Reference: `.cursor/rules/task_report.mdc`
