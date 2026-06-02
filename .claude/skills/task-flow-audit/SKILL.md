---
name: task-flow-audit
description: Audits the full codebase against RBIN coding standards with a score table and asks which improvements to adopt. Use when the user says task-flow audit or audit coding standards for the whole project.
disable-model-invocation: true
---

# Task Flow — Audit

1. Scan project structure and `package.json`.
2. Score categories vs `.cursor/rules/coding_standards.mdc` checklist (Full / Partial / Missing). Use `.task-flow/docs/coding-standards-full.md` only for deep dives — not the whole file.
3. Present table and incremental improvement options.
4. **Ask** user what to adopt; never impose refactors.
5. Generate task lines for selected items only if user confirms.

Non-destructive. Reference: `.cursor/rules/task_audit.mdc`
