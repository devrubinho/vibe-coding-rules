# Changelog

## [Unreleased]

## [1.25.0] - 2026-06-06

**Minor release — `.task-flow/` enxuto na raiz; documentação em `guides/`.**

### Changed

- **Layout `.task-flow/`** — raiz: `tasks.input.txt`, `tasks.status.md`, `tasks.flow.md`, `README.md`, `contexts/`; resto em `.task-flow/guides/` (`platforms/`, `reports/`, `coding-standards-full.md`, Graphify, Codex, Cursor, etc.).
- **`rbin-task-flow update`** — migra projetos legados: remove `docs/`, `platforms/` e `.md` soltos na raiz; move reports para `guides/reports/`.
- **Paths** — rules, skills, `AGENTS.md`, `CLAUDE.md`, `lib/report.js` e install apontam para `.task-flow/guides/…`.

### Migration

```bash
npm install -g rbin-task-flow@1.25
cd your-project
rbin-task-flow update
```

Atualize prompts customizados: `.task-flow/GRAPHIFY.md` → `.task-flow/guides/GRAPHIFY.md` (idem `CODEX.md`, `platforms/`, `docs/`).

## [1.24.0] - 2026-06-05

**Minor release — comando `task-flow: validate` (verificação profunda + lacunas automáticas).**

### Added

- **`task-flow: validate`** — audita subtasks `done` e `pending` contra o código, reverte `done` falso, adiciona lacunas em `tasks.input.txt` e executa sync (sem perguntar).
- **Skill** `@task-flow-validate` / `/task-flow-validate` · **regra** `task_validate.mdc`.
- **15 skills** no `init` (antes 14).

### Changed

- Índices atualizados: `task-flow-cursor.mdc`, `CLAUDE.md`, `AGENTS.md`, `CODEX.md`, `README.md`, `GRAPHIFY.md`.
- Cross-refs em `think`, `review` e `task_analysis.mdc` distinguindo `validate` vs `think` vs `review`.

### Migration

```bash
npm install -g rbin-task-flow@1.24
cd your-project
rbin-task-flow update
```

Uso: `task-flow: validate` · `@task-flow-validate` · `/task-flow-validate`

## [1.23.1] - 2026-06-05

**Patch release — Graphify `--graphify` usa Claude Code CLI por padrão.**

### Changed

- **`--graphify`** (`init`, `update`, `reset`) — roda `graphify extract . --backend claude-cli` em vez de `graphify extract .` (evita erro `no LLM API key found` quando há assinatura Claude Code).
- **Docs** — `GRAPHIFY.md`, `README.md`, `graphify-task-flow.mdc`, CLI help e mensagens de install alinhados ao novo comando padrão.

### Migration

```bash
npm install -g rbin-task-flow@1.23.1
cd your-project
rbin-task-flow update --graphify   # opcional: regerar grafo com claude-cli
```

Requisitos para `--graphify`: CLI `graphify` no PATH + `claude` autenticado (Claude Code).

## [1.23.0] - 2026-06-02

**Minor release — token optimization** (breaking changes in Cursor rules; run `rbin-task-flow update` in each project).

### Breaking changes (Cursor / rules)

- **Always-on rules reduced to 2:** `task-flow-cursor.mdc`, `rbin-git-policy.mdc` (replaces separate always-on `git_control.mdc` + `commit_practices.mdc`).
- **`git_control.mdc` / `commit_practices.mdc`** — legacy stubs (`alwaysApply: false`); use `rbin-git-policy.mdc` + `@rbin-git`.
- **`coding_standards.mdc`** — compact checklist (~100 lines, glob `src/**` / `app/**` only); full reference in `.task-flow/guides/coding-standards-full.md` (by section on demand).
- **`task_work.mdc` / `task_execution.mdc`** — short fallbacks; prefer `@task-flow-run` and `task-flow-cursor.mdc` + skills.

### Added

- **`task-flow-sync.mdc`** — single primary rule for `task-flow: sync`.
- **`rbin-git-policy.mdc`** — unified always-on git policy.
- **`rbin-task-flow reset --graphify`** — reset template + optional `graphify extract`.
- **CLI `--profile minimal|standard`** — minimal = 2 always-on rules + skills; `.task-flow/install-meta.json`.
- **CLI `--share-ai-config`** — optional gitignore to commit `.cursor/skills/` and `.cursor/rules/`.
- **`npm run measure:rules`** — always-on size regression (default fail if > 5 KB).
- **`.task-flow/guides/OPTIMIZATION-PLAN.md`** · **`.task-flow/guides/OPTIMIZATION-IMPLEMENTATION-TASKS.md`**.

### Changed

- **14 skills** — `task-flow-run`, `task-flow-sync`, etc.; `rbin-coding-standards` with `disable-model-invocation: true`.
- **Sync** — `task_generation.mdc` (templates); `task_analysis.mdc` (`think` only); `task-flow-sync.mdc` primary.
- **P1 polish** — meta-rules `@` only; partial `tasks.json` in run; GRAPHIFY token discipline; install shows always-on KB.
- **Cursor docs** — skills-first; 2 always-on; no full standards every chat.
- **Audit / sync / Codex** — checklist scoring; full doc by section when needed.

### Migration

```bash
npm install -g rbin-task-flow@1.23
cd your-project
rbin-task-flow update
```

Optional: `--profile minimal`, `--share-ai-config`, `--graphify`.

After update: `rg 'alwaysApply: true' .cursor/rules` → **2** files. Use `@task-flow-run`, `@task-flow-sync`.

Template repo: `npm run measure:rules` (always-on ≤ 5 KB).

## [1.22.0] - 2026-06-02

### Added

- **Cursor optimization** — `task-flow-cursor.mdc` (always-on bootstrap); `.task-flow/guides/CURSOR.md`; `lib/cursor.js` on install.

### Changed

- **`.cursor/rules/`** — Only `task-flow-cursor`, `git_control`, and `commit_practices` use `alwaysApply: true`; other rules Apply Intelligently, by glob, or via `@skill` / `@rule`.
- **`coding_standards.mdc`** — activates for `src/**` and `app/**` instead of every session.

## [1.21.0] - 2026-06-02

### Added

- **Codex optimization** — `AGENTS.md` with embedded sync/run workflows; `.task-flow/guides/CODEX.md`; `.codex/config.toml`; `lib/codex.js`.

### Changed

- **`AGENTS.md`** — Codex-first.

## [1.20.0] - 2026-06-02
