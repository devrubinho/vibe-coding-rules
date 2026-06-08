# Plano de melhorias — RBIN Task Flow (otimização e tokens)

Documento de referência com oportunidades identificadas na auditoria do pacote (v1.22+). Objetivo: **Task Flow não deve consumir mais contexto do que um projeto sem ele**, exceto quando o usuário pede workflows pesados de forma explícita.

**Relacionado:** [AI-PLATFORMS.md](AI-PLATFORMS.md) · [CURSOR.md](CURSOR.md) · [GRAPHIFY.md](GRAPHIFY.md) · [platforms/cursor.md](platforms/cursor.md)

**Implementação (subtarefas para IA):** [OPTIMIZATION-IMPLEMENTATION-TASKS.md](OPTIMIZATION-IMPLEMENTATION-TASKS.md)

---

## 1. Veredito executivo

| Cenário | Situação atual (v1.22) | Meta |
|---------|------------------------|------|
| Chat genérico | ~2 regras always-on (~1,5–2k tokens após P0.1) | ≤ ~1,5–2k always-on |
| `task-flow: run` com `src/` no contexto | Pico **12–18k+** tokens só em regras | ≤ ~3k baseline + skill sob demanda |
| `task-flow: audit` / implementação Codex | Carrega `coding_standards.mdc` inteiro (~7,5k tokens) | Checklist ~1k; full doc só sob pedido |
| Claude `/task-flow-run` | Skill + `workflow.md` ~600–800 tokens | Manter |
| Codex | `AGENTS.md` ~2k sempre | Manter |

**Princípio:** dados leves em `.task-flow/` + procedimentos **sob demanda** (skills, `@`, leitura pontual). Anything always-on > ~1,5k tokens precisa justificativa forte.

---

## 2. Baseline medido (repositório template)

Estimativa ~4 caracteres/token.

| Camada | Tamanho | Tokens (~) | Quando entra |
|--------|---------|------------|--------------|
| `task-flow-cursor.mdc` | ~2 KB | ~0,5k | Sempre (Cursor) |
| `rbin-git-policy.mdc` | ~1,5 KB | ~0,4k | Sempre (P0.1) |
| `git_control.mdc` / `commit_practices.mdc` | legado | — | Manual / `@` |
| **Subtotal always-on** | **~3,5 KB** | **~0,9k** | `task-flow-cursor` + `rbin-git-policy` |
| `coding_standards.mdc` (checklist) | ~4,4 KB (~100 linhas) | **~1,1k** | Glob `src/**`, `app/**` |
| `docs/coding-standards-full.md` | sob demanda | — | Audit profundo / seções |
| `task_work.mdc` | ~40 linhas (stub) | ~0,4k | Apply Intelligently — use `@task-flow-run` |
| `task_execution.mdc` | stub ~28 linhas | ~0,3k | Intelligent — prefer `task-flow-cursor` |
| `task-flow-sync.mdc` | ~46 linhas | ~0,5k | Glob `.task-flow/**` — sync |
| `task_generation.mdc` | ~37 linhas | ~0,4k | Glob — subtask templates |
| `task_analysis.mdc` | ~43 linhas | ~0,4k | `think` only |
| 14 skills (total) | ~11 KB | sob invocação | `@` ou `/` |
| Todas as `.mdc` | ~122 KB | até ~30k | Pior caso (matches errados) |

---

## 3. O que já está bem (não regredir)

- [x] Bootstrap `task-flow-cursor.mdc` compacto com tabela de skills
- [x] 2 regras `alwaysApply: true` — `task-flow-cursor`, `rbin-git-policy` (vs ~19 antes)
- [x] Skills com `disable-model-invocation: true` nos workflows (`run`, `sync`, …)
- [x] `paths: [".task-flow/**"]` em skills de task
- [x] `CLAUDE.md` / `AGENTS.md` como índice, não manual completo
- [x] Graphify coexistência sem `graphify.mdc` always-on upstream
- [x] Codex não embute `coding_standards` no `AGENTS.md`
- [x] `reset --graphify` para reaplicar template + grafo

---

## 4. Problemas identificados

### 4.1 Tripla cobertura de git — ✅ resolvido (P0.1)

| Fonte | Papel |
|-------|--------|
| `rbin-git-policy.mdc` | always (único) |
| `git_control.mdc` / `commit_practices.mdc` | legado, manual |
| `task-flow-cursor.mdc` | 2 linhas + `@rbin-git` |
| `rbin-git` skill | sob demanda (detalhes) |

### 4.2 `coding_standards.mdc` — ✅ resolvido (P0.2)

- **Checklist** (~100 linhas, glob `src/**`) + **full** em `.task-flow/guides/coding-standards-full.md` sob demanda.
- Skill `rbin-coding-standards`: `disable-model-invocation: true`; lê seções do full doc só se ambíguo.

### 4.3 Duplicação skill + regra no `run` — parcial (P0.3 ✅)

- `task_work.mdc` enxugado (~40 linhas); fonte da verdade: `@task-flow-run` + `workflow.md`.
- Evitar `@task_work` ou `task_execution` + skill juntos — usar só `@task-flow-*`.

### 4.4 Duplicação no `sync` — resolvido (P1.1)

- **`task-flow-sync.mdc`** — procedimento único de sync
- `task_generation.mdc` — só templates de subtarefas
- `task_analysis.mdc` — só `think`
- Skill `task-flow-sync` + `workflow.md`

### 4.5 Meta-regras raramente necessárias

- `cursor_rules.mdc`, `self_improve.mdc` — úteis só ao editar o próprio pacote de regras

### 4.6 Documentação desatualizada — resolvido (P0.6 / v1.23)

- `platforms/cursor.md` e `CURSOR.md` alinhados a 2 always-on + skills-first.

### 4.7 Graphify

- `GRAPH_REPORT.md` ou saída enorme de `graphify query` no contexto
- Custo variável por subtarefa

### 4.8 Dados Task Flow

- Ler `tasks.json` inteiro a cada `run` em projetos grandes

### 4.9 Instalação e versionamento

- `.cursor/` e `.claude/` no `.gitignore` do cliente — skills não versionadas no repo do app
- ~~Sem perfil `minimal` vs `standard` no CLI~~ → `init|update|reset --profile minimal|standard` (P2.1)

---

## 5. Orçamento alvo (tokens de instrução)

| Modo | Always-on | Sob demanda típico | Total típico |
|------|-----------|-------------------|--------------|
| **Minimal** (meta) | ~1,2k | skill ~0,5k | **~1,7k** |
| **Run + implementar** | ~1,2k | `@task-flow-run` + checklist standards ~1,5k | **~2,7k** |
| **Audit completo** | ~1,2k | audit + standards **full** (explícito) | **~10k** (aceitável, raro) |

**Situação atual (pior caso):** run + `src/` aberto → **~12k+** só em regras (~4× o alvo de run).

---

## 6. Plano de implementação

### P0 — Quick wins (1 PR, alto ROI)

| # | Ação | Arquivos / notas | Status |
|---|------|------------------|--------|
| P0.1 | Fundir `git_control` + `commit_practices` em uma regra always (~70–90 linhas) | `.cursor/rules/rbin-git-policy.mdc` ou nome equivalente; remover always duplicado | [x] |
| P0.2 | Dividir standards: **checklist** (glob) + **full** (sob demanda) | `coding_standards.mdc` enxuto; `.task-flow/guides/coding-standards-full.md` com conteúdo atual | [x] |
| P0.3 | Enxugar `task_work.mdc` → pointer para `@task-flow-run` / `workflow.md` | ~40 linhas máx. | [x] |
| P0.4 | Enxugar `task_execution.mdc` → pointer para `task-flow-cursor` + skills | Evitar índice duplicado de `CLAUDE.md` | [x] |
| P0.5 | `rbin-coding-standards`: `disable-model-invocation: true` | `.claude/skills/` + cópia `.cursor/skills/` | [x] |
| P0.6 | Atualizar `platforms/cursor.md` (§1, §3, inventário) para v1.23 real | 2 always-on + skills; sem “standards em toda conversa” | [x] |
| P0.7 | Atualizar referências audit/sync para **checklist**, não full doc | `task_audit.mdc`, skills, `AGENTS.md`, `CODEX.md` | [x] |

### P1 — Médio prazo

| # | Ação | Status |
|---|------|--------|
| P1.1 | Unificar sync: uma regra `task-flow-sync.mdc` (intelligent) OU só skill; `task_analysis` focado em `think` | [x] |
| P1.2 | `cursor_rules.mdc` + `self_improve.mdc` → **manual only** (`@`) | [x] |
| P1.3 | Skill `task-flow-run`: “ler só task/subtask ativa em `tasks.json`” | [x] |
| P1.4 | GRAPHIFY.md: reforçar “não colar GRAPH_REPORT inteiro”; limitar saída de query | [x] |
| P1.5 | `CURSOR.md` / `CLAUDE.md`: guia “evite @task_work; use @task-flow-run” | [x] |
| P1.6 | `showNextSteps` / `info`: linha “Always-on ~X KB (~Y tokens)” | [x] |

### P2 — Estratégico

| # | Ação | Status |
|---|------|--------|
| P2.1 | CLI `init|update|reset --profile minimal\|standard` | [x] |
| P2.2 | CLI `--share-ai-config` (não ignorar `.cursor/skills/` no git do cliente) | [x] |
| P2.3 | Script `scripts/measure-rule-bytes.js` (regressão de tamanho always-on) | [x] |
| P2.4 | Entrada em CHANGELOG + bump minor por pacote de P0 | [x] |

---

## 7. Detalhamento técnico (P0.2 — split coding standards)

**Proposta de estrutura:**

```text
.cursor/rules/coding_standards.mdc     # ~80–120 linhas: checklist + links
.task-flow/guides/coding-standards-full.md   # conteúdo atual (exemplos, Nest, RHF…)
.claude/skills/rbin-coding-standards/
  SKILL.md          # aponta checklist + “read full doc if ambiguous”
  reference.md      # já existe; alinhar paths
```

**Regra de carregamento:**

| Comando / situação | Carregar |
|--------------------|----------|
| Editar `src/**` | checklist (glob) |
| `@rbin-coding-standards` | checklist + opcional full |
| `task-flow: audit` | checklist para score; full só se usuário pedir profundidade |
| `task-flow: sync` (gerar subtasks) | checklist nas instructions, não full |

---

## 8. Detalhamento técnico (P0.1 — git unificado)

**Conteúdo único always-on:**

- Proibição absoluta de git write (lista curta)
- Git read-only permitido
- Formato Conventional Commits + Task ID
- “Após subtarefa done → sugerir commit; usuário executa”

**Remover / reduzir:**

- `commit_practices.mdc` como always separado → fundido ou `alwaysApply: false` + `@commit_practices`
- Seção Git longa em `task-flow-cursor.mdc` → uma linha + `@rbin-git`

---

## 9. Guia para quem usa o pacote (v1.23+)

| Faça | Evite |
|------|--------|
| `@task-flow-run` para implementar | `@task_work` + “run” sem skill |
| Status só com `tasks.status.md` / `@task-flow-status` | Abrir muitos arquivos `src/` antes de sync |
| `@rbin-coding-standards` ao codificar | Depender do glob de standards em chat exploratório |
| `improve changes` vs audit full | `audit` em monorepo gigante sem necessidade |
| Graphify: `graphify query "…"` focado | Colar `GRAPH_REPORT.md` no chat |

**Atualizar projetos:**

```bash
rbin-task-flow reset --graphify   # template + grafo (CLI Graphify no PATH)
```

---

## 10. Quando Task Flow economiza vs gasta

### Economiza (tempo e retrabalho → menos tokens de exploração)

- Instruções por subtarefa em `tasks.json`
- `tasks.status.md` como fonte de progresso
- Graphify em `run` (menos grep/arquivos)
- Git só sugerido (menos correções)

### Gasta mais que sem Task Flow

- Sessões sem uso de tasks mas com always-on ~2,6k/turno
- `run` + glob `coding_standards` + `task_work` juntos
- Audit pedindo standards completos sem escopo

---

## 11. Critérios de sucesso (Definition of Done)

- [x] Always-on total ≤ **~5 KB** (~1,2k tokens) — verificado com `npm run measure:rules` (v1.23.0: ~3,7 KB)
- [x] `task-flow: run next 1` com um arquivo `src/` no chat: instruções ≤ **~4k tokens** (sem pedir full standards) — skills + checklist glob, não full doc always-on
- [x] Nenhuma duplicação skill + regra longa para o mesmo comando (run, sync) — `@task-flow-run` / `task-flow-sync.mdc`; stubs curtos
- [x] Docs `platforms/cursor.md` e `CURSOR.md` alinhados ao comportamento real
- [x] CHANGELOG documenta breaking changes de regras (v1.23.0 minor)

---

## 12. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Agent deixa de seguir standards sem full doc | Checklist obrigatório + `@rbin-coding-standards` documentado |
| Apply Intelligently falha em “run” | Manter fallback curto em `task_work.mdc` |
| Projetos antigos com `commit_practices` always | `update` migra/rebaixa; nota no CHANGELOG |
| Codex não lê skills | Manter `AGENTS.md` + `CODEX.md` com paths para checklist |

---

## 13. Histórico do documento

| Data | Nota |
|------|------|
| 2026-06-02 | Plano inicial pós auditoria v1.22 (Cursor skills, 3 always-on, reset --graphify) |
| 2026-06-02 | P0–P2 implementado; release npm **v1.23.0** (minor) — 2 always-on, `measure:rules`, profiles, share-ai-config |

---

*Plano vivo — marcar checkboxes conforme PRs forem mergeados. Não editar manualmente os status das tasks do cliente; este arquivo é meta-documentação do pacote RBIN.*
