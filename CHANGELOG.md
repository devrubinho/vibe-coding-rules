# Changelog

## [Unreleased]

## [1.31.2] - 2026-06-05

**Patch — Graphify usa pasta padrão na raiz (sem forçar `.task-flow/`).**

### Changed

- Task Flow **configura** Graphify (regra, guia, `.gitignore`, `--graphify` roda extract) mas **não redireciona** output — grafo em `graphify-out/` na raiz, como o CLI já faz.
- Remove pasta legada `.task-flow/guides/graphify-out/` de versões que tentavam forçar output dentro do Task Flow.
- `GRAPHIFY.md` e mensagens do instalador deixam essa divisão explícita.

### Migration

```bash
npm install -g rbin-task-flow@1.31.2
cd your-project && rbin-task-flow reset --keep-tasks
# opcional: rbin-task-flow reset --keep-tasks --graphify
```

## [1.31.1] - 2026-06-05

**Patch — Graphify na raiz do projeto.**

### Changed

- Saída do Graphify em **`graphify-out/`** na raiz (padrão do CLI) — não mais em `.task-flow/guides/graphify-out/`.
- `graphify extract . --backend claude-cli` sem `--out .task-flow/guides`.
- `init` / `reset --graphify` migra grafo legado de `.task-flow/guides/graphify-out/` → raiz.
- `.gitignore` do projeto: `.task-flow` + `graphify-out` no final.

### Migration

```bash
npm install -g rbin-task-flow@1.31.1
cd your-project && rbin-task-flow reset --keep-tasks --graphify
```

Use `graphify-out/graph.json` nos prompts (não `.task-flow/guides/graphify-out/graph.json`).

## [1.31.0] - 2026-06-29

**Minor — determinismo, paralelismo e CLI enxuto.**

### Added

- **Guardrails (Claude):** hook `PreToolUse` que bloqueia git-write (`add/commit/push/...`) e hook `PostToolUse` que lembra de `sync` ao editar `tasks.input.txt`; allowlist de permissões read-only em `.claude/settings.json`.
- **`rbin-task-flow validate --schema`** — valida `tasks.json`/`status.json` contra JSON schemas + integridade referencial (status↔tasks). Schemas em `lib/schemas/`.
- **`rbin-task-flow render-status`** — renderiza `tasks.status.md` de forma determinística a partir do estado (zero dependência nova).
- **Subagents (Claude):** `task-runner` e `task-reviewer` em `.claude/agents/`.
- **`task-flow: run-split:N`** — executa pendências em N streams paralelos via subagents (orquestrador aplica estado centralmente). Cursor/Codex continuam no modo copy-paste.
- **`task-flow: plan-split`** — recomenda o N (grupos file-disjoint) sem executar.
- **Testes + CI:** suíte `node:test` (22 testes) e workflow GitHub Actions (Node 18/20/22).

### Changed

- **Skills/regras** agora chamam `render-status` em vez de o modelo reescrever `tasks.status.md` (menos tokens, sem drift).
- **`task-flow: validate`** roda `validate --schema` como passo 0 antes da auditoria contra o código.
- Renomeado **`split:N` → `run-split:N`** (skill `task-flow-split` → `task-flow-run-split`).

### Removed

| Área | Removido |
|------|----------|
| CLI | `version-check`, `estimate`, `report`, `info` (+ `lib/version.js`, `lib/estimate.js`, `lib/report.js`) |
| Skills | `rbin-coding-standards`, `rbin-git` (política de git permanece em `rbin-git-policy.mdc` + hook) |

CLI final: `init`, `reset`, `validate`, `render-status`. Skills: 10 (inclui `run-split` + `plan-split`). As skills de IA `estimate`/`report` permanecem (as versões CLI redundantes foram removidas).

### Migration

```bash
npm install -g rbin-task-flow@1.31.0
cd your-project && rbin-task-flow reset --keep-tasks
```

- Quem usava `task-flow: split:N` deve usar **`run-split:N`** (e `plan-split` para decidir o N).
- Quem usava o CLI `rbin-task-flow estimate/report` deve usar as skills `task-flow: estimate` / `task-flow: report`.

## [1.30.3] - 2026-06-05

**Patch — `.gitignore` sem comentários.**

### Changed

- **`init` / `reset`** — acrescenta só `.task-flow` ao final do `.gitignore` do projeto (sem bloco nem comentários RBIN).

### Migration

```bash
npm install -g rbin-task-flow@1.30.3
cd your-project && rbin-task-flow reset --keep-tasks
```

## [1.30.2] - 2026-06-05

**Patch — `.gitignore` só `.task-flow/`.**

### Changed

- **`init` / `reset`** — no projeto destino, o `.gitignore` ignora **apenas** `.task-flow/` (remove `.claude/`, `.cursor/`, `CLAUDE.md`, `AGENTS.md` do bloco RBIN).
- Reinstalação limpa entradas legadas do bloco anterior.

### Migration

```bash
npm install -g rbin-task-flow@1.30.2
cd your-project && rbin-task-flow reset --keep-tasks
```

## [1.30.1] - 2026-06-05

**Patch — manual completion via conversation, sem `confirm`.**

### Removed

- **`task-flow: confirm`** — skill `task-flow-confirm` e regra `task_confirm.mdc`.

### Changed

- Subtarefas `manual`: IA atualiza **Conversation log** em `dev-logs/` a partir do chat e marca `done` quando verificar que está completo — sem comando separado.

### Migration

```bash
npm install -g rbin-task-flow@1.30.1
cd your-project && rbin-task-flow reset --keep-tasks
```

## [1.30.0] - 2026-06-05

**Minor — intervenção manual no `run`.**

### Added

- Status **`manual`** para subtarefas que exigem ação do usuário (deploy, console, credenciais…).
- Pasta **`.task-flow/dev-logs/`** com `task-X.Y-manual.md` (passos + conversation log).
- IA marca `done` quando o log + conversa confirmam conclusão — sem comando `confirm` (removido em 1.30.1).

### Changed

- **`task-flow: run`** — não marca `done` nem gera `guides/reports/` quando há passos manuais; para na subtarefa e aponta o dev-log.
- **`task-flow: report`** — explícito: só após task 100% `done` (sem `manual`).

### Migration

```bash
npm install -g rbin-task-flow@1.30.0
cd your-project && rbin-task-flow reset --keep-tasks
```

## [1.29.0] - 2026-06-05

**Breaking — remove `rbin-task-flow update`.**

### Removed

- **`rbin-task-flow update`** — use `reset` ou `reset --keep-tasks` em vez disso.

### Migration

```bash
npm install -g rbin-task-flow@1.29.0
cd your-project

# Subir versão mantendo tasks (substitui update --keep-tasks)
rbin-task-flow reset --keep-tasks

# Com graphify
rbin-task-flow reset --keep-tasks --graphify

# Reinstalar do zero (substitui update sem keep-tasks em projetos novos: use init)
rbin-task-flow reset
```

## [1.28.0] - 2026-06-05

**Minor release — `--keep-tasks` no CLI.**

### Added

- **`--keep-tasks`** em `reset` — preserva `tasks.input.txt`, `tasks.status.md` e `.internal/` ao subir a versão do pacote ou recriar o template.
- Combinável com `--graphify`: `rbin-task-flow reset --keep-tasks --graphify`.

### Migration

```bash
npm install -g rbin-task-flow@1.28.0
cd your-project && rbin-task-flow reset --keep-tasks
# ou, com grafo:
rbin-task-flow reset --keep-tasks --graphify
```

## [1.27.1] - 2026-06-13

**Patch — `split:N` obrigatório.**

### Changed

- **`task-flow: split:N`** — `N` é obrigatório (`split:3`, `split:2`). Plain `task-flow: split` **não existe** mais.
- Escopo opcional após N: `split:3 50-72`, `split:2 50,51,69`.

### Migration

```bash
npm install -g rbin-task-flow@1.27.1
cd your-project && rbin-task-flow update
```

Use `task-flow: split:3` em vez de `task-flow: split`.

## [1.27.0] - 2026-06-13

**Minor release — `task-flow: split` (3 IAs em paralelo).**

### Added

- **`task-flow: split`** — planeja 3 filas de tasks pendentes sem conflito de arquivos, ordenadas por dificuldade (🟣 IA forte / 🟢 / 🔵); output `task-flow: run X,Y,Z` copiável por sessão. **Não implementa** — só plano.
- Variantes: `split` (todas pending), `split 50-72`, `split 50,51,69`.
- Skill `@task-flow-split` · regra `task_split.mdc`.

### Changed

- **11 skills** no `init` (antes 10).

### Migration

```bash
npm install -g rbin-task-flow@1.27.0
cd your-project && rbin-task-flow update
```

## [1.26.1] - 2026-06-05

**Patch — `disable-model-invocation` nos skills `task-flow-*`.**

### Fixed

- **`task-flow-*` skills** (`sync`, `run`, `validate`, …): `disable-model-invocation: false` — `/task-flow-sync` e `task-flow: sync` voltam a executar no Claude Code (antes `true` bloqueava o Skill tool).
- **`rbin-coding-standards`** mantém `true` (referência pesada; só ao implementar código).
- `CLAUDE.md` + guia Claude: nunca dizer que sync/run é "só manual" se o Skill tool falhar — ler `workflow.md` / `.mdc`.

### Migration

```bash
npm install -g rbin-task-flow@1.26.1
cd your-project && rbin-task-flow update
```

Reinicie o Claude Code se `.claude/skills/` já existia na sessão.

## [1.26.0] - 2026-06-05

**Minor release — `from contexts` + comandos enxutos (10 skills).**

Pacote npm desde **1.25.1**: inclui também **1.25.2–1.25.5** (remoções de CLI/comandos IA, Graphify em `guides/`, `estimate` com `all`).

### Added

- **`task-flow: from contexts`** — lê `.task-flow/contexts/` (imagem, PDF, texto, JSON, etc.) e **append** de `- tasks` em `tasks.input.txt` com `task-flow-screen arquivo.ext`; depois rode `sync`.
- Variantes: todos os contexts novos, ou `file.png`, ou `a.png,b.md`.
- Skill `@task-flow-from-contexts` / regra `task_from_contexts.mdc`.

### Removed (desde 1.25.1)

- Comandos IA: `check`, `improve changes`, `generate flow`, `review`, `refactor`, `think` (skills + `.mdc`).
- CLI: `rbin-task-flow check`, `rbin-task-flow audit` (`lib/check.js`, `lib/audit.js`).
- Stub `tasks.flow.md` no install.

### Changed

- **10 skills** no `init` (era 15 em 1.24): `sync`, `from-contexts`, `run`, `status`, `validate`, `estimate`, `report`, `audit`, `rbin-coding-standards`, `rbin-git`.
- **Graphify** → `.task-flow/guides/graphify-out/`; `update --graphify` migra `graphify-out/` legado da raiz.
- **`task-flow: estimate`** — `X`, `X,Y`, `all` documentado (CLI já suportava).
- Quick Commands em `.task-flow/README.md` com coluna **Variants** (`run`, `estimate`, `report`, `validate`).
- Validação de implementação: **`task-flow: validate`** (substitui review/think para lacunas).

### Migration

```bash
npm install -g rbin-task-flow@1.26.0
cd your-project && rbin-task-flow update
# opcional: rbin-task-flow update --graphify
```

Fluxo com contexts: arquivos em `.task-flow/contexts/` → `task-flow: from contexts` → `task-flow: sync` → `task-flow: run next X`.

## [1.25.5] - 2026-06-05

**Patch release — remove `think`.**

### Removed

- **`task-flow: think`** — skill `task-flow-think`, regra `task_analysis.mdc`, documentação.

### Changed

- Lacunas e novas tasks: edite `tasks.input.txt` manualmente ou use **`task-flow: validate`** (append automático).
- **9 skills** no `init` (antes 10).

### Migration

```bash
npm install -g rbin-task-flow@1.25.5
cd your-project && rbin-task-flow update
```

## [1.25.4] - 2026-06-05

**Patch release — remove `review` e `refactor`.**

### Removed

- **`task-flow: review X`** e **`task-flow: refactor X`** — skills, regras `.mdc` e documentação.

### Changed

- Validação de implementação: use **`task-flow: validate`** (`@task-flow-validate`).
- **10 skills** no `init` (antes 12).

### Migration

```bash
npm install -g rbin-task-flow@1.25.4
cd your-project && rbin-task-flow update
```

## [1.25.3] - 2026-06-05

**Patch release — remove `generate flow`; `estimate` com `X,Y` e `all`.**

### Removed

- **`task-flow: generate flow`** — skill, regra `task_generate_flow.mdc`, stub `tasks.flow.md` no install.
- Keyword npm `generate-flow`.

### Changed

- **`task-flow: estimate`** — documentado e na skill: `estimate 1`, `estimate 1,2`, `estimate all` (CLI já suportava).
- **12 skills** no `init` (antes 13).

### Migration

```bash
npm install -g rbin-task-flow@1.25.3
cd your-project && rbin-task-flow update
```

## [1.25.2] - 2026-06-05

**Patch release — remove `check` e `improve changes`.**

### Removed

- **`task-flow: check`** e **`task-flow: improve changes`** — skills, regras `.mdc` e documentação.
- **`rbin-task-flow check`** (CLI) e `lib/check.js`.

### Changed

- **Graphify + Task Flow** — saída em `.task-flow/guides/graphify-out/` (`graphify extract … --out .task-flow/guides`); migra `graphify-out/` legado da raiz no `update`; remove `graphify-out/` do template `.gitignore`.
- **Removido** `rbin-task-flow audit` (CLI) — use `task-flow: audit` na IA (`@task-flow-audit`).
- **13 skills** no `init` (antes 15).

### Migration

```bash
npm install -g rbin-task-flow@1.25.2
cd your-project && rbin-task-flow update
```

## [1.25.1] - 2026-06-06

**Patch release — padrão `.env` para projetos Vercel nos coding standards.**

### Added

- **Vercel — environment variables** em `coding-standards-full.md` (§0–§8): 3 arquivos espelhados (`.env.example`, `.env.local`, `.env.production`), scripts `env-files-check.sh` e `vercel-env-sync.sh`, critérios de aceite.
- Checklist `coding_standards.mdc` e `@rbin-coding-standards` referenciam a seção Vercel.

### Migration

```bash
npm install -g rbin-task-flow@1.25.1
cd your-project && rbin-task-flow update
```

Projetos Vercel: peça à IA seguir **Vercel — environment variables** em `.task-flow/guides/coding-standards-full.md`.

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
