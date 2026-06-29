# Graphify + RBIN Task Flow

Graphify ([graphifyy](https://pypi.org/project/graphifyyy/)) cria um **grafo de conhecimento** do repositório. O Task Flow gerencia **tarefas e status**. Este guia evita que os dois **compitam por contexto** na IA.

**Instalação global do CLI:** `rbin-install-dev` → `20.6-install-graphify.sh` (macOS) ou `19.6` (Linux).

---

## Divisão clara

| | Task Flow | Graphify |
|---|-----------|----------|
| **Pergunta** | O que fazer agora? | Onde está X no código? |
| **Dados** | `.task-flow/` | **`graphify-out/` na raiz** (padrão do CLI) |
| **Comandos** | `task-flow: sync`, `run`, `status`, … | `graphify extract`, `query`, `affected` |
| **Regra Cursor** | Várias `.mdc` (workflow) | `graphify-task-flow.mdc` (**sob demanda**) |

**O Task Flow não redireciona a saída do Graphify.** Não usamos `--out .task-flow/…`. O Graphify grava onde já está habituado: **`graphify-out/` na raiz do projeto**. O instalador só configura coexistência (regra, guia, `.gitignore`) e, com `--graphify`, dispara o extract padrão.

---

## Token discipline

- Use **summarized** `graphify query` output (symbols, paths, short lists) — not full graph dumps in chat.
- **Do not paste** `graphify-out/GRAPH_REPORT.md` (or entire report files) into the model context unless the user **explicitly** `@`-mentions that file.
- Prefer one targeted query per subtask over loading `graph.json` or large exports.
- Task Flow status files (`.task-flow/`) always win over Graphify for workflow and git.

---

## O que `rbin-task-flow init` / `reset` faz pelo Graphify

1. Copia **`.cursor/rules/graphify-task-flow.mdc`** — `alwaysApply: false`.
2. Copia este guia (`.task-flow/guides/GRAPHIFY.md`).
3. Se existir **`.cursor/rules/graphify.mdc`** upstream com `alwaysApply: true`, **desativa** para economizar contexto.
4. Acrescenta **`graphify-out`** ao `.gitignore` do projeto (junto com `.task-flow`).
5. Remove pasta legada **`.task-flow/guides/graphify-out/`** se existir (versões antigas que tentavam forçar output dentro do Task Flow).
6. Com **`--graphify`**, roda `graphify extract . --backend claude-cli` — **sem** `--out`; o grafo vai para `graphify-out/` na raiz.

**Não** rodamos `graphify claude install` / `graphify cursor install` automaticamente — o install upstream força `graphify.mdc` always-on e incham `CLAUDE.md` / `AGENTS.md`.

---

## Fluxo recomendado

```bash
cd seu-projeto
rbin-task-flow init --graphify    # ou reset --keep-tasks --graphify
task-flow: sync
task-flow: run next 3             # IA usa grafo só ao implementar
```

### Na IA (Cursor / Claude / Codex)

| Comando Task Flow | Usar Graphify? |
|-------------------|----------------|
| `sync`, `status`, `estimate`, `report` | Não |
| `run next X`, `run N` | Sim, se `graphify-out/` existir |
| `validate` | Opcional |
| `audit` | Opcional (estrutura) |

**Prompt exemplo:**

```text
task-flow: run next 2 — se graphify-out/ existir, graphify query "<módulo>" --graph graphify-out/graph.json antes de editar.
```

---

## Manutenção

| Evento | Ação |
|--------|------|
| Primeiro setup | `rbin-task-flow init --graphify` ou `graphify extract . --backend claude-cli` |
| Refactor grande | `graphify update .` ou `graphify extract . --backend claude-cli` de novo |
| Subir versão do Task Flow | `rbin-task-flow reset --keep-tasks` (grafo em `graphify-out/` na raiz não é movido) |

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Grafo em dois lugares | Apague `.task-flow/guides/graphify-out/` — use só `graphify-out/` na raiz |
| `graphify: command not found` | `rbin-install-dev` (módulo Graphify) |
| `no LLM API key found` | `rbin-task-flow init --graphify` (usa `--backend claude-cli`) |
| IA ignora `task-flow:` | Verifique rules Task Flow, não o Graphify |

---

## Referências

- [AI-PLATFORMS.md](AI-PLATFORMS.md)
- [README.md](../README.md)
- Graphify CLI: `graphify --help`
