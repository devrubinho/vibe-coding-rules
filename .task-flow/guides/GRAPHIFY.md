# Graphify + RBIN Task Flow

Graphify ([graphifyy](https://pypi.org/project/graphifyyy/)) cria um **grafo de conhecimento** do repositório. O Task Flow gerencia **tarefas e status**. Este guia evita que os dois **compitam por contexto** na IA.

**Instalação global do CLI:** `rbin-install-dev` → `20.6-install-graphify.sh` (macOS) ou `19.6` (Linux).

---

## Token discipline

- Use **summarized** `graphify query` output (symbols, paths, short lists) — not full graph dumps in chat.
- **Do not paste** `graphify-out/GRAPH_REPORT.md` (or entire report files) into the model context unless the user **explicitly** `@`-mentions that file.
- Prefer one targeted query per subtask over loading `graph.json` or large exports.
- Task Flow status files (`.task-flow/`) always win over Graphify for workflow and git.

---

## Divisão de responsabilidades

| | Task Flow | Graphify |
|---|-----------|----------|
| **Pergunta** | O que fazer agora? | Onde está X no código? |
| **Dados** | `.task-flow/` | `graphify-out/` |
| **Comandos** | `task-flow: sync`, `run`, `status`, … | `graphify extract`, `query`, `affected` |
| **Regra Cursor** | Várias `.mdc` (workflow) | `graphify-task-flow.mdc` (**sob demanda**) |

---

## O que o `rbin-task-flow init` já faz por você

1. Copia **`.cursor/rules/graphify-task-flow.mdc`** — `alwaysApply: false` (não compete com `task_work`, etc.).
2. Adiciona **`graphify-out/`** ao `.gitignore`.
3. Se existir **`.cursor/rules/graphify.mdc`** do `graphify cursor install` (upstream com `alwaysApply: true`), o instalador **desativa** `alwaysApply` para economizar contexto.
4. Com **`--graphify`** em `init`, `update` ou **`reset`**, roda `graphify extract . --backend claude-cli` se o CLI estiver no PATH (usa assinatura Claude Code — sem API key separada).

**Não** rodamos `graphify claude install` / `graphify cursor install` automaticamente — o install upstream força `graphify.mdc` always-on e incham `CLAUDE.md` / `AGENTS.md`.

---

## Fluxo recomendado

```bash
cd seu-projeto
rbin-task-flow reset --graphify   # ou init/update --graphify; recria .task-flow + grafo
task-flow: sync
task-flow: run next 3             # IA usa grafo só ao implementar
task-flow: check
# você: git commit
```

### Na IA (Cursor / Claude / Codex)

| Comando Task Flow | Usar Graphify? |
|-------------------|----------------|
| `sync`, `status`, `estimate`, `report`, `generate flow` | Não |
| `run next X`, `run N` | Sim, se `graphify-out/` existir |
| `think`, `review`, `validate` | Opcional |
| `audit`, `improve changes` | Opcional (estrutura); padrões = checklist `coding_standards.mdc` |
| `check` | Não |

**Prompt exemplo:**

```text
task-flow: run next 2 — se graphify-out existir, graphify query "<módulo da subtarefa>" antes de editar arquivos.
```

---

## Claude Code

- Use **`/graphify`** ou `graphify query` **durante** `task-flow: run`, não no lugar de atualizar status.
- Se já rodou `graphify claude install` no passado: o hook PreToolUse pode ajudar; evite duplicar parágrafos longos no `CLAUDE.md` — priorize [platforms/claude-code.md](platforms/claude-code.md).

## Cursor

- Regra ativa: **`graphify-task-flow.mdc`** (Apply Intelligently), não `graphify.mdc` always-on.
- Se precisar do upstream: `@graphify` manualmente; não reative `alwaysApply: true` em `graphify.mdc` se usa Task Flow diário.

## Codex

- Graphify não entra no `AGENTS.md` automaticamente (limite 32 KiB).
- No prompt: cite `.task-flow/guides/GRAPHIFY.md` + `graphify query` ao executar `run`.

---

## Manutenção

| Evento | Ação |
|--------|------|
| Primeiro setup | `rbin-task-flow init --graphify` ou `graphify extract . --backend claude-cli` |
| Reset completo (tasks + template + grafo) | `rbin-task-flow reset --graphify` |
| Refactor grande após vários `run` | `graphify update .` ou `graphify extract . --backend claude-cli` |
| `task-flow: update` | Reaplica `graphify-task-flow.mdc` e pode rebaixar `graphify.mdc` |

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| IA ignora `task-flow:` | Graphify não é a causa — verifique rules Task Flow |
| Contexto cheio no Cursor | Confirme `graphify.mdc` não está `alwaysApply: true` |
| `graphify: command not found` | Rode `rbin-install-dev` (módulo Graphify) |
| `no LLM API key found` ao rodar `graphify extract .` manual | Use `rbin-task-flow init --graphify` (roda `--backend claude-cli`) ou exporte uma API key / `--backend ollama` |
| Grafo desatualizado | `graphify extract . --backend claude-cli` de novo |

---

## Referências

- [AI-PLATFORMS.md](AI-PLATFORMS.md) — índice Claude / Cursor / Codex
- [README.md](../README.md) — comandos Task Flow
- Graphify CLI: `graphify --help`
