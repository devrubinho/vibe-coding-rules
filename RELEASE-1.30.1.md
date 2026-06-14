# Release 1.30.1 — publicação npm

Pacote no npm hoje: **1.27.1** → esta publicação leva **1.30.1** (inclui 1.28.0 … 1.30.1).

## Resumo

| Versão | Tipo | Destaque |
|--------|------|----------|
| **1.28.0** | minor | `--keep-tasks` no `reset` |
| **1.29.0** | **breaking** | remove `rbin-task-flow update` |
| **1.30.0** | minor | subtarefas `manual` + `.task-flow/dev-logs/` |
| **1.30.1** | patch | conclusão manual via conversa (sem `confirm`) |

### CLI (só `init` e `reset`)

```bash
rbin-task-flow init
rbin-task-flow reset --keep-tasks              # subir versão mantendo tasks
rbin-task-flow reset --keep-tasks --graphify   # + grafo
rbin-task-flow reset                           # do zero
```

### Task-flow run + manual

- Passo que exige você (deploy, console, credenciais…) → status **`manual`**, não `done`
- Arquivo `.task-flow/dev-logs/task-X.Y-manual.md` com passos + **Conversation log**
- Você reporta no chat; a IA atualiza o log e marca `done` só quando verificar
- **`task-flow: report`** só após task 100% `done` — nunca durante `run`

### Skills (11)

`task-flow-sync`, `from-contexts`, `run`, `split`, `status`, `validate`, `estimate`, `report`, `audit`, `rbin-coding-standards`, `rbin-git`

## Pré-publicação (repo)

```bash
npm run measure:rules    # always-on ≤ 5 KB
npm pack --dry-run       # tarball ~97 KB, ~70 arquivos
```

## Publicar

```bash
git add -A
git commit -m "chore(release): v1.30.1 — keep-tasks, remove update CLI, manual dev-logs"

npm publish --otp=SEU_2FA
npm view rbin-task-flow version   # → 1.30.1
```

## Consumidores

```bash
npm install -g rbin-task-flow@1.30.1
cd seu-projeto
rbin-task-flow reset --keep-tasks
```

**Migrando de `update`:**

```bash
# Antes: rbin-task-flow update --keep-tasks
# Agora:
rbin-task-flow reset --keep-tasks
```

## Checklist pós-publish

- [ ] `npm view rbin-task-flow version` → 1.30.1
- [ ] `rbin-task-flow reset --keep-tasks` em um projeto real
- [ ] `task-flow: run next 1` com subtarefa que exige passo manual → dev-log criado, não marca `done`
- [ ] Reportar passo manual no chat → IA atualiza log e marca `done` quando completo
