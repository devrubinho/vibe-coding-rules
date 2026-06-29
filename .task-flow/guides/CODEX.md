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

Sync: `.cursor/rules/task-flow-sync.mdc`

---

## task-flow: from contexts

1. List `.task-flow/contexts/` (or specific `file.png`, `a.md,b.png`).
2. Read each file; skip already linked via `task-flow-screen` in `tasks.input.txt`.
3. Append `- Description task-flow-screen filename.ext` under `## Tasks:`.
4. Report added/skipped; suggest `task-flow: sync` — do not sync here.

Rule: `.cursor/rules/task_from_contexts.mdc`

---

## task-flow: run-split:N

1. **N obrigatório** — `run-split:3`, `run-split:2`. `run-split` sem `:N` → inválido.
2. Escopo opcional: `run-split:3 50-72` ou `run-split:2 50,51,69`; senão todas pending.
3. Particionar em **N** filas sem conflito; cadeias na mesma fila.
4. Ordenar IA-1 (mais forte) → IA-N por dificuldade.
5. Output N linhas `task-flow: run id,id,id` + coordenação.
6. **Não** implementar nem editar status.

Rule: `.cursor/rules/task_split.mdc`

---

## task-flow: run next X | run X | run all

See AGENTS.md **Run** section. Prefer `.claude/skills/task-flow-run/workflow.md`; fallback: `.cursor/rules/task_work.mdc`.

**Dependency:** `run N` only if tasks `1..N-1` fully `done` (no `manual` blocking).

**Per subtask (automatable):** implement → `done` → refresh `tasks.status.md` → suggest commit.

**Manual intervention:** implement what you can → `manual` → dev-log → user reports in chat → AI updates Conversation log → `done` when verified.

**Never during run:** `guides/reports/task-*-implementation.md`.

---

## task-flow: status

Display `.task-flow/tasks.status.md`. If missing, run sync first.

---

## task-flow: audit

1. Score project vs the checklist in `.cursor/rules/coding_standards.mdc` (not the full doc unless user wants depth).
2. Present table; ask what to adopt.
3. Never impose wholesale refactors.

Rule: `.cursor/rules/task_audit.mdc`

---

## task-flow: validate

1. Read `tasks.input.txt`, `tasks.json`, `status.json` — scope `all` or task ID(s).
2. Thoroughly verify each subtask against codebase (`done` + `pending`).
3. Revert false `done` → `pending` in `status.json`.
4. Append lacunas as `- Description` to `tasks.input.txt` (no duplicates).
5. Run sync workflow (section **Sync** in AGENTS.md).

Rule: `.cursor/rules/task_validate.mdc`

---

## task-flow: estimate X

1. Parse: `estimate X` | `estimate X,Y` | `estimate all`.
2. Read `tasks.json` for matching task ID(s).
3. One hour range per task; average developer, average pace, no AI acceleration.

Rule: `.cursor/rules/task_estimate.mdc`

---

## task-flow: report X

Verify task done; write `.task-flow/guides/reports/task-X-implementation.md`.

Rule: `.cursor/rules/task_report.mdc`

---

## Implementing code (any subtask)

Follow the checklist in `.cursor/rules/coding_standards.mdc`. For examples/Nest: read sections of `.task-flow/guides/coding-standards-full.md` only.

---

## Graphify (optional)

Only during `run` / `validate` when `.task-flow/guides/graphify-out/` exists. See `.task-flow/guides/GRAPHIFY.md`. Does not replace status updates.

---

## Verify Codex instructions

```bash
codex --ask-for-approval never "Summarize the project instructions you follow for RBIN Task Flow."
```

If Task Flow rules missing, check `project_doc_max_bytes` in `.codex/config.toml` (template from `rbin-task-flow init`).
