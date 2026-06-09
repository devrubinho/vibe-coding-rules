# Release 1.25.1 — publicação npm

Checklist para publicar **rbin-task-flow@1.25.1** (patch — padrão Vercel `.env` nos standards).

## Semver

- **1.25.0** → **1.25.1** = patch.

## O que entra

- Seção **Vercel — environment variables** em `coding-standards-full.md` (§0–§8)
- `coding_standards.mdc` + `rbin-coding-standards` skill atualizados

## Verificação local

```bash
npm run measure:rules
npm pack --dry-run
```

## Publicar (você executa)

```bash
git add package.json CHANGELOG.md RELEASE-1.25.1.md README.md \
  .task-flow/guides/coding-standards-full.md .task-flow/README.md \
  .cursor/rules/coding_standards.mdc \
  .claude/skills/rbin-coding-standards/

git commit -m "chore(release): v1.25.1 — Vercel .env standard in coding standards"

git tag -a v1.25.1 -m "v1.25.1 — Vercel env pattern"

npm publish

git push && git push origin v1.25.1
```

## Consumidores

```bash
npm install -g rbin-task-flow@1.25.1
cd your-project && rbin-task-flow update
```

## Pós-publish

- [ ] `npm view rbin-task-flow version` → `1.25.1`
