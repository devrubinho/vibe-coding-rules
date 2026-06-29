---
name: task-flow-plan-split
description: Recommends how many parallel streams to split pending RBIN Task Flow work into. Analyzes pending tasks, groups them by file-disjointness, and proposes N (with the groups and what must run sequentially). Does NOT execute — pair with task-flow run-split:N. Use for task-flow plan-split, how many splits, quantos splits rodar.
disable-model-invocation: false
paths: [".task-flow/**"]
---

# Task Flow — Plan Split

Answers "how many streams should I run?" before `task-flow: run-split:N`. **Plans only — never implements or changes state.**

## Status

!`head -20 .task-flow/tasks.status.md 2>/dev/null || echo "Run sync first"`

## Steps

1. `rbin-task-flow validate --schema` for a clean baseline; load **pending** task/subtask ids from `status.json`; read `tasks.json` for those tasks.
2. For each pending task, determine the **files/areas it will touch** (from its `instructions` + cited `.task-flow/contexts/`). If `.task-flow/guides/graphify-out/graph.json` exists, use `graphify query "<module>"` to confirm boundaries.
3. **Group by file-disjointness:** tasks that touch the same file/area go in the same group; keep dependency chains together. The number of independent groups = the natural ceiling for N.
4. **Recommend N** = number of file-disjoint groups, **capped at 3–4** for review-ability. If 1 group (everything overlaps) → recommend running sequentially, no split.
5. Output the recommendation; the user then runs `task-flow: run-split:N`.

## Output format

```
Recommended: run-split:<N>

Parallel groups (file-disjoint):
- Group 1: tasks <ids> — touches <area>
- Group 2: tasks <ids> — touches <area>
- Group 3: tasks <ids> — touches <area>

Sequential (would conflict — do NOT parallelize):
- task <X> after <Y> (both touch <file/area>)

Why N: <independent groups, capped reasoning>
Next: task-flow: run-split:<N>
```

## Notes

- This is the decision step; **execution** is `task-flow: run-split:N` (see `task-flow-run-split`).
- N never exceeds the number of independent groups — proposing more just collapses back.
- When in doubt, recommend a lower N (start at 2). The risk is parallelizing conflicting files, never under-splitting.
