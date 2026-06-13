---
name: task-flow-from-contexts
description: Creates tasks in tasks.input.txt from files in .task-flow/contexts/ (images, PDF, text, etc.). Use when the user says task-flow from contexts, import contexts, gerar tasks dos contexts, or criar tasks a partir dos contexts.
disable-model-invocation: false
paths: [".task-flow/**"]
---

# Task Flow — From contexts

1. List `.task-flow/contexts/` (optional scope: one file or comma-separated list).
2. Read each context (text directly; images/PDF with vision when available).
3. Skip files already referenced via `task-flow-screen` in `tasks.input.txt`.
4. Append new `- Description task-flow-screen filename.ext` lines under `## Tasks:`.
5. Report added/skipped lines; suggest `task-flow: sync` — do **not** sync automatically.

Reference: `.cursor/rules/task_from_contexts.mdc`
