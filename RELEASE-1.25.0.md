# Release 1.25.0 — publicação npm

Checklist para publicar **rbin-task-flow@1.25.0** (minor — layout `.task-flow/guides/`).

## Semver

- **1.24.0** → **1.25.0** = bump do **número do meio** (minor — reorganização de pastas).
- `update` migra layout legado automaticamente.

## O que entra nesta versão

- Raiz `.task-flow/`: só tasks + README + `contexts/`
- `guides/`: Graphify, Codex, Cursor, platforms, standards, reports
- `lib/install.js`: `migrateLegacyTaskFlowLayout()` no init/update
- Paths atualizados em rules, skills, CLI messages

## Pré-requisitos

- [ ] `npm whoami` OK
- [ ] Commit com versão 1.25.0
- [ ] Tag `v1.25.0` (você cria)

## Verificação local

```bash
npm run measure:rules
rg 'alwaysApply: true' .cursor/rules   # 2 arquivos
find .task-flow -type f | sort          # sem GRAPHIFY.md na raiz
npm pack --dry-run
```

## Publicar (você executa)

```bash
git add package.json CHANGELOG.md RELEASE-1.25.0.md README.md \
  install.sh lib/install.js lib/report.js lib/codex.js lib/cursor.js lib/graphify.js lib/utils.js \
  .task-flow/ \
  .cursor/rules/ .claude/skills/ \
  AGENTS.md CLAUDE.md

git commit -m "chore(release): v1.25.0 — slim .task-flow root, guides/ folder"

git tag -a v1.25.0 -m "v1.25.0 — .task-flow/guides layout"

npm publish

git push && git push origin v1.25.0
```

## Consumidores (1.24.x → 1.25.0)

```bash
npm install -g rbin-task-flow@1.25
cd your-project && rbin-task-flow update
```

## Pós-publish

- [ ] `npm view rbin-task-flow version` → `1.25.0`
- [ ] Raiz do projeto: `.task-flow/guides/` existe; sem `GRAPHIFY.md` solto na raiz
