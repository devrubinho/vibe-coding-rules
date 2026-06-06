# Task Flow no Cursor

Guia para extrair o máximo do **RBIN Task Flow** no [Cursor](https://cursor.com/) (Agent, Chat, CLI). O pacote RBIN já está **otimizado para Cursor** via `.cursor/rules/*.mdc`; este documento explica **como aproveitar cada recurso do Cursor** sem desperdiçar contexto.

**Índice geral:** [AI-PLATFORMS.md](../AI-PLATFORMS.md) · **Outras plataformas:** [claude-code.md](claude-code.md) · [codex.md](codex.md)

---

## 1. Por que o Task Flow “nasce” bem no Cursor

O instalador copia regras para `.cursor/rules/` e **14 skills** para `.cursor/skills/`. Desde **v1.23** (otimização P0 — ver [OPTIMIZATION-PLAN.md](../OPTIMIZATION-PLAN.md)):

| Camada | O que carrega | Tokens (~) |
|--------|----------------|------------|
| **Always-on (2)** | `task-flow-cursor.mdc`, `rbin-git-policy.mdc` | ~0,9k / turno |
| **Skills** | `@task-flow-run`, `@task-flow-sync`, … | sob demanda |
| **Intelligent** | `task_work`, `task_audit`, `task_analysis` (think), … | quando o Agent casa `description` |
| **Glob** | `task-flow-sync`, `task_generation` (`.task-flow/**`), `coding_standards` (`src/**`, `app/**`) | arquivos no contexto |

Isso significa:

- Comandos `task-flow: …` são reconhecidos via **bootstrap** always-on
- **Não** carrega coding standards, run workflow nem audit em **toda** conversa — só com glob, skill ou `@`
- Para `run`: prefira **`@task-flow-run`**; evite `@task_work` (stub)

Documentação: [Cursor Rules](https://cursor.com/docs/context/rules) · Referência rápida: [CURSOR.md](../CURSOR.md).

### Perfis de instalação (CLI)

| Profile | Comando | O que copia |
|---------|---------|-------------|
| **standard** (padrão) | `rbin-task-flow init` | Todas as `.cursor/rules/*.mdc` + skills |
| **minimal** | `rbin-task-flow init --profile minimal` | Só `task-flow-cursor.mdc` + `rbin-git-policy.mdc` + skills |

- **minimal:** ≤2 always-on; workflows só via `@task-flow-*` (sem glob `coding_standards`, `task_work`, etc.).
- **update** sem `--profile` reaplica o profile salvo em `.task-flow/install-meta.json`.
- Migrar para regras completas: `rbin-task-flow update --profile standard`.

---

## 2. Os quatro modos de regra (use a favor do Task Flow)

| Modo | Frontmatter | Quando usar no Task Flow |
|------|-------------|-------------------------|
| **Always Apply** | `alwaysApply: true` | `task-flow-cursor`, `rbin-git-policy` only |
| **Apply to Specific Files** | `globs: "**/.task-flow/**"` | Regras só ao editar tasks/status/contexts |
| **Apply Intelligently** | `description` rica, `alwaysApply: false`, sem globs | `task_audit`, `task_refactor` — quando o assunto é auditoria/refactor |
| **Apply Manually** | sem description/globs, `alwaysApply: false` | Rascunhos, regras experimentais — `@nome-da-regra` |

### Matriz frontmatter (oficial Cursor)

| `alwaysApply` | `description` | `globs` | Comportamento |
|---------------|---------------|---------|---------------|
| `true` | — | — | Sempre incluída (globs/description ignorados) |
| `false` | — | definido | Anexa quando arquivo do glob está **no chat** (mencionado/anexado) |
| `false` | definido | omitido | Agent decide pela description |
| `false` | omitido | omitido | Só com `@regra` no chat |

**Dica importante (comunidade Cursor):** não misture `globs` + `description` na mesma regra se o objetivo é “Apply Intelligently” — aumenta ruído na lista que o Agent avalia.

---

## 3. Inventário das regras RBIN (v1.23 — estado real)

Confirme no projeto: `rg 'alwaysApply: true' .cursor/rules` → deve listar **apenas** `task-flow-cursor.mdc` e `rbin-git-policy.mdc`.

| Arquivo | Papel | Modo atual |
|---------|--------|------------|
| `task-flow-cursor.mdc` | bootstrap + tabela de skills | **Always** |
| `rbin-git-policy.mdc` | git write proibido + sugestão de commit | **Always** |
| `task_work.mdc` | fallback curto de `run` | Intelligent — use `@task-flow-run` |
| `task_execution.mdc` | índice stub → skills | Intelligent / `@` manual |
| `task-flow-sync.mdc` | `sync` completo | **Glob** `.task-flow/**` · prefer `@task-flow-sync` |
| `task_generation.mdc` | templates de subtarefas | **Glob** `.task-flow/**` |
| `task_analysis.mdc` | `think` apenas | Intelligent |
| `task_status.mdc` | `status` | **Glob** `.task-flow/**` |
| `task_audit.mdc` | audit vs checklist standards | Intelligent |
| `task_improve_changes.mdc` | audit só no diff | Intelligent |
| `task_check.mdc` | lint + build | Intelligent |
| `task_review.mdc` | verificar “done” | Intelligent |
| `task_refactor.mdc` | refactor sem mudar comportamento | Intelligent |
| `task_estimate.mdc` | estimativas | Intelligent / `@` |
| `task_report.mdc` | relatórios | Intelligent / `@task-flow-report` |
| `task_generate_flow.mdc` | `tasks.flow.md` | Intelligent / `@` |
| `coding_standards.mdc` | checklist (~100 linhas) | **Glob** `src/**`, `app/**` |
| `code_comments.mdc` | sem comentários explicativos | **Glob** `**/*.{ts,tsx,js,jsx}` |
| `graphify-task-flow.mdc` | Graphify + Task Flow | Intelligent |
| `git_control.mdc` / `commit_practices.mdc` | legado | Manual / `@` |
| `cursor_rules.mdc` | formato `.mdc` | **Glob** `.cursor/rules/**` |
| `self_improve.mdc` | evoluir regras | Manual `@self_improve` |

**Doc (não é regra):** `.task-flow/docs/coding-standards-full.md` — seções sob demanda; nunca colar inteiro no chat.

### Otimização P0 — implementada

- [x] 2 always-on (`task-flow-cursor`, `rbin-git-policy`) — antes eram 3+ com git/commit separados
- [x] `coding_standards` checklist + full doc separado
- [x] `task_work` / `task_execution` stubs; workflows em skills
- [x] `rbin-coding-standards` com `disable-model-invocation: true`

Próximas melhorias: [OPTIMIZATION-PLAN.md](../OPTIMIZATION-PLAN.md) (P1–P2).

---

## 4. Cursor Skills (`.cursor/skills/`)

Cursor suporta o mesmo formato que Claude Code: `.cursor/skills/<nome>/SKILL.md` ([Agent Skills](https://agentskills.io/)).

| Cenário | Rules `.mdc` | Skills |
|---------|--------------|--------|
| Comportamento **sempre** (nunca commitar git) | ✅ Always | ❌ |
| Workflow **pesado** (`run`, `sync`, audit completo) | ⚠️ Caro se Always | ✅ Sob demanda |
| Mesmo workflow em Claude + Cursor | Skills em **ambas** pastas | ✅ |
| Referência enorme (coding standards) | checklist glob (~1k tokens) | `@rbin-coding-standards` + full doc por seção |

O `rbin-task-flow init` copia **14 skills** para `.cursor/skills/` (mesmo conteúdo que `.claude/skills/`). No Agent, use `@task-flow-run`, `@task-flow-sync`, etc.

Após `rbin-task-flow init` ou `update`, use `@task-flow-*` no Agent. Para sync: `@task-flow-sync` (não `task_generation` / `task_analysis` isolados).

---

## 5. Agent vs Chat vs CLI

| Superfície | Task Flow | Dica |
|------------|-----------|------|
| **Agent** (Ctrl+I / Composer) | Melhor para `run next X`, implementação multi-arquivo | Abra arquivos de `contexts/` no chat se UI |
| **Chat** | `sync`, `think`, `status`, `estimate` | Peça explicitamente `task-flow: …` |
| **Cursor CLI** | Mesmas regras do projeto se `.cursor/rules` presente | Útil em CI local com agent |

**MCP:** regras não substituem MCP (DB, APIs). Task Flow não conflita — subtarefas podem dizer “usar MCP X” em `tasks.json`.

---

## 6. Fluxos de trabalho otimizados

### 6.1 Setup inicial no projeto cliente

```bash
cd seu-projeto
rbin-task-flow init
# Edite .task-flow/tasks.input.txt
```

No Agent:

```text
task-flow: sync
task-flow: status
```

### 6.2 Sprint diário

```text
task-flow: run next 4
```

Ao terminar cada subtarefa, o Agent deve atualizar `status.json` + `tasks.status.md` (`@task-flow-run` / `task_work` stub).

```text
task-flow: check
```

Commit **manual** (regra `rbin-git-policy`).

### 6.3 Qualidade antes do merge

```text
task-flow: improve changes
task-flow: review 2
```

`improve changes` usa `git diff --name-only HEAD` — só arquivos alterados.

### 6.4 Refactor pós-task

```text
task-flow: refactor 1
```

Remove comentários explicativos; mantém separadores `// ───`.

### 6.5 Paralelismo (vários devs / agentes)

- `task-flow: run 3` **bloqueia** se tasks 1–2 tiverem subtarefas pendentes
- Dois Agents em tasks diferentes da mesma faixa: use tasks distintas (ex.: 10 e 11) ou `run next` em fila única

### 6.6 Contextos visuais

Coloque PNG/PDF/MD em `.task-flow/contexts/`. Nas subtarefas geradas, instruções já referenciam o path — no Cursor, **@** o arquivo de contexto no primeiro prompt da subtarefa.

---

## 7. Prompts de alta eficácia

| Objetivo | Prompt |
|----------|--------|
| Execução clara | `task-flow: run next 3` |
| Task específica | `task-flow: run 2` |
| Sincronizar após editar input | `task-flow: sync` |
| Auditoria focada | `task-flow: improve changes` (não `audit` no repo inteiro) |
| Padrões ao codificar | `@rbin-coding-standards` ou arquivo em `src/` (checklist glob) |
| Regra sob demanda | `@task-flow-audit` ou `@task_audit` + `task-flow: audit` |
| Run explícito | `@task-flow-run` + `task-flow: run next 2` |
| Natural | `trabalhe nas próximas 2 subtarefas do task flow` (bootstrap always-on) |

**Evite:** “continua” sem número; “marca como feito” sem atualizar JSON + MD.

---

## 8. Otimização de contexto (avançado)

### 8.1 Economizar tokens (P0 já aplicado no pacote)

| Ação | Status |
|------|--------|
| 2 regras always-on | ✅ `task-flow-cursor`, `rbin-git-policy` |
| Skills para `run`, `sync`, audit, … | ✅ `@task-flow-*` |
| `coding_standards` checklist + full doc | ✅ glob ~1k tokens; full sob demanda |
| Stubs `task_work` / `task_execution` | ✅ |
| Unificar git em `rbin-git-policy` | ✅ |

**No seu projeto:** `rbin-task-flow update` reaplica o template. Evite reativar `alwaysApply: true` em `graphify.mdc` upstream.

**Roadmap:** [OPTIMIZATION-PLAN.md](../OPTIMIZATION-PLAN.md) · tarefas: [OPTIMIZATION-IMPLEMENTATION-TASKS.md](../OPTIMIZATION-IMPLEMENTATION-TASKS.md).

### 8.2 Hábitos no dia a dia

1. `task-flow: run` → **`@task-flow-run`** (não `@task_work`).
2. Implementar código → **`@rbin-coding-standards`** (não carregar full doc inteiro).
3. Audit → checklist; full doc só se pedir profundidade.
4. Não abrir dezenas de arquivos `src/` no chat antes de pedir só `sync`/`status`.

### 8.3 User Rules (Settings → Rules for AI)

Use para preferências **pessoais** (idioma, tom). **Não** duplique Task Flow — fica no projeto em `.cursor/rules`.

### 8.4 `AGENTS.md` na raiz

Cursor também pode ler `AGENTS.md` em alguns fluxos; no RBIN ele é focado em **Codex**. Para Cursor, priorize `.cursor/rules`.

---

## 9. Integração com features Cursor

| Feature | + Task Flow |
|---------|-------------|
| **@-mentions** | `@tasks.input.txt`, `@contexts/dashboard.png`, `@task-flow-run` |
| **Notepads / Docs** | Links para `.task-flow/README.md` |
| **Bugbot / PR** | `task-flow: review X` antes de merge |
| **Background Agent** | `run next 1` por job; cuidado com conflito de `status.json` |
| **Plan mode** | `think` + `sync` para gerar tasks antes de `run` |

---

## 10. CLI `rbin-task-flow` + Cursor

| Comando CLI | Uso com Cursor |
|-------------|----------------|
| `rbin-task-flow init` | Copia rules + task-flow |
| `rbin-task-flow update` | Atualiza rules; preserva `.internal/` |
| `rbin-task-flow reset` | Recria `.task-flow` do zero |
| `rbin-task-flow reset --graphify` | Reset + `graphify extract . --backend claude-cli` |
| `rbin-task-flow audit` | Lista arquivos **unstaged** (não substitui `task-flow: improve changes`) |

O Agent executa o workflow; o CLI prepara arquivos.

---

## 11. `.gitignore` discreto vs time

**Padrão:** `rbin-task-flow init` ignora `.cursor/` inteiro (skills e rules ficam locais).

**Time:** `rbin-task-flow init --share-ai-config` — **não** ignora `.cursor/skills/` nem `.cursor/rules/`; ignora só `.cursor/settings.json` e `*.local.mdc`. O bloco no `.gitignore` explica o trade-off **tokens vs consistência do time**.

| Estratégia | Comando | Prós | Contras |
|------------|---------|------|---------|
| Local (padrão) | `init` | Repo limpo; cada dev com setup próprio | Sem sync de rules/skills |
| Time | `init --share-ai-config` | Mesmo Task Flow para todos | Mais arquivos de IA no git; tokens por dev ao usar rules |

`update` sem flag reaplica a opção salva em `.task-flow/install-meta.json` (`shareAiConfig`).

Para open source: documente no README — contribuidores podem usar `--share-ai-config` ou `init` local.

---

## 12. Troubleshooting

| Problema | Causa provável | Ação |
|----------|----------------|------|
| Agent ignora `task-flow:` | Rules não instaladas / projeto errado | `rbin-task-flow update` |
| Não atualiza `tasks.status.md` | Só mexeu em `status.json` | `@task-flow-run` — regenerar Summary |
| `run 3` não roda | Tasks 1–2 incompletas | `task-flow: status` |
| Coding standards ignorados | Checklist não no contexto | `@rbin-coding-standards` ou abrir arquivo em `src/` |
| Run não segue deps/status | Usou stub sem skill | `@task-flow-run` |
| Carregou standards inteiro | Audit/run com full doc | Usar checklist; seções do full doc só se necessário |
| Regra “nunca aplica” | Intelligent + description vaga | `@task-flow-*` explícito |
| Contexto cheio | Muitos arquivos `src/` + rules | Menos arquivos no chat; skills explícitas |

---

## 13. Checklist de maturidade Cursor + Task Flow

- [x] `task-flow-cursor.mdc` + `rbin-git-policy.mdc` (2 always-on, v1.23)
- [x] 14 skills em `.cursor/skills/` após `init`
- [x] Otimização P0 de tokens (ver §3)
- [ ] `task-flow: sync` após cada edição em `tasks.input.txt`
- [ ] `@task-flow-run` (não `@task_work`) para implementar
- [ ] Contextos em `.task-flow/contexts/` para tasks de UI
- [ ] `improve changes` antes de commit
- [ ] `task-flow: check` antes de push
- [ ] Time alinhado: git manual sempre

---

## 14. Graphify (opcional, sem competir)

Com Graphify instalado (`rbin-install-dev`), o Task Flow traz **`graphify-task-flow.mdc`** (`alwaysApply: false`) em vez de depender do `graphify.mdc` always-on do `graphify cursor install`.

- **`rbin-task-flow init`** rebaixa `graphify.mdc` upstream se existir.
- Use Graphify só em **`task-flow: run`**, `think`, `review` — ver [GRAPHIFY.md](../GRAPHIFY.md).

---

## 15. Referências

- [Cursor — Rules](https://cursor.com/docs/context/rules)
- [Agent Skills standard](https://agentskills.io/)
- Comandos: [../README.md](../README.md)
- Claude (skills espelhadas): [claude-code.md](claude-code.md)

---

*RBIN Task Flow no Cursor: 2 regras always-on + skills `@task-flow-*`. Guia de otimização: [OPTIMIZATION-PLAN.md](../OPTIMIZATION-PLAN.md).*
