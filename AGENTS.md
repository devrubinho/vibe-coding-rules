# Codex — RBIN Task Flow

**Task flow** always means **RBIN Task Flow**. Codex does not load `.cursor/rules/*.mdc` automatically — use this file plus **read on demand** files below.

**Full Codex guide:** `.task-flow/guides/platforms/codex.md` · **Workflows (read when executing a command):** `.task-flow/guides/CODEX.md`

## Paths

| Path | Use |
|------|-----|
| `.task-flow/tasks.input.txt` | Tasks (`- description`) |
| `.task-flow/tasks.status.md` | Human status (do not edit) |
| `.task-flow/.internal/tasks.json` | Task definitions |
| `.task-flow/.internal/status.json` | Status source of truth |
| `.task-flow/contexts/` | Specs/mockups for subtasks |
| `.task-flow/dev-logs/` | Manual steps + conversation log (AI updates from chat) |

## Git

Never run: `git add`, `commit`, `push`, `pull`, `merge`, `checkout`, `reset`, `rebase`.  
Read-only OK: `git status`, `git diff`, `git log`, `git show`, `git branch`.  
After subtasks: suggest Conventional Commit with Task/Subtask ID — user runs git.

## Code comments

No explanatory comments. Complex topics → `dev-logs/*.md`. Allowed: `// ────────────────────────────────` section separators only.

## Commands → read before executing

| Command | Read first |
|---------|------------|
| `task-flow: sync` | Section **Sync** below; details `.task-flow/guides/CODEX.md` |
| `task-flow: from contexts` | `.cursor/rules/task_from_contexts.mdc` · then `sync` |
| `task-flow: run …` | Section **Run** below; details `.task-flow/guides/CODEX.md` |
| `task-flow: run-split:N` | `.cursor/rules/task_split.mdc` · N obrigatório (`run-split:3`, `run-split:2 50-72`) |
| `task-flow: status` | `.task-flow/tasks.status.md` |
| `task-flow: audit` | `.cursor/rules/task_audit.mdc` · checklist `coding_standards.mdc` (full: `.task-flow/guides/coding-standards-full.md` if needed) |
| `task-flow: validate` | Run `rbin-task-flow validate --schema` first (schema + referential integrity); then `.cursor/rules/task_validate.mdc` · then sync |
| `task-flow: estimate X` / `X,Y` / `all` | `.cursor/rules/task_estimate.mdc` · `.task-flow/guides/CODEX.md` |
| `task-flow: report X` | `.task-flow/guides/CODEX.md` |
| Implementing code | Checklist `.cursor/rules/coding_standards.mdc` · depth: `.task-flow/guides/coding-standards-full.md` (sections only) |

## Sync (embedded)

1. Read `tasks.input.txt` (lines `- ` only), `tasks.json`, `status.json`.
2. Diff by `originalRequest`: new / removed / modified / unchanged.
3. **New:** 3–8 subtasks each, pending status.
4. **Removed:** drop from json + status + md.
5. **Modified:** regen subtasks, **preserve** done/pending where possible.
6. List `.task-flow/contexts/`; match to tasks; honor `task-flow-screen file.ext`.
7. `status.json` = truth; run `rbin-task-flow render-status` to rebuild `tasks.status.md` (checkboxes + 📊 Summary).

## Run (embedded)

1. Read `tasks.json` + `status.json`.
2. **Resolve `manual` first:** read dev-logs + conversation; append Conversation log; mark `done` only when verified.
3. `run next X` (default X=1): next X **pending** subtasks (skip unresolved `manual`).
4. `run X` / `X,Y` / `all`: all pending for task(s); block if tasks `1..X-1` have non-`done` subtasks.
5. Per subtask: `instructions`; `contexts/`; implement + verify; optional `graphify query`.
6. **Automatable** → `done`; **manual intervention** → `manual` + dev-log; user reports in chat; AI updates log and completes when verified.
7. Parent task `done` when all subtasks `done`. Suggest commit; never git write.
8. **Never** write `guides/reports/` during run.

## Prompt templates (copy)

```
Leia AGENTS.md. Execute task-flow: sync.
```

```
Leia AGENTS.md e .task-flow/guides/CODEX.md (Run). task-flow: run next 3.
```

## Other platforms

Claude: `CLAUDE.md` + `.claude/skills/`. Cursor: `.cursor/rules/`. Index: `.task-flow/guides/AI-PLATFORMS.md`.
