# Codex — RBIN Task Flow

**Task flow** always means **RBIN Task Flow**. Codex does not load `.cursor/rules/*.mdc` automatically — use this file plus **read on demand** files below.

**Full Codex guide:** `.task-flow/platforms/codex.md` · **Workflows (read when executing a command):** `.task-flow/CODEX.md`

## Paths

| Path | Use |
|------|-----|
| `.task-flow/tasks.input.txt` | Tasks (`- description`) |
| `.task-flow/tasks.status.md` | Human status (do not edit) |
| `.task-flow/.internal/tasks.json` | Task definitions |
| `.task-flow/.internal/status.json` | Status source of truth |
| `.task-flow/contexts/` | Specs/mockups for subtasks |

## Git

Never run: `git add`, `commit`, `push`, `pull`, `merge`, `checkout`, `reset`, `rebase`.  
Read-only OK: `git status`, `git diff`, `git log`, `git show`, `git branch`.  
After subtasks: suggest Conventional Commit with Task/Subtask ID — user runs git.

## Code comments

No explanatory comments. Complex topics → `dev-logs/*.md`. Allowed: `// ────────────────────────────────` section separators only.

## Commands → read before executing

| Command | Read first |
|---------|------------|
| `task-flow: sync` | Section **Sync** below; details `.task-flow/CODEX.md` |
| `task-flow: run …` | Section **Run** below; details `.task-flow/CODEX.md` |
| `task-flow: status` | `.task-flow/tasks.status.md` |
| `task-flow: think` | `.task-flow/CODEX.md` · optional codebase scan |
| `task-flow: check` | `.cursor/rules/task_check.mdc` · `package.json` |
| `task-flow: improve changes` | `git diff --name-only HEAD` · `.cursor/rules/task_improve_changes.mdc` |
| `task-flow: audit` | `.cursor/rules/task_audit.mdc` · checklist `coding_standards.mdc` (full: `.task-flow/docs/coding-standards-full.md` if needed) |
| `task-flow: review X` | `.task-flow/CODEX.md` |
| `task-flow: validate` | `.cursor/rules/task_validate.mdc` · then sync |
| `task-flow: refactor X` | `.cursor/rules/task_refactor.mdc` |
| `task-flow: estimate X` | `.task-flow/CODEX.md` |
| `task-flow: report X` | `.task-flow/CODEX.md` |
| `task-flow: generate flow` | `.cursor/rules/task_generate_flow.mdc` |
| Implementing code | Checklist `.cursor/rules/coding_standards.mdc` · depth: `.task-flow/docs/coding-standards-full.md` (sections only) |

## Sync (embedded)

1. Read `tasks.input.txt` (lines `- ` only), `tasks.json`, `status.json`.
2. Diff by `originalRequest`: new / removed / modified / unchanged.
3. **New:** 3–8 subtasks each, pending status, update `tasks.status.md`.
4. **Removed:** drop from json + status + md.
5. **Modified:** regen subtasks, **preserve** done/pending where possible.
6. List `.task-flow/contexts/`; match to tasks; honor `task-flow-screen file.ext`.
7. `status.json` = truth; sync `tasks.status.md` checkboxes + 📊 Summary.
8. Do not fill `tasks.flow.md` (only `generate flow`).

## Run (embedded)

1. Read `tasks.json` + `status.json`.
2. `run next X` (default X=1): next X **pending** subtasks in order 1.1, 1.2, …, 2.1…
3. `run X` / `X,Y` / `all`: all pending for task(s); for `run X`, block if tasks `1..X-1` have any pending subtask.
4. Per subtask: follow `instructions`; read `contexts/` if cited; implement + verify.
5. If `graphify-out/graph.json` exists, prefer `graphify query` before repo-wide grep.
6. Mark subtask `done` in `status.json`; update `tasks.status.md` Summary.
7. Parent task `done` when all subtasks done. Suggest commit; never git write.

## Prompt templates (copy)

```
Leia AGENTS.md. Execute task-flow: sync.
```

```
Leia AGENTS.md e .task-flow/CODEX.md (Run). task-flow: run next 3.
```

```
task-flow: improve changes — git diff --name-only HEAD, audite só esses arquivos.
```

## Other platforms

Claude: `CLAUDE.md` + `.claude/skills/`. Cursor: `.cursor/rules/`. Index: `.task-flow/AI-PLATFORMS.md`.
