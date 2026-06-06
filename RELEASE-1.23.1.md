# Release 1.23.1 — publicação npm

Checklist para publicar **rbin-task-flow@1.23.1** (patch — Graphify `--graphify` com `--backend claude-cli`).

## Semver

- **1.23.0** → **1.23.1** = bump do **último número** (patch).
- Sem breaking changes nas regras Cursor.

## O que entra nesta versão

- `init --graphify`, `update --graphify`, `reset --graphify` → `graphify extract . --backend claude-cli`
- Documentação e mensagens CLI atualizadas (`GRAPHIFY.md`, `README.md`, `graphify-task-flow.mdc`)

## Pré-requisitos

- [ ] `npm whoami` OK
- [ ] Commit com versão 1.23.1
- [ ] Tag `v1.23.1` (você cria)

## Verificação local

```bash
npm run measure:rules
rg 'alwaysApply: true' .cursor/rules   # 2 arquivos
npm pack --dry-run
```

## Publicar (você executa)

```bash
git add package.json CHANGELOG.md RELEASE-1.23.1.md README.md \
  lib/graphify.js lib/utils.js bin/cli.js install.sh \
  .task-flow/GRAPHIFY.md .task-flow/AI-PLATFORMS.md .task-flow/platforms/cursor.md \
  .cursor/rules/graphify-task-flow.mdc

git commit -m "chore(release): v1.23.1 — Graphify --graphify uses claude-cli backend"

git tag -a v1.23.1 -m "v1.23.1 — Graphify claude-cli default"

npm publish

git push && git push origin v1.23.1
```

## Consumidores (1.23.0 → 1.23.1)

```bash
npm install -g rbin-task-flow@1.23.1
cd your-project && rbin-task-flow update
```

Opcional — regerar grafo com backend Claude Code:

```bash
rbin-task-flow update --graphify
# ou manualmente:
graphify extract . --backend claude-cli
```

## Pós-publish

- [ ] `npm view rbin-task-flow version` → `1.23.1`
