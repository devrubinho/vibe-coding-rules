---
name: task-flow-check
description: Runs project lint fix and build from package.json until passing. Use when the user says task-flow check, run lint and build, or validate project before commit.
disable-model-invocation: true
---

# Task Flow — Check

1. Read `package.json` scripts.
2. Run lint with fix variant if present (`lint:fix`, `lint-fix`, or `lint -- --fix`); fix issues.
3. Run `build` if defined; fix failures.
4. Re-run until both pass.
5. Report what ran and final status.

Does not change task files. Reference: `.cursor/rules/task_check.mdc`
