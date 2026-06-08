# Tarefas de implementação — Otimização de tokens (RBIN Task Flow)

Subtarefas para IA implementar o [OPTIMIZATION-PLAN.md](OPTIMIZATION-PLAN.md). Cada bloco é **uma task**; itens numerados são **subtasks** executáveis em sequência (`task-flow: run next X` após colar em `tasks.input.txt`, ou seguir manualmente).

**Repositório:** pacote `rbin-task-flow` (template). **Não** editar `.task-flow/.internal/` do cliente — só arquivos do pacote.

**Pré-requisito:** ler [OPTIMIZATION-PLAN.md](OPTIMIZATION-PLAN.md) §5–8 (orçamento e detalhamento P0.1/P0.2).

**Ao concluir cada subtask:** marcar `- [x]` aqui; atualizar checkboxes em `OPTIMIZATION-PLAN.md` §6; entrada no `CHANGELOG.md` no fim de cada **task** (P0/P1/P2).

---

## Como usar com Task Flow

1. Copiar linhas `- Task …` da seção [Formato tasks.input.txt](#formato-tasksinputtxt) para `.task-flow/tasks.input.txt`.
2. `task-flow: sync`
3. `task-flow: run 1` (ou `run next N`) — respeitar ordem: **Task 1 → 2 → …** (dependências).
4. `task-flow: check` antes de considerar PR pronto.
5. Medir always-on: `node scripts/measure-rule-bytes.js` (após Task 10 existir) ou `wc -c` nas regras `alwaysApply: true`.

**Invoke preferido (Cursor/Claude):** `@task-flow-run` — evitar `@task_work` durante este epic.

---

## Dependências entre tasks

```text
Task 1 (git) ──┐
Task 2 (standards split) ──┼──► Task 7 (referências checklist)
Task 3 (task_work) ─────────┤
Task 4 (task_execution) ───┤
Task 5 (skill standards) ────┘ (após Task 2)
Task 6 (cursor.md docs) ───► após 1–5
Task 7 (audit/sync refs) ──► após Task 2
Task 8–9 (P1) ─────────────► após Task 6–7
Task 10–13 (P2) ───────────► após P0 completo
```

---

## Task 1 — P0.1: Unificar política de git (always-on único) ✅

**Objetivo:** always-on ≤ ~1,2k tokens para git+commits (hoje ~2,1k em duas regras).

### Subtask 1.1 — Criar `rbin-git-policy.mdc` ✅

**Descrição:** Nova regra always-on fundindo git proibido + Conventional Commits + sugestão pós-subtask.

**Instruções:**
1. Criar `.cursor/rules/rbin-git-policy.mdc` com frontmatter: `alwaysApply: true`, `description` opcional curta.
2. Incluir: lista proibida (`git add`, `commit`, `push`, `pull`, `merge`, `checkout`, `reset`, `rebase`, `tag`); permitidos read-only (`status`, `diff`, `log`, `show`, `branch` list); formato de sugestão Conventional Commits + Task/Subtask ID; princípio “usuário executa git”.
3. Manter ≤ **90 linhas** (~3,5 KB máx.).
4. Não duplicar parágrafos longos de exemplos — no máximo 1 exemplo de mensagem de commit.

**Critério de aceite:** `rg 'alwaysApply: true' .cursor/rules` inclui `rbin-git-policy.mdc`; arquivo ≤ 90 linhas.

---

### Subtask 1.2 — Rebaixar regras git antigas ✅

**Descrição:** Remover always duplicado sem perder referências `mdc:`.

**Instruções:**
1. Em `git_control.mdc`: setar `alwaysApply: false`; adicionar `description` “Legacy git detail — prefer rbin-git-policy.mdc”; corpo ≤ 15 linhas apontando para `rbin-git-policy.mdc` e `@rbin-git` skill.
2. Em `commit_practices.mdc`: idem — `alwaysApply: false`, pointer para `rbin-git-policy.mdc`.
3. Atualizar `task-flow-cursor.mdc`: seção Git → 2 linhas (“Never write git” + “Details: `rbin-git-policy.mdc`, suggest via `@rbin-git`”).

**Critério de aceite:** Exatamente **2** regras always-on de política: `task-flow-cursor.mdc` + `rbin-git-policy.mdc` (não `git_control` nem `commit_practices`).

---

### Subtask 1.3 — Atualizar referências cruzadas ✅

**Descrição:** Rules e skills apontam para a política unificada.

**Instruções:**
1. `rg 'git_control|commit_practices' .cursor .claude AGENTS.md CLAUDE.md .task-flow` — atualizar links `mdc:` para `rbin-git-policy.mdc` onde for regra primária; manter legado só como “extended”.
2. `.claude/skills/rbin-git/SKILL.md`: primeira linha “Complements `rbin-git-policy.mdc` (always-on)”.
3. `install.sh` / `lib/graphify.js` / docs: sem mudança funcional; só se citarem always git explicitamente.

**Critério de aceite:** `rg 'commit_practices.mdc' .cursor/rules/task-flow-cursor.mdc` não assume always; política primária é `rbin-git-policy`.

---

## Task 2 — P0.2: Dividir coding standards (checklist + full) ✅

**Objetivo:** glob `src/**` carrega ~80–120 linhas, não 853.

### Subtask 2.1 — Mover conteúdo completo para doc ✅

**Descrição:** Preservar 100% do conteúdo atual em arquivo sob demanda.

**Instruções:**
1. Criar `.task-flow/docs/` se não existir.
2. Copiar corpo atual de `.cursor/rules/coding_standards.mdc` (sem frontmatter) para `.task-flow/guides/coding-standards-full.md`.
3. Adicionar cabeçalho no full doc: “Carregar sob demanda — audit profundo, dúvidas de arquitetura; não colar no chat inteiro.”

**Critério de aceite:** `coding-standards-full.md` ≥ linhas do antigo corpo; nenhuma seção crítica perdida.

---

### Subtask 2.2 — Reescrever `coding_standards.mdc` como checklist ✅

**Descrição:** Regra glob enxuta com links para full doc.

**Instruções:**
1. Manter frontmatter: `alwaysApply: false`, `globs: src/**,app/**`, `description` clara.
2. Corpo **80–120 linhas**: estrutura `app/features/shared`; app thin; page orchestrator; service+use-case; RHF+zod; `cn()`; sem `any`; sem raw button/input; naming suffixes (tabela compacta); link `mdc:.task-flow/guides/coding-standards-full.md` para detalhes.
3. Remover exemplos de código longos do `.mdc` (ficam no full doc).

**Critério de aceite:** `wc -l .cursor/rules/coding_standards.mdc` ≤ 130; `wc -c` ≤ 6 KB.

---

### Subtask 2.3 — Garantir cópia no install ✅

**Descrição:** Projetos destino recebem o full doc.

**Instruções:**
1. Verificar `lib/install.js` `copyTaskFlow` copia `.task-flow/docs/` (ajustar `filter` se excluir `docs`).
2. `install.sh`: copiar `.task-flow/docs/` se script copiar `.task-flow` parcialmente.
3. `.task-flow/README.md`: link para `docs/coding-standards-full.md`.

**Critério de aceite:** Após `node -e` simular copy ou inspeção de `copyTaskFlow`, `docs/coding-standards-full.md` está no template e será copiado.

---

## Task 3 — P0.3: Enxugar `task_work.mdc` ✅

**Objetivo:** fallback intelligent ≤ 40 linhas; skill é fonte da verdade.

### Subtask 3.1 — Substituir corpo por pointer ✅

**Instruções:**
1. Manter `description` citando `task-flow: run`, `run next X`, `run N`.
2. Corpo: tabela comando → `@task-flow-run`; 5 bullets do fluxo crítico (read tasks.json/status, deps, update status, suggest commit); link `.claude/skills/task-flow-run/workflow.md`.
3. Remover exemplos longos e duplicação de `task_execution`.

**Critério de aceite:** `wc -l task_work.mdc` ≤ 45.

---

## Task 4 — P0.4: Enxugar `task_execution.mdc` ✅

**Objetivo:** eliminar índice duplicado de `CLAUDE.md` / `task-flow-cursor`.

### Subtask 4.1 — Stub de referência ✅

**Instruções:**
1. `description`: “Task Flow command index — use task-flow-cursor.mdc and skills first.”
2. Corpo ≤ 25 linhas: tabela comando → skill `@`; link `task-flow-cursor.mdc`, `CLAUDE.md`, `.task-flow/README.md`.
3. `alwaysApply: false` (já deve estar).

**Critério de aceite:** `wc -l task_execution.mdc` ≤ 30.

---

## Task 5 — P0.5: Skill `rbin-coding-standards` sob demanda estrita ✅

**Depende de:** Task 2.

### Subtask 5.1 — Ajustar frontmatter e SKILL.md ✅

**Instruções:**
1. `.claude/skills/rbin-coding-standards/SKILL.md`: `disable-model-invocation: true`.
2. Steps: (1) aplicar checklist em `coding_standards.mdc`; (2) só se ambíguo, ler `.task-flow/guides/coding-standards-full.md` seções relevantes — **não** colar arquivo inteiro no chat.
3. `reference.md`: paths atualizados para checklist + full doc.

**Critério de aceite:** skill não referencia “ler coding_standards.mdc inteiro” como passo 1.

---

## Task 6 — P0.6: Atualizar documentação Cursor (v1.23+) ✅

**Depende de:** Tasks 1, 3, 4.

### Subtask 6.1 — Corrigir `platforms/cursor.md` ✅

**Instruções:**
1. §1: only **2** always de política (`task-flow-cursor` + `rbin-git-policy`) — ajustar texto que diz “3” se Task 1 mudar contagem; listar reais após P0.1.
2. §2 matriz e §3 inventário: modos reais (Intelligent / Glob / Manual); não listar `task_work` como Always.
3. § “Otimização agressiva”: marcar como **implementado** o que P0 cobriu; apontar para OPTIMIZATION-PLAN.

**Critério de aceite:** Nenhuma frase “coding standards em toda conversa Agent”.

---

### Subtask 6.2 — Atualizar `CURSOR.md` e `AI-PLATFORMS.md` ✅

**Instruções:**
1. `CURSOR.md` tabela Rule modes: always = `task-flow-cursor` + `rbin-git-policy`.
2. Troubleshooting: “evite `@task_work`; use `@task-flow-run`”.
3. `AI-PLATFORMS.md` tabela install: `rbin-git-policy.mdc`, `docs/coding-standards-full.md`.

**Critério de aceite:** docs consistentes com `rg alwaysApply: true .cursor/rules`.

---

## Task 7 — P0.7: Referências audit/sync → checklist ✅

**Depende de:** Task 2. *(Concluída junto com Task 2.)*

### Subtask 7.1 — Rules ✅

**Instruções:**
1. `task_audit.mdc`, `task_improve_changes.mdc`, `task_generation.mdc`: scoring/instructions vs **checklist** (`coding_standards.mdc`); full doc só “user asks depth / architecture”.
2. `graphify-task-flow.mdc`: linha audit → checklist, não full.

**Critério de aceite:** `rg 'coding-standards-full' .cursor/rules` presente onde audit menciona profundidade.

---

### Subtask 7.2 — Skills e Codex ✅

**Instruções:**
1. `task-flow-audit`, `task-flow-improve-changes`, `task-flow-sync` SKILL.md: paths checklist + full.
2. `AGENTS.md` tabela Commands: audit/implement → checklist; full path explícito opcional.
3. `.task-flow/guides/CODEX.md`: mesma distinção.

**Critério de aceite:** AGENTS.md não manda “ler coding_standards.mdc inteiro” sem qualificador.

---

## Task 8 — P1.1: Unificar sync (regra + analysis) ✅

### Subtask 8.1 — Criar ou consolidar `task-flow-sync.mdc` ✅

**Instruções:**
1. Opção A: novo `.cursor/rules/task-flow-sync.mdc` (intelligent) com workflow de sync (~60 linhas) extraído de `task_generation` + `task_analysis`.
2. `task_generation.mdc`: remover bloco sync duplicado; pointer para `task-flow-sync.mdc` / `@task-flow-sync`.
3. `task_analysis.mdc`: remover sync; manter `think` + roadmap `OPTIMIZATION-PLAN`.

**Critério de aceite:** um único lugar primário para procedimento `task-flow: sync`.

---

## Task 9 — P1.2–P1.6: Polish P1 ✅

### Subtask 9.1 — Meta-regras manual only (P1.2) ✅

**Instruções:** `cursor_rules.mdc`, `self_improve.mdc`: sem `description` de auto-match amplo; nota “Invoke with @ only” no topo.

---

### Subtask 9.2 — Skill run: leitura parcial tasks.json (P1.3) ✅

**Instruções:** `task-flow-run/SKILL.md` + `workflow.md`: passo “Parse only pending task/subtask IDs; do not load full tasks.json into context if >50 subtasks — read JSON slice by task id”.

---

### Subtask 9.3 — GRAPHIFY.md limites (P1.4) ✅

**Instruções:** Adicionar seção “Token discipline”: max usar saída resumida de query; proibir colar `GRAPH_REPORT.md` salvo `@` explícito do usuário.

---

### Subtask 9.4 — CLAUDE.md anti-patterns (P1.5) ✅

**Instruções:** 3 bullets: prefer `/task-flow-run`; avoid loading full standards; link CURSOR.md.

---

### Subtask 9.5 — CLI info bytes (P1.6) ✅

**Instruções:** `lib/cursor.js` ou `lib/utils.js` `showNextSteps`: após install, calcular soma `wc -c` dos `.mdc` com `alwaysApply: true` e imprimir “Always-on rules: ~X KB”.

---

## Task 10 — P2.1: CLI `--profile minimal|standard` ✅

### Subtask 10.1 — Flag e comportamento ✅

**Instruções:**
1. `bin/cli.js`: `--profile <minimal|standard>` em init/update/reset (default `standard`).
2. `minimal`: copiar só `task-flow-cursor.mdc`, `rbin-git-policy.mdc`, skills, `.task-flow/`; não copiar regras intelligent pesadas OU copiar stubs apenas.
3. Documentar em README + OPTIMIZATION-PLAN.

**Critério de aceite:** `init --profile minimal` deixa ≤ 3 always-on e skills; standard = comportamento atual pós-P0.

---

## Task 11 — P2.2: `--share-ai-config` ✅

### Subtask 11.1 — Gitignore opcional ✅

**Instruções:**
1. Flag `--share-ai-config` em init: **não** adicionar `.cursor/skills/` (e opcionalmente `.cursor/rules/`) ao gitignore gerado.
2. Comentário no `.gitignore` explicando trade-off tokens vs time.

**Critério de aceite:** com flag, `.cursor/skills` ausente do gitignore template.

---

## Task 12 — P2.3: Script `measure-rule-bytes.js` ✅

### Subtask 12.1 — Implementar medição ✅

**Instruções:**
1. `scripts/measure-rule-bytes.js`: listar `.cursor/rules/*.mdc`, parse frontmatter `alwaysApply`, imprimir tabela arquivo | bytes | linhas | always.
2. Totais always-on vs resto; exit 1 se always-on > 5 KB (configurável).
3. `package.json` script `"measure:rules": "node scripts/measure-rule-bytes.js"`.

**Critério de aceite:** script roda no CI local; README menciona.

---

## Task 13 — P2.4: Release P0 (CHANGELOG + version) ✅

### Subtask 13.1 — Bump e notas ✅

**Instruções:**
1. `package.json` minor bump (ex. 1.23.0).
2. CHANGELOG: P0 breaking — `rbin-git-policy`, standards split, always-on count, migration `rbin-task-flow update`.
3. OPTIMIZATION-PLAN.md §6: marcar P0.1–P0.7 `[x]`.

**Critério de aceite:** Definition of Done §11 do OPTIMIZATION-PLAN verificada com script Task 12.

---

## Verificação final (após Task 13) ✅

| Métrica | Comando / ação | Meta | v1.23.0 |
|---------|----------------|------|---------|
| Always-on bytes | `npm run measure:rules` | ≤ 5 KB | ~3,66 KB ✅ |
| Always-on count | `rg -l 'alwaysApply: true' .cursor/rules` | ≤ 3 arquivos | 2 ✅ |
| coding_standards | `wc -l .cursor/rules/coding_standards.mdc` | ≤ 130 | 101 ✅ |
| Run path | `@task-flow-run` + checklist glob | sem full doc always-on | ✅ |
| Check | `npm run measure:rules` | pass | exit 0 ✅ |

---

## Formato tasks.input.txt

Copie abaixo para `.task-flow/tasks.input.txt` e rode `task-flow: sync`:

```text
- P0.1 Unificar política de git (rbin-git-policy always-on)
- P0.2 Dividir coding standards (checklist mdc + full doc)
- P0.3 Enxugar task_work.mdc (pointer para task-flow-run skill)
- P0.4 Enxugar task_execution.mdc (stub para task-flow-cursor)
- P0.5 Skill rbin-coding-standards disable-model-invocation e paths
- P0.6 Atualizar documentação Cursor e AI-PLATFORMS
- P0.7 Referências audit sync Codex para checklist
- P1.1 Unificar sync task-flow-sync.mdc e task_analysis ✅
- P1.2–P1.6 Polish P1 (meta-rules, run partial JSON, GRAPHIFY, CLAUDE, CLI bytes) ✅
- P2.1 CLI profile minimal e standard ✅
- P2.2 CLI share-ai-config gitignore ✅
- P2.3 Script measure-rule-bytes.js ✅
- P2.4 Release CHANGELOG bump e fechar P0 no OPTIMIZATION-PLAN ✅
```

Após sync, o gerador de subtasks pode expandir cada linha usando as **Instruções** das subtasks deste arquivo como fonte (ou manter este `.md` como referência fixa durante `run`).

---

## Histórico

| Data | Nota |
|------|------|
| 2026-06-02 | Criado a partir de OPTIMIZATION-PLAN.md — 13 tasks, subtarefas para IA |
| 2026-06-02 | Tasks 1–13 concluídas — release npm **v1.23.0** (minor) |

---

*Referência: [OPTIMIZATION-PLAN.md](OPTIMIZATION-PLAN.md) · Índice: [README.md](../README.md)*
