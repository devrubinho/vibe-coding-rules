# RBIN Task Flow — Codex workflows

Codex loads **AGENTS.md** at session start (32 KiB default cap). This file holds **full procedures** — read it when the user runs a `task-flow:` command or when AGENTS.md points here.

**Do not paste this entire file into AGENTS.md.**

---

## task-flow: sync

1. Read `.task-flow/tasks.input.txt`, `.internal/tasks.json`, `.internal/status.json`.
2. Compare tasks by `originalRequest`.
3. New tasks: generate 3–8 subtasks, `createdAt` ISO, contexts from `.task-flow/contexts/`.
4. Write/update `tasks.json`, `status.json`, `tasks.status.md` with Summary.
5. Preserve status on modified tasks when subtasks still align.
6. Do not populate `tasks.flow.md`.

Sync: `.cursor/rules/task-flow-sync.mdc` · Think: `.cursor/rules/task_analysis.mdc`

---

## task-flow: run next X | run X | run all

See AGENTS.md **Run** section. Prefer `.claude/skills/task-flow-run/workflow.md`; fallback: `.cursor/rules/task_work.mdc`.

**Dependency:** `run N` only if tasks `1..N-1` fully done.

**Per subtask:** implement → `done` in `status.json` → refresh `tasks.status.md` → suggest commit.

**Blocked:** set `in_progress`, explain.

---

## task-flow: status

Display `.task-flow/tasks.status.md`. If missing, run sync first.

---

## task-flow: think

1. Read `tasks.input.txt`.
2. Scan repo for TODOs, gaps, tests, incomplete features.
3. Propose new `- task` lines.
4. **Ask** before appending to `tasks.input.txt`.
5. If confirmed, append and suggest `task-flow: sync`.

---

## task-flow: check

1. `package.json` scripts: lint fix variant, then `build`.
2. Fix until pass.
3. Does not edit task files.

Rule: `.cursor/rules/task_check.mdc`

---

## task-flow: audit

1. Score project vs the checklist in `.cursor/rules/coding_standards.mdc` (not the full doc unless user wants depth).
2. Present table; ask what to adopt.
3. Never impose wholesale refactors.

Rule: `.cursor/rules/task_audit.mdc`

---

## task-flow: improve changes

1. `git diff --name-only HEAD` (read-only).
2. If empty, stop.
3. Audit only those paths vs coding standards.
4. Ask before edits.

Rule: `.cursor/rules/task_improve_changes.mdc`

---

## task-flow: review X

1. Load done subtasks for task X from `status.json`.
2. Verify implementation in codebase.
3. Report false positives; ask to revert status if needed.

Rule: `.cursor/rules/task_review.mdc`

---

## task-flow: validate

1. Read `tasks.input.txt`, `tasks.json`, `status.json` — scope `all` or task ID(s).
2. Thoroughly verify each subtask against codebase (`done` + `pending`).
3. Revert false `done` → `pending` in `status.json`.
4. Append lacunas as `- Description` to `tasks.input.txt` (no duplicates).
5. Run sync workflow (section **Sync** in AGENTS.md).

Rule: `.cursor/rules/task_validate.mdc`

Unlike `think` (asks before add) or `review` (done only, asks before revert).

---

## task-flow: refactor X

Refactor task-related files: no behavior change, remove explanatory comments, keep section separators.

Rule: `.cursor/rules/task_refactor.mdc`

---

## task-flow: estimate X

Read `tasks.json`; one hour range; average developer, average pace, no AI acceleration.

Rule: `.cursor/rules/task_estimate.mdc`

---

## task-flow: report X

Verify task done; write `.task-flow/docs/task-X-implementation.md`.

Rule: `.cursor/rules/task_report.mdc`

---

## task-flow: generate flow

Populate `.task-flow/tasks.flow.md` with deps, hours, model hints (no Opus).

Rule: `.cursor/rules/task_generate_flow.mdc`

---

## Implementing code (any subtask)

Follow the checklist in `.cursor/rules/coding_standards.mdc`. For examples/Nest: read sections of `.task-flow/docs/coding-standards-full.md` only.

---

## Graphify (optional)

Only during `run` / `think` when `graphify-out/` exists. See `.task-flow/GRAPHIFY.md`. Does not replace status updates.

---

## Verify Codex instructions

```bash
codex --ask-for-approval never "Summarize the project instructions you follow for RBIN Task Flow."
```

If Task Flow rules missing, check `project_doc_max_bytes` in `.codex/config.toml` (template from `rbin-task-flow init`).
