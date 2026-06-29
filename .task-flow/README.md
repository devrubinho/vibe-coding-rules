# RBIN Task Flow - Quick Commands

## Layout

```text
.task-flow/
├── README.md              ← você está aqui
├── tasks.input.txt        ← defina tasks (`- descrição`)
├── tasks.status.md        ← progresso (auto; não editar)
├── contexts/              ← specs, mockups
├── dev-logs/              ← passos manuais + log da conversa (IA atualiza)
├── .internal/             ← tasks.json, status.json (sistema)
└── guides/                ← documentação e configs
    ├── AI-PLATFORMS.md
    ├── GRAPHIFY.md
    ├── CODEX.md · CURSOR.md
    ├── coding-standards-full.md  ← inclui padrão .env Vercel (§ Vercel)
    ├── platforms/         ← Claude, Cursor, Codex
    └── reports/           ← task-X-implementation.md

graphify-out/              ← grafo Graphify na raiz (init --graphify)
```

**Optimize by AI platform:**

| Platform | Guide |
|----------|--------|
| Index | [guides/AI-PLATFORMS.md](guides/AI-PLATFORMS.md) |
| Claude Code | [guides/platforms/claude-code.md](guides/platforms/claude-code.md) |
| Cursor | [guides/platforms/cursor.md](guides/platforms/cursor.md) |
| Codex | [guides/platforms/codex.md](guides/platforms/codex.md) |
| Graphify + Task Flow | [guides/GRAPHIFY.md](guides/GRAPHIFY.md) |
| Codex workflows | [guides/CODEX.md](guides/CODEX.md) |
| Cursor quick ref | [guides/CURSOR.md](guides/CURSOR.md) |
| Otimização (tokens) | [guides/OPTIMIZATION-PLAN.md](guides/OPTIMIZATION-PLAN.md) |
| Coding standards (full) | [guides/coding-standards-full.md](guides/coding-standards-full.md) (Vercel `.env` no topo) |

## Graphify (opcional)

O Task Flow **configura** a coexistência (regra `graphify-task-flow.mdc`, guia abaixo). O **grafo fica em `graphify-out/` na raiz** — padrão do Graphify CLI; não redirecionamos para dentro de `.task-flow/`.

**Pré-requisito:** CLI `graphify` no PATH (`rbin-install-dev`) + `claude` autenticado (Claude Code).

### Projeto novo

```bash
cd seu-projeto
rbin-task-flow init --graphify
```

### Projeto que já usa Task Flow (subir versão + migrar grafo)

```bash
npm install -g rbin-task-flow@latest
cd seu-projeto
rbin-task-flow reset --keep-tasks --graphify
```

**Manter suas tasks** ao subir versão (não sobrescreve `tasks.input.txt`, `tasks.status.md` nem `.internal/`):

```bash
npm install -g rbin-task-flow@latest
cd seu-projeto
rbin-task-flow reset --keep-tasks
```

O `reset --keep-tasks --graphify` reaplica rules/skills, limpa pasta legada `.task-flow/guides/graphify-out/` (se existir) e roda `graphify extract` na raiz.

### Só regerar o grafo (sem reinstall do template)

```bash
cd seu-projeto
graphify extract . --backend claude-cli
```

### Na IA (`task-flow: run`)

```text
task-flow: run next 2 — se graphify-out/ existir,
graphify query "<módulo>" --graph graphify-out/graph.json antes de editar.
```

Guia completo: [guides/GRAPHIFY.md](guides/GRAPHIFY.md).

## 🚀 Quick Commands

| Command | Variants | Description |
|---------|----------|-------------|
| `task-flow: from contexts` | `file.ext` · `a.png,b.md` | Draft `- tasks` in `tasks.input.txt` from files in `contexts/` (then run `sync`) |
| `task-flow: sync` | — | Complete synchronization: adds new, removes deleted, updates modified, preserves status |
| `task-flow: validate` | `all` (default) · `X` · `X,Y` | Deep audit vs codebase; revert false done; append gaps to `tasks.input.txt`; sync |
| `task-flow: status` | — | Shows current task status |
| `task-flow: run` | `next X` · `X` · `X,Y` · `all` | Execute pending subtasks; manual → `dev-logs/`, status `manual` |
| `task-flow: plan-split` | — | Recommend how many streams to split into (file-disjoint groups); does not execute |
| `task-flow: run-split:N` | `:3` · `:2` · `:3 50-72` | Run pending in **N** parallel streams (Claude: subagents; else `run` lines) — `:N` required |
| `task-flow: estimate` | `X` · `X,Y` · `all` | Time estimate for average developer pace (hours + management buffer) |
| `task-flow: report` | `X` · `X,Y` · `all` | Implementation report → `.task-flow/guides/reports/task-X-implementation.md` |
| `task-flow: audit` | — | Audits codebase against **coding standards checklist**; full doc on demand |

**See complete details below ↓**

---

## Detailed Commands

### `task-flow: from contexts`
Reads files in `.task-flow/contexts/` (images, PDF, text, JSON, etc.) and **appends** task lines to `tasks.input.txt`.

**Flow:** add context files → `from contexts` → `sync` → `run`.

**Variants:**
- `task-flow: from contexts` — all context files not yet linked in `tasks.input.txt`
- `task-flow: from contexts login-mockup.png` — one file
- `task-flow: from contexts mockup.png,spec.md` — comma-separated list

Each new line uses `task-flow-screen filename.ext` so sync/run attach the right context to subtasks.

Invoke: `@task-flow-from-contexts` / `/task-flow-from-contexts`.

### `task-flow: sync`
Complete synchronization between `tasks.input.txt` and the system:
- ✅ Adds new tasks from `tasks.input.txt`
- ✅ Removes tasks that were deleted from `tasks.input.txt`
- ✅ Updates tasks that were modified in `tasks.input.txt`
- ✅ Preserves status (`done`, `pending`, `manual`) of existing tasks
- ✅ Synchronizes status between `status.json` and `tasks.status.md` (ensures they are always aligned)

### `task-flow: validate`
Deep validation: checks subtasks against the codebase, reverts false `done`, appends lacunas to `tasks.input.txt`, and syncs. Invoke: `@task-flow-validate` / `/task-flow-validate`.

### `task-flow: status`
Shows current status of tasks and subtasks from the `tasks.status.md` file.

### `task-flow: audit`
Audits the **entire codebase** against the **checklist** in [coding_standards.mdc](../.cursor/rules/coding_standards.mdc). Deep reference: [guides/coding-standards-full.md](guides/coding-standards-full.md) (sections only, on demand). Non-destructive: reports gaps and suggests incremental improvements; the user chooses what to adopt. See [task_audit.mdc](../.cursor/rules/task_audit.mdc) for the full flow.

---

## Commands with Task ID

### `task-flow: plan-split`
Recommends **how many** parallel streams to use: analyzes pending tasks, groups them by file-disjointness, and proposes N (with the groups and what must run sequentially). **Does not execute** — pair with `run-split:N`. Invoke: `@task-flow-plan-split`.

### `task-flow: run-split:N`
Runs pending work in **N parallel streams** (`run-split:3`, `run-split:2`, …). **`:N` is required** — plain `run-split` is invalid. To pick N first, use `plan-split`.

**Examples:**
- `task-flow: run-split:3` — all pending, 3 streams
- `task-flow: run-split:2 50-72` — range, 2 streams

On **Claude**: dispatches one `task-runner` subagent per file-disjoint stream in parallel, then applies state centrally. On **Cursor/Codex**: outputs N copy-paste lines `task-flow: run id,id,id` + coordination notes. Invoke: `@task-flow-run-split`.

### `task-flow: run next X`
Works on next X **pending** subtasks. Resolves `manual` first by reading dev-logs and the current conversation.

- **Fully automatable** → `done`
- **Needs your action** → `manual` + `.task-flow/dev-logs/task-X.Y-manual.md`
- You report progress **in chat** (no extra command); the AI appends the **Conversation log** and marks `done` when verified

**Examples:**
- `task-flow: run next 4` → Next 4 pending subtasks
- `task-flow: run next` → Next 1 pending subtask

### `task-flow: run X` (simplified syntax)
Executes all **pending** subtasks of a specific task. Stops if a subtask requires manual intervention.

**⚠️ Dependency Check:**
- Only executes if all previous tasks (1, 2, ..., X-1) are completely finished
- Allows parallel work by multiple AIs without conflicts
- If there are pending previous tasks, warns which ones need to be completed first

**Examples:**
- `task-flow: run 1` → All pending subtasks of task 1 (can always execute)
- `task-flow: run 10,11` → All pending subtasks of tasks 10 and 11
- `task-flow: run all` → All pending subtasks of all tasks
- `task-flow: run 3` → Only executes if tasks 1 and 2 are complete

### `task-flow: estimate X` (simplified syntax)
Estimates time required to complete task(s) based on the real complexity of the task, assuming an average developer working at an average pace without AI acceleration. Subtask count informs scope, but is not the sole criterion.

**Syntax:** one ID (`1`), comma-separated IDs (`10,11`), or `all`.

**Output includes:**
- A single estimate range for the majority of developers
- Estimates in hours and business days
- Recommendation for management with buffer

**Examples:**
- `task-flow: estimate 1` → time estimate for task 1
- `task-flow: estimate 10,11` → time estimates for tasks 10 and 11
- `task-flow: estimate all` → time estimates for all tasks

### `task-flow: report X` (simplified syntax)
Generates a detailed implementation report for completed task(s) in Markdown format.

**Output:** `.task-flow/guides/reports/task-X-implementation.md`

**Examples:**
- `task-flow: report 1` → Report for task 1
- `task-flow: report 10,11` → Reports for tasks 10 and 11
