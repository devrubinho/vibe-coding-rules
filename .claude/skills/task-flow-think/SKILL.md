---
name: task-flow-think
description: Analyzes the codebase and suggests new lines for tasks.input.txt without adding them automatically. Use when the user says task-flow think, suggest tasks, analise tasks novas, or check for missing tasks.
disable-model-invocation: true
---

# Task Flow — Think

1. Read `.task-flow/tasks.input.txt` (existing plan).
2. Scan codebase: TODOs, missing tests, half-done features, security/perf gaps.
3. Propose new tasks as `- Description` lines (RBIN format).
4. **Ask** user before writing to `tasks.input.txt`.
5. If user confirms, append only new lines; then suggest `/task-flow-sync`.

Optional: `graphify query` on large repos before suggesting.

Reference: `.cursor/rules/task_analysis.mdc` · Sync after confirm: `@task-flow-sync`
