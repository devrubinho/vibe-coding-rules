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
| Draft tasks from `contexts/` | `/task-flow-from-contexts` |
| Run subtasks | `/task-flow-run` |
| Recommend how many streams to split into | `/task-flow-plan-split` |
| Run pending in N parallel streams (`run-split:3`, `run-split:2`, …) | `/task-flow-run-split` |
| Status | `/task-flow-status` |
| Audit repo | `/task-flow-audit` |
| Validate + fill gaps | `/task-flow-validate` |
| Estimate hours (`X`, `X,Y`, `all`) | `/task-flow-estimate` |
| Implementation report | `/task-flow-report` |
| Implement code | `.cursor/rules/coding_standards.mdc` checklist (full doc `.task-flow/guides/coding-standards-full.md` only if needed) |
| Commit suggestion | suggest Conventional Commit; policy `.cursor/rules/rbin-git-policy.mdc` |

Natural language `task-flow: …` works the same. Details: [.task-flow/README.md](.task-flow/README.md).

## Skills vs `disable-model-invocation`

| Skill | Flag | Why |
|-------|------|-----|
| `task-flow-*` (`sync`, `run`, …) | `false` | You asked — `/task-flow-sync` and `task-flow: sync` must run the workflow |

If the Skill tool ever refuses a slash command, still execute the workflow: read `.claude/skills/task-flow-*/SKILL.md` or `.cursor/rules/task-flow-*.mdc` — **never** tell the user sync/run is "only manual".

## Anti-patterns (save context)

- Prefer **`/task-flow-run`** (or `@task-flow-run`) for executing subtasks — avoid `@task_work` plus duplicate `.cursor/rules/task_work.mdc` in the same turn.
- Do **not** load `.task-flow/guides/coding-standards-full.md` unless the user asks for depth; use the `.cursor/rules/coding_standards.mdc` checklist for normal implementation.
- Cursor users: see [.task-flow/guides/CURSOR.md](.task-flow/guides/CURSOR.md) for always-on vs skills (`@task-flow-*`).

## Git

**Never** run `git add`, `commit`, `push`, `pull`, `merge`, `checkout`, `reset`, or `rebase`. Read-only git is OK. After work, suggest a Conventional Commit message (policy: `.cursor/rules/rbin-git-policy.mdc`); you run git.

## Graphify (optional)

During `/task-flow-run`, if `.task-flow/guides/graphify-out/` exists, use `graphify query` with `--graph .task-flow/guides/graphify-out/graph.json` before broad search. See [.task-flow/guides/GRAPHIFY.md](.task-flow/guides/GRAPHIFY.md).

## Cursor rules (reference)

Full procedures also live in `.cursor/rules/` (shared with Cursor). Claude Code should use **skills first** to save context.

## Other platforms

- Index: [.task-flow/guides/AI-PLATFORMS.md](.task-flow/guides/AI-PLATFORMS.md)
- Claude: [.task-flow/guides/platforms/claude-code.md](.task-flow/guides/platforms/claude-code.md)
- Codex: [AGENTS.md](AGENTS.md) · [.task-flow/guides/CODEX.md](.task-flow/guides/CODEX.md)

## Models

Use the default model of this environment; do not require a specific model name.
