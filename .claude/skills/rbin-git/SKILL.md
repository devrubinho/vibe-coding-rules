---
name: rbin-git
description: Suggests Conventional Commit messages after RBIN Task Flow work. Use after completing a subtask or task, when the user asks for a commit message, or when uncommitted changes exist. Never executes git add, commit, push, or other write git commands.
disable-model-invocation: false
---

# RBIN — Git (suggest only)

Complements `.cursor/rules/rbin-git-policy.mdc` (always-on).

## Prohibited (never run)

`git add`, `git commit`, `git push`, `git pull`, `git merge`, `git checkout`, `git reset`, `git rebase`, `git tag`, or any git command that modifies the repo.

## Allowed (read-only)

`git status`, `git diff`, `git log`, `git show`, `git branch` (list only).

## After subtask/task done

1. Run read-only: `git status --short`, `git diff --stat` (optional).
2. Include Task/Subtask ID and title from Task Flow context.
3. Use Conventional Commits: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.

## Suggestion format

```bash
git add .
git commit -m "feat(scope): Short description

- Detail 1
- Subtask ID: 3.2"
```

Present ready to copy. User runs git manually.

## Reference

Primary: `.cursor/rules/rbin-git-policy.mdc` · Extended: `git_control.mdc`, `commit_practices.mdc` (legacy)
