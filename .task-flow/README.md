# RBIN Task Flow - Quick Commands

## Layout

```text
.task-flow/
├── README.md              ← você está aqui
├── tasks.input.txt        ← defina tasks (`- descrição`)
├── tasks.status.md        ← progresso (auto; não editar)
├── contexts/              ← specs, mockups
├── .internal/             ← tasks.json, status.json (sistema)
└── guides/                ← documentação e configs
    ├── AI-PLATFORMS.md
    ├── GRAPHIFY.md
    ├── CODEX.md · CURSOR.md
    ├── coding-standards-full.md  ← inclui padrão .env Vercel (§ Vercel)
    ├── platforms/         ← Claude, Cursor, Codex
    ├── graphify-out/      ← grafo Graphify (init --graphify)
    └── reports/           ← task-X-implementation.md
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

Grafo em **`.task-flow/guides/graphify-out/`** (não na raiz do projeto).

**Pré-requisito:** CLI `graphify` no PATH (`rbin-install-dev`) + `claude` autenticado (Claude Code).

### Projeto novo

```bash
cd seu-projeto
rbin-task-flow init --graphify
```

### Projeto que já usa Task Flow (atualizar pacote + migrar grafo)

```bash
npm install -g rbin-task-flow@latest
cd seu-projeto
rbin-task-flow update --graphify
```

O `update --graphify` reaplica rules/skills, move `graphify-out/` legado da raiz para `guides/graphify-out/` (se existir) e roda o extract.

### Só regerar o grafo (sem reinstall do template)

```bash
cd seu-projeto
graphify extract . --backend claude-cli --out .task-flow/guides
```

### Na IA (`task-flow: run`)

```text
task-flow: run next 2 — se .task-flow/guides/graphify-out/ existir,
graphify query "<módulo>" --graph .task-flow/guides/graphify-out/graph.json antes de editar.
```

Guia completo: [guides/GRAPHIFY.md](guides/GRAPHIFY.md).

## 🚀 Quick Commands

| Command | Variants | Description |
|---------|----------|-------------|
| `task-flow: from contexts` | `file.ext` · `a.png,b.md` | Draft `- tasks` in `tasks.input.txt` from files in `contexts/` (then run `sync`) |
| `task-flow: sync` | — | Complete synchronization: adds new, removes deleted, updates modified, preserves status |
| `task-flow: validate` | `all` (default) · `X` · `X,Y` | Deep audit vs codebase; revert false done; append gaps to `tasks.input.txt`; sync |
| `task-flow: status` | — | Shows current task status |
| `task-flow: run` | `next X` · `X` · `X,Y` · `all` | Execute pending subtasks: next N in order, one/many tasks, or everything |
| `task-flow: split` | `:3` · `:2` · `:3 50-72` | Plan **N** parallel `run` lines — `:N` required |
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
- ✅ Preserves status (done/pending) of existing tasks
- ✅ Synchronizes status between `status.json` and `tasks.status.md` (ensures they are always aligned)

### `task-flow: validate`
Deep validation: checks subtasks against the codebase, reverts false `done`, appends lacunas to `tasks.input.txt`, and syncs. Invoke: `@task-flow-validate` / `/task-flow-validate`.

### `task-flow: status`
Shows current status of tasks and subtasks from the `tasks.status.md` file.

### `task-flow: audit`
Audits the **entire codebase** against the **checklist** in [coding_standards.mdc](../.cursor/rules/coding_standards.mdc). Deep reference: [guides/coding-standards-full.md](guides/coding-standards-full.md) (sections only, on demand). Non-destructive: reports gaps and suggests incremental improvements; the user chooses what to adopt. See [task_audit.mdc](../.cursor/rules/task_audit.mdc) for the full flow.

---

## Commands with Task ID

### `task-flow: split:N`
Plans **parallel work across N IAs** (`split:3`, `split:2`, …). **`:N` is required** — plain `split` is invalid.

**Examples:**
- `task-flow: split:3` — all pending, 3 streams
- `task-flow: split:2 50-72` — range, 2 streams

Output: N copy-paste lines `task-flow: run id,id,id` + coordination notes. Invoke: `@task-flow-split`.

### `task-flow: run next X`
Works on next X pending subtasks in sequential order. Implements and marks as "done".

**Examples:**
- `task-flow: run next 4` → Next 4 subtasks
- `task-flow: run next` → Next 1 subtask

### `task-flow: run X` (simplified syntax)
Executes all pending subtasks of a specific task. Implements and marks as "done".

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

**CLI:** `rbin-task-flow estimate 1` · `rbin-task-flow estimate 1,2` · `rbin-task-flow estimate all`

### `task-flow: report X` (simplified syntax)
Generates a detailed implementation report for completed task(s) in Markdown format.

**Output:** `.task-flow/guides/reports/task-X-implementation.md`

**Examples:**
- `task-flow: report 1` → Report for task 1
- `task-flow: report 10,11` → Reports for tasks 10 and 11
