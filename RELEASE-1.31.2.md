# Release 1.31.2 — publicação npm

npm publicado hoje: **1.31.0** → esta publicação leva **1.31.2** (patches 1.31.1 + 1.31.2).

## Resumo das mudanças (1.31.0 → 1.31.2)

| Versão | Destaque |
|--------|----------|
| **1.31.1** | Graphify em `graphify-out/` na raiz; `.gitignore` com `.task-flow` + `graphify-out` |
| **1.31.2** | Task Flow **não redireciona** output do Graphify; limpa `.task-flow/guides/graphify-out/` legado |

### Graphify (modelo final)

- **Task Flow configura:** `graphify-task-flow.mdc`, `GRAPHIFY.md`, rebaixa `graphify.mdc`, `.gitignore`, `--graphify` roda `graphify extract . --backend claude-cli` (sem `--out`).
- **Graphify grava:** `graphify-out/` na raiz (padrão do CLI).
- **IA usa:** `graphify query "…" --graph graphify-out/graph.json`

### CLI

```bash
rbin-task-flow init
rbin-task-flow reset --keep-tasks
rbin-task-flow reset --keep-tasks --graphify
rbin-task-flow validate --schema
rbin-task-flow render-status
```

## Verificação local

```bash
npm test                 # 22 passing
npm run measure:rules    # always-on ≤ 5 KB
npm pack --dry-run       # ~98 KB, 75 arquivos
```

## Publicar

```bash
git add -A
git commit -m "chore(release): v1.31.2 — Graphify graphify-out at project root"

npm publish --otp=SEU_2FA
npm view rbin-task-flow version   # → 1.31.2
```

## Consumidores

```bash
npm install -g rbin-task-flow@1.31.2
cd seu-projeto
rbin-task-flow reset --keep-tasks
# opcional, regerar grafo:
rbin-task-flow reset --keep-tasks --graphify
```

## Checklist pós-publish

- [ ] `npm view rbin-task-flow version` → 1.31.2
- [ ] `.gitignore` do projeto: `.task-flow` + `graphify-out` no final
- [ ] Grafo só em `graphify-out/` (não em `.task-flow/guides/graphify-out/`)
- [ ] `task-flow: run-split:N` (não `split:N`)
