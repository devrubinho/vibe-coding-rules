# Release 1.26.0 — publicação npm

Checklist para publicar **rbin-task-flow@1.26.0** (minor — `from contexts` + stack enxuta de comandos/skills).

## Semver

- **1.25.1** → **1.26.0** = minor (`from contexts` + remoções acumuladas 1.25.2–1.25.5).

## O que entra nesta versão

### Novo

- **`task-flow: from contexts`** — draft de tasks em `tasks.input.txt` a partir de `.task-flow/contexts/`
- Skill `@task-flow-from-contexts` · regra `task_from_contexts.mdc`

### Removido (1.25.2–1.25.5)

| Área | Removido |
|------|----------|
| IA | `check`, `improve changes`, `generate flow`, `review`, `refactor`, `think` |
| CLI | `rbin-task-flow check`, `rbin-task-flow audit` |

### Mantido (comandos IA principais)

`sync` · `from contexts` · `validate` · `status` · `run` · `estimate` · `report` · `audit`

### Skills (10)

```bash
ls .claude/skills/
# task-flow-audit task-flow-estimate task-flow-from-contexts task-flow-report
# task-flow-run task-flow-status task-flow-sync task-flow-validate
# rbin-coding-standards rbin-git
```

## Pré-requisitos

- [ ] `npm whoami` OK
- [ ] Commit com versão **1.26.0**
- [ ] Tag `v1.26.0` (você cria)

## Verificação local

```bash
npm run measure:rules          # always-on ≤ 5 KB
ls .claude/skills/ | wc -l     # 10
node bin/cli.js --version      # 1.26.0
npm pack --dry-run
```

## Publicar (você executa)

```bash
git add package.json CHANGELOG.md RELEASE-1.26.0.md README.md \
  .task-flow/ AGENTS.md CLAUDE.md \
  .cursor/rules/ .claude/skills/ \
  bin/cli.js install.sh lib/ scripts/

git commit -m "chore(release): v1.26.0 — from contexts, lean commands (10 skills)

- Add task-flow: from contexts (@task-flow-from-contexts)
- Remove check, improve changes, generate flow, review, refactor, think
- Remove CLI check and audit; Graphify under guides/graphify-out/
- 10 skills; estimate/report/validate variants documented"

git tag -a v1.26.0 -m "v1.26.0 — from contexts + lean task-flow commands"

npm publish

git push && git push origin v1.26.0
```

## Consumidores

```bash
npm install -g rbin-task-flow@1.26.0
cd your-project && rbin-task-flow update
```

Com Graphify:

```bash
rbin-task-flow update --graphify
```

Fluxo contexts:

```text
# 1. Coloque mockups/specs em .task-flow/contexts/
# 2. Na IA:
task-flow: from contexts
task-flow: sync
task-flow: run next 3
```

## Pós-publish

- [ ] `npm view rbin-task-flow version` → `1.26.0`
- [ ] Testar `rbin-task-flow init` em pasta vazia
- [ ] Testar `rbin-task-flow update` em projeto existente
