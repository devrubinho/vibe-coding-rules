# Release 1.31.0 — publicação npm

Checklist para publicar **rbin-task-flow@1.31.0** (minor — determinismo, paralelismo e CLI enxuto).

## Semver

- **1.30.3** → **1.31.0** = minor (novos recursos + remoção/rename de comandos, no estilo do projeto — ver 1.26.0).

## O que entra nesta versão

### Novo

- **Guardrails (Claude):** hook `PreToolUse` bloqueia git-write; hook `PostToolUse` lembra de `sync`; allowlist read-only em `.claude/settings.json`.
- **`rbin-task-flow validate --schema`** — schema + integridade referencial (`lib/schemas/`).
- **`rbin-task-flow render-status`** — render determinístico de `tasks.status.md` (zero dep nova).
- **Subagents:** `task-runner`, `task-reviewer` (`.claude/agents/`).
- **`task-flow: run-split:N`** — dispatch de subagents em paralelo (Claude); Cursor/Codex seguem copy-paste.
- **`task-flow: plan-split`** — recomenda o N (grupos file-disjoint), sem executar.
- **Testes + CI:** `node:test` (22 testes) + GitHub Actions (Node 18/20/22).

### Alterado

- Skills/regras usam `render-status` (o modelo não reescreve mais o markdown).
- `task-flow: validate` roda `validate --schema` como passo 0.
- **`split:N` → `run-split:N`** (skill `task-flow-split` → `task-flow-run-split`).

### Removido

| Área | Removido |
|------|----------|
| CLI | `version-check`, `estimate`, `report`, `info` (+ `lib/version.js`, `lib/estimate.js`, `lib/report.js`) |
| Skills | `rbin-coding-standards`, `rbin-git` (política em `rbin-git-policy.mdc` + hook) |

### Mantido

- **CLI:** `init`, `reset`, `validate`, `render-status`
- **Skills de IA (10):** `from contexts` · `sync` · `validate` · `status` · `run` · `plan-split` · `run-split` · `estimate` · `report` · `audit`

## Pré-requisitos

- [ ] `npm whoami` OK
- [ ] Commit com versão **1.31.0**
- [ ] Tag `v1.31.0` (você cria)

## Verificação local

```bash
npm test                       # 22 passing
npm run measure:rules          # always-on ≤ 5 KB
ls .claude/skills/ | wc -l     # 10
node bin/cli.js --version      # 1.31.0
node bin/cli.js --help         # init, reset, validate, render-status
npm pack --dry-run
```

## Publicar (você executa)

```bash
git add package.json package-lock.json CHANGELOG.md RELEASE-1.31.0.md README.md \
  .task-flow/ AGENTS.md CLAUDE.md \
  .cursor/rules/ .claude/ \
  bin/cli.js lib/ test/ .github/

git commit -m "chore(release): v1.31.0 — determinism, parallelism, lean CLI

- Add git-write/sync hooks + read-only permissions allowlist
- Add validate --schema and render-status CLIs (JSON schemas, zero new deps)
- Add task-runner/task-reviewer subagents; run-split dispatch + plan-split
- Skills render status via CLI (fewer tokens, no drift)
- Add node:test suite (22) + GitHub Actions CI
- Rename split:N -> run-split:N; remove CLI version-check/estimate/report/info and rbin-git/rbin-coding-standards skills"

git tag -a v1.31.0 -m "v1.31.0 — determinism, parallelism, lean CLI"

npm publish

git push && git push origin v1.31.0
```

## Consumidores

```bash
npm install -g rbin-task-flow@1.31.0
cd your-project && rbin-task-flow reset --keep-tasks
```

Migração de comandos:

- `task-flow: split:N` → **`task-flow: run-split:N`** (decida o N com `task-flow: plan-split`)
- CLI `rbin-task-flow estimate/report` → skills `task-flow: estimate` / `task-flow: report`

## Pós-publish

- [ ] `npm view rbin-task-flow version` → `1.31.0`
- [ ] `rbin-task-flow init` em pasta vazia (confere `.claude/hooks/`, `.claude/agents/`, 10 skills)
- [ ] `rbin-task-flow reset --keep-tasks` em projeto existente
