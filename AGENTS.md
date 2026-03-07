# Project norms (Codex)

This repo follows the same development norms as in `.cursor/rules/` and `CLAUDE.md`. When working here, follow these rules.

## Git

- **Never run** `git add`, `git commit`, `git push`, `git pull`, `git merge`, `git checkout`, `git reset`, `git rebase`, etc.
- **Only suggest** git commands; the user runs them.
- You **may** run read-only git: `git status`, `git diff`, `git log`, `git show`, `git branch` (list only).

## Commits

- After completing tasks, **suggest** a commit message (Conventional Commits: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`).
- Include task/subtask ID when relevant, e.g. `Task ID: 3.2`.

## Code and comments

- **No explanatory comments** in code; keep code self-explanatory via names.
- **Document non-obvious or complex topics** in `dev-logs/` (markdown).
- **Allowed comments**: only section separators in this form:
  ```text
  // ────────────────────────────────
  // Section Name
  // ────────────────────────────────
  ```

## RBIN Task Flow

- **Task flow** always means **RBIN Task Flow**.
- Tasks: `.task-flow/tasks.input.txt` (format: `- Task description`).
- Status: `.task-flow/tasks.status.md` and `.task-flow/.internal/status.json`.
- **Commands** to support: `task-flow: sync`, `task-flow: think`, `task-flow: audit`, `task-flow: status`, `task-flow: run next X`, `task-flow: run X` (or `X,Y` / `all`), `task-flow: review X`, `task-flow: refactor X`, `task-flow: estimate X`, `task-flow: report X`.
- When running `task-flow: audit`: scan the codebase, score it against `.cursor/rules/coding_standards.mdc`, present a report, and ask the user which improvements to adopt — never impose changes.
- When running subtasks: read `.task-flow/.internal/tasks.json` and `status.json`, implement, then update `status.json` and `tasks.status.md` (mark done, refresh summary).
- Use context from `.task-flow/contexts/` when subtask instructions reference it.

## Full rules

For complete wording and examples, see:

- `CLAUDE.md` – overview and task-flow commands
- `.cursor/rules/` – all rules (git, commits, comments, task-flow, etc.)
