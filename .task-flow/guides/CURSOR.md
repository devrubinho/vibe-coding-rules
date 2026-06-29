# RBIN Task Flow — Cursor

Cursor loads **two always-on rules** plus **optional** skills and intelligent/glob rules. Heavy workflows are **not** in every chat — invoke skills explicitly.

| Always-on | Purpose |
|-----------|---------|
| `task-flow-cursor.mdc` | Bootstrap, paths, command → skill table |
| `rbin-git-policy.mdc` | Never write git; suggest commits |

Verify: `rg 'alwaysApply: true' .cursor/rules` → only the two files above.

**Full guide:** [platforms/cursor.md](platforms/cursor.md) · **Token roadmap:** [OPTIMIZATION-PLAN.md](OPTIMIZATION-PLAN.md)

**Install profiles:** `rbin-task-flow init --profile minimal` → 2 always-on rules + skills only; `standard` (default) → all `.mdc` rules. Saved in `.task-flow/install-meta.json`.

**Team git:** `.task-flow` appended to `.gitignore`; other AI config files can be committed.

---

## Quick commands

| Say in Agent / Chat | Best invoke |
|---------------------|-------------|
| `task-flow: from contexts` | `@task-flow-from-contexts` |
| `task-flow: sync` | `@task-flow-sync` |
| `task-flow: run-split:N` | `@task-flow-run-split` |
| `task-flow: run next 4` | `@task-flow-run` |
| `task-flow: status` | `@task-flow-status` |
| `task-flow: validate` | `@task-flow-validate` |
| Implement feature code | the `coding_standards.mdc` checklist (explicit; checklist glob on `src/**`) |

**Avoid:** `@task_work` (short fallback only — prefer `@task-flow-run`).

---

## Rule modes (v1.23+)

| Layer | Examples | When loaded |
|-------|----------|-------------|
| **Always** | `task-flow-cursor`, `rbin-git-policy` | Every chat (~0,9k tokens) |
| **Skills** | `@task-flow-run`, `@task-flow-sync`, … | You invoke (recommended for run/sync/audit) |
| **Intelligent** | `task_work`, `task_audit`, `task_validate`, … | Agent matches `description` |
| **Glob** | `task-flow-sync`, `task_generation` (`.task-flow/**`), `coding_standards` (`src/**`, `app/**`), `code_comments` | Matching paths in chat |
| **Manual** | `@cursor_rules`, `@self_improve`, `@task_report`, legacy `git_control` | You `@`-mention only (no `description` auto-match) |

**Coding standards:** checklist in `coding_standards.mdc` (glob). Full reference: `.task-flow/guides/coding-standards-full.md` — **sections only**, never whole file.

If a command fails to trigger, use **`@task-flow-*`** explicitly.

---

## Agent vs Chat

| Surface | Best for |
|---------|----------|
| **Agent** (Composer) | `@task-flow-run`, multi-file implementation |
| **Chat** | `sync`, `status`, `estimate` |
| **@ files** | `@tasks.input.txt`, `@.task-flow/contexts/mockup.png` |

---

## Status updates (non-negotiable)

After each subtask:

1. `.task-flow/.internal/status.json` → subtask `done`
2. `.task-flow/tasks.status.md` → `- [x]` + regenerate 📊 Summary

---

## Graphify

Only during `run` / `validate` when `graphify-out/` exists. Does not replace Task Flow status. See [GRAPHIFY.md](GRAPHIFY.md).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Ignores task-flow | `rbin-task-flow reset --keep-tasks` |
| Run workflow wrong | **`@task-flow-run`** — avoid `@task_work` |
| Rule not applied | `@task-flow-<command>` for that workflow |
| Standards missing | File under `src/` or the `coding_standards.mdc` checklist |
| Context too large | Fewer `src/` files in chat; skills not full docs |
| Wrong always-on count | `reset --keep-tasks`; don't set `graphify.mdc` always-on |

---

## References

- [platforms/cursor.md](platforms/cursor.md) — full guide
- [README.md](../README.md) — all commands
- [AI-PLATFORMS.md](AI-PLATFORMS.md) — install matrix
- [Cursor Rules docs](https://cursor.com/docs/context/rules)
