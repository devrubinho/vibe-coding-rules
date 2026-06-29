# RBIN Task Flow — Guia por plataforma de IA

Os comandos `task-flow: …` são **os mesmos** em Claude Code, Cursor e Codex. O que muda é **como cada ferramenta carrega instruções** — e como você extrai o melhor de cada uma.

---

## Escolha seu guia

| Plataforma | Guia | Mecanismo nativo | Otimização RBIN hoje |
|------------|------|------------------|----------------------|
| **Claude Code** | [platforms/claude-code.md](platforms/claude-code.md) | `CLAUDE.md` + `.claude/skills/*/SKILL.md` | **Skills no `init`** — `/task-flow-run`, etc. |
| **Cursor** | [platforms/cursor.md](platforms/cursor.md) | `task-flow-cursor.mdc` + `rbin-git-policy.mdc` + skills | **Otimizado v1.23** — 2 always-on + `@task-flow-*` |
| **OpenAI Codex** | [platforms/codex.md](platforms/codex.md) | `AGENTS.md` + `.task-flow/guides/CODEX.md` + `.codex/config.toml` | **Otimizado v1.21** — sync/run no AGENTS.md |

---

## Visão em 30 segundos

```text
.task-flow/          ← dados (tasks, status, contexts) — IGUAL para todas
     │
     ├── Claude  → CLAUDE.md (fino) + Skills (workflows)
     ├── Cursor  → task-flow-cursor (sempre) + @skills + rules inteligentes
     └── Codex   → AGENTS.md (compacto) + pedir .mdc no prompt
```

**Princípio:** Task Flow = **dados** em `.task-flow/` + **procedimentos** que a IA segue. Procedimentos devem viver no mecanismo nativo de cada ferramenta.

---

## Fluxo comum (todas as plataformas)

1. Definir tasks: editar `tasks.input.txt` **ou** colocar specs em `contexts/` e rodar `task-flow: from contexts`
2. `task-flow: sync`
3. `task-flow: status`
4. `task-flow: run-split:3` (opcional — N IAs em paralelo) → colar cada `run X,Y,Z` numa sessão
5. `task-flow: run next X` ou `task-flow: run N`
6. **Você** faz `git commit` (a IA só sugere)

Detalhes dos comandos: [README.md](../README.md).

---

## O que o `rbin-task-flow init` instala

| Caminho | Claude | Cursor | Codex |
|---------|--------|--------|-------|
| `.task-flow/` | ✅ | ✅ | ✅ |
| `.cursor/rules/` | leitura manual | ✅ auto | leitura manual |
| `CLAUDE.md` | ✅ | — | — |
| `AGENTS.md` | — | — | ✅ |
| `.task-flow/guides/CODEX.md` | — | — | ✅ |
| `.task-flow/guides/CURSOR.md` | — | ✅ | — |
| `.task-flow/guides/coding-standards-full.md` | on demand | on demand (sections only) | on demand |
| [OPTIMIZATION-PLAN.md](OPTIMIZATION-PLAN.md) | — | token roadmap | — |
| `.codex/config.toml` | — | — | ✅ (opcional, preservado no reset --keep-tasks) |
| `task-flow-cursor.mdc` | — | ✅ always-on | — |
| `rbin-git-policy.mdc` | — | ✅ always-on | — |
| `.claude/skills/` | ✅ (11 skills) | — | — |
| `.cursor/skills/` | — | ✅ (espelho) | — |

Por padrão, **`.task-flow`** é acrescentado ao final do **`.gitignore`** do projeto cliente.

---

## Graphify (opcional, sem competir)

Com o [Graphify](https://pypi.org/project/graphifyyy/) instalado (`rbin-install-dev`), o Task Flow inclui integração cooperativa:

- Regra **`.cursor/rules/graphify-task-flow.mdc`** — só quando `task-flow: run`, `validate`, etc. precisam navegar o código (`alwaysApply: false`).
- Grafo em **`graphify-out/`** na raiz (padrão do Graphify; Task Flow não redireciona output).
- Rebaixa **`graphify.mdc`** upstream para `alwaysApply: false` se existir.
- **`rbin-task-flow init --graphify`** — roda `graphify extract . --backend claude-cli` após o init.

Guia completo: [GRAPHIFY.md](GRAPHIFY.md).

---

## Roadmap do pacote (alinhamento multi-IA)

1. ~~Gerar `.claude/skills/` e `.cursor/skills/`~~ ✅ v1.20.0
2. ~~`CLAUDE.md` índice curto~~ ✅
3. ~~Reduzir `alwaysApply` no Cursor~~ ✅ v1.23 **2 always-on** (`task-flow-cursor`, `rbin-git-policy`) + skills
4. ~~Opção de instalador `--share-ai-config`~~ → `rbin-task-flow init --share-ai-config` (P2.2)

---

## Referências cruzadas

| Arquivo | Papel |
|---------|--------|
| [platforms/claude-code.md](platforms/claude-code.md) | Skills, frontmatter, injeção `!`cmd``, monorepo |
| [platforms/cursor.md](platforms/cursor.md) | Modos de regra, inventário `.mdc`, Agent vs Chat |
| [platforms/codex.md](platforms/codex.md) | 32 KiB, AGENTS.override, prompts eficazes |
| [../CLAUDE.md](../CLAUDE.md) | Entrada Claude no template |
| [../AGENTS.md](../AGENTS.md) | Entrada Codex no template |
| [CURSOR.md](CURSOR.md) | Referência rápida Cursor |
| [OPTIMIZATION-PLAN.md](OPTIMIZATION-PLAN.md) | Plano de melhorias (tokens, P0–P2) |
| [OPTIMIZATION-IMPLEMENTATION-TASKS.md](OPTIMIZATION-IMPLEMENTATION-TASKS.md) | Subtarefas para IA implementar o plano |
| [../.cursor/rules/](../.cursor/rules/) | Fonte completa dos procedimentos |

---

*Índice central — detalhes nos três guias em `platforms/`.*
