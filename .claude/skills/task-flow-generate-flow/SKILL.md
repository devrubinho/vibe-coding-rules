---
name: task-flow-generate-flow
description: Populates tasks.flow.md with dependencies, billing hours, and model recommendations for RBIN Task Flow tasks. Use when the user says task-flow generate flow, gerar flow, or tasks flow dependencies.
disable-model-invocation: true
paths: [".task-flow/**"]
---

# Task Flow — Generate flow

1. Read `.task-flow/.internal/tasks.json` and optional `status.json`.
2. For each task: dependencies, hour range (billing), 3 models (GPT-5.x, Composer, Claude Haiku/Sonnet only — **never Opus**).
3. Write `.task-flow/tasks.flow.md` (overwrite populated sections).
4. Use AI judgment for model order and effort per task.

Reference: `.cursor/rules/task_generate_flow.mdc`
