# Release 1.23.0 — publicação npm

Checklist para publicar **rbin-task-flow@1.23.0** (minor — otimização de tokens; breaking changes nas regras Cursor).

## Semver

- **1.22.0** → **1.23.0** = bump do **número do meio** (minor).
- Não é `2.0.0` (isso seria major — primeiro número).

## Pré-requisitos

- [ ] `npm whoami` OK
- [ ] Commit com versão 1.23.0
- [ ] Tag `v1.23.0` (você cria)

## Verificação local

```bash
npm run measure:rules
rg 'alwaysApply: true' .cursor/rules   # 2 arquivos
```

## Publicar (você executa)

```bash
git add package.json CHANGELOG.md RELEASE-1.23.0.md README.md .task-flow/
git commit -m "chore(release): v1.23.0 token optimization (minor)

Breaking changes in Cursor rules; migration: rbin-task-flow update."

git tag -a v1.23.0 -m "v1.23.0 — token optimization"

npm pack --dry-run
npm publish

git push && git push origin v1.23.0
```

## Consumidores (1.22 → 1.23)

```bash
npm install -g rbin-task-flow@1.23
cd your-project && rbin-task-flow update
```

## Pós-publish

- [ ] `npm view rbin-task-flow version` → `1.23.0`
