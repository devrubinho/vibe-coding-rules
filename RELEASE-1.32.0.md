# Release 1.32.0 — publicação npm

npm publicado hoje: **1.31.2** → esta publicação leva **1.32.0** (minor).

## Resumo das mudanças (1.31.2 → 1.32.0)

| Área | Destaque |
|------|----------|
| `tasks.json` | Novo campo opcional `dependsOn: number[]` — ids de outras tasks que precisam estar `done` antes desta começar |
| `render-status` | Marca até 3 tasks prontas por vez com `— 🤖 AI N available` na linha de resumo, calculado a partir de `dependsOn` + `status.json` |
| `validate` | Novo check referencial: `dependsOn` apontando para id inexistente ou para a própria task |
| Skills/regras | `task-flow: sync` agora preenche `dependsOn` (só quando é dependência real, não pela ordem no input) |

### Como funciona o `🤖 AI N available`

- Task não concluída + todas as ids em `dependsOn` já `done` → está "pronta".
- As 3 primeiras prontas (na ordem dos ids) recebem `AI 1`, `AI 2`, `AI 3` — o teto de 3 reflete quantos streams rodam em paralelo hoje (`task-flow: run-split:3`).
- Sem `dependsOn` declarado = task tratada como independente (retrocompatível com todo `tasks.json` existente).
- Recalculado em toda chamada de `rbin-task-flow render-status` — já embutida em `sync`, `run` e `run-split` — então acompanha status.json sem passo manual extra.

### CLI

```bash
rbin-task-flow init
rbin-task-flow reset --keep-tasks
rbin-task-flow validate --schema
rbin-task-flow render-status
```

## Verificação local

```bash
npm test                 # 29 passing
npm run measure:rules    # always-on ≤ 5 KB
npm pack --dry-run
```

## Publicar

```bash
git add -A
git commit -m "chore(release): v1.32.0 — dependsOn + AI N available parallel-ready badges in tasks.status.md"

npm publish --otp=SEU_2FA
npm view rbin-task-flow version   # → 1.32.0
```

## Consumidores

```bash
npm install -g rbin-task-flow@1.32.0
cd seu-projeto
rbin-task-flow reset --keep-tasks
```

## Checklist pós-publish

- [ ] `npm view rbin-task-flow version` → 1.32.0
- [ ] `task-flow: sync` num projeto com tasks dependentes → confere `AI N available` aparece só nas prontas
- [ ] `rbin-task-flow validate --schema` acusa `dependsOn` inválido (id inexistente / autodependência)
- [ ] `tasks.status.md` recém-instalado (fresh init) mostra `AI 1`/`AI 2` nas duas tasks padrão
