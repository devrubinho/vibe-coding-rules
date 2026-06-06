# Claude Code — RBIN Task Flow

## Task flow = RBIN Task Flow

| Path | Purpose |
|------|---------|
| `.task-flow/tasks.input.txt` | Define tasks (`- description`) |
| `.task-flow/tasks.status.md` | Progress (auto; do not edit) |
| `.task-flow/.internal/` | `tasks.json`, `status.json` (system) |
| `.task-flow/contexts/` | Mockups, specs |

## Skills (prefer `/` commands)

| Action | Skill |
|--------|--------|
| Sync input → system | `/task-flow-sync` |
| Run subtasks | `/task-flow-run` |
| Status | `/task-flow-status` |
| Suggest new tasks | `/task-flow-think` |
| Lint + build | `/task-flow-check` |
| Audit repo | `/task-flow-audit` |
| Audit diff only | `/task-flow-improve-changes` |
| Verify done | `/task-flow-review` |
| Validate + fill gaps | `/task-flow-validate` |
| Refactor task code | `/task-flow-refactor` |
| Estimate hours | `/task-flow-estimate` |
| Implementation report | `/task-flow-report` |
| tasks.flow.md | `/task-flow-generate-flow` |
| Implement code | `/rbin-coding-standards` (invoke explicitly; checklist first, full doc sections only if needed) |
| Commit suggestion | `/rbin-git` |

Natural language `task-flow: …` works the same. Details: [.task-flow/README.md](.task-flow/README.md).

## Anti-patterns (save context)

- Prefer **`/task-flow-run`** (or `@task-flow-run`) for executing subtasks — avoid `@task_work` plus duplicate `.cursor/rules/task_work.mdc` in the same turn.
- Do **not** load `.task-flow/docs/coding-standards-full.md` unless the user asks for depth; use `/rbin-coding-standards` checklist or `coding_standards.mdc` for normal implementation.
- Cursor users: see [.task-flow/CURSOR.md](.task-flow/CURSOR.md) for always-on vs skills (`@task-flow-*`).

## Git

**Never** run `git add`, `commit`, `push`, `pull`, `merge`, `checkout`, `reset`, or `rebase`. Read-only git is OK. After work, use `/rbin-git` to suggest a Conventional Commit message.

## Graphify (optional)

During `/task-flow-run`, if `graphify-out/` exists, use `graphify query` before broad search. See [.task-flow/GRAPHIFY.md](.task-flow/GRAPHIFY.md).

## Cursor rules (reference)

Full procedures also live in `.cursor/rules/` (shared with Cursor). Claude Code should use **skills first** to save context.

## Other platforms

- Index: [.task-flow/AI-PLATFORMS.md](.task-flow/AI-PLATFORMS.md)
- Claude: [.task-flow/platforms/claude-code.md](.task-flow/platforms/claude-code.md)
- Codex: [AGENTS.md](AGENTS.md) · [.task-flow/CODEX.md](.task-flow/CODEX.md)

## Models

Use the default model of this environment; do not require a specific model name.
