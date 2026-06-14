# Release 1.30.3 — publicação npm

npm publicado hoje: **1.30.1** → esta publicação leva **1.30.3**.

## Resumo (1.30.1 → 1.30.3)

| Versão | Tipo | Destaque |
|--------|------|----------|
| **1.30.2** | patch | `.gitignore` só `.task-flow/` (remove `.cursor/`, `CLAUDE.md`, etc.) |
| **1.30.3** | patch | `.gitignore` sem comentários — só `.task-flow` no final do arquivo |

### Histórico recente (já em 1.30.1 no npm)

| Versão | Destaque |
|--------|----------|
| **1.28.0** | `reset --keep-tasks` |
| **1.29.0** | remove `rbin-task-flow update` |
| **1.30.0** | subtarefas `manual` + `.task-flow/dev-logs/` |
| **1.30.1** | conclusão manual via conversa (sem `confirm`) |

### CLI

```bash
rbin-task-flow init
rbin-task-flow reset --keep-tasks
rbin-task-flow reset --keep-tasks --graphify
rbin-task-flow reset
```

### `.gitignore` no projeto destino

Apenas uma linha no final:

```gitignore
.task-flow
```

### Task-flow run + manual

- Passo manual → status `manual` + `.task-flow/dev-logs/task-X.Y-manual.md`
- Você reporta no chat; IA atualiza **Conversation log** e marca `done` quando verificar
- Não gera `guides/reports/` durante `run`

### Skills (11)

`task-flow-sync`, `from-contexts`, `run`, `split`, `status`, `validate`, `estimate`, `report`, `audit`, `rbin-coding-standards`, `rbin-git`

## Pré-publicação

```bash
npm run measure:rules    # always-on ≤ 5 KB ✅
npm pack --dry-run       # ~96 KB, 70 arquivos
```

## Publicar

```bash
git add -A
git commit -m "chore(release): v1.30.3 — gitignore append .task-flow only"

npm publish --otp=SEU_2FA
npm view rbin-task-flow version   # → 1.30.3
```

## Consumidores

```bash
npm install -g rbin-task-flow@1.30.3
cd seu-projeto
rbin-task-flow reset --keep-tasks
```

## Checklist pós-publish

- [ ] `npm view rbin-task-flow version` → 1.30.3
- [ ] `.gitignore` do projeto tem só `.task-flow` no final (sem comentários RBIN)
- [ ] `rbin-task-flow reset --keep-tasks` preserva tasks + dev-logs
- [ ] `task-flow: run` com passo manual → dev-log, não marca `done` cedo
