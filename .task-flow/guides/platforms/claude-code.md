# Task Flow no Claude Code

Guia para extrair o máximo do **RBIN Task Flow** no [Claude Code](https://code.claude.com/) (CLI e integrações). Comandos `task-flow: …` são os mesmos em todas as plataformas; aqui o foco é **como o Claude carrega contexto** e como estruturar o projeto.

**Índice geral:** [AI-PLATFORMS.md](../AI-PLATFORMS.md) · **Outras plataformas:** [cursor.md](cursor.md) · [codex.md](codex.md)

---

## 1. Como o Claude Code pensa contexto

| Mecanismo | Caminho | Quando entra no contexto | Custo |
|-----------|---------|-------------------------|-------|
| **Memória do projeto** | `CLAUDE.md` (raiz e pais) | **Toda sessão** | Fixo por sessão |
| **Skills** | `.claude/skills/<nome>/SKILL.md` | Sob demanda (`/nome`) ou quando o modelo acha relevante pela `description` | Só quando usada |
| **Comandos legados** | `.claude/commands/*.md` | Igual a skill com mesmo nome | Sob demanda |
| **Settings** | `.claude/settings.json` | Config (modelo, permissões) | Metadados |
| **Regras Cursor** | `.cursor/rules/*.mdc` | **Não é nativo** — Claude pode ler se você pedir ou abrir o arquivo | Manual |

Documentação: [Extend Claude with skills](https://code.claude.com/docs/en/skills).

**Regra de ouro do curso Claude:** se algo é um **procedimento repetível** (“sempre que sync, faça X, Y, Z”), não deixe no `CLAUDE.md` — vire **skill**. `CLAUDE.md` guarda fatos estáveis: stack, caminhos, políticas curtas, índice de skills.

---

## 2. O que o RBIN Task Flow instala hoje

```
projeto/
├── CLAUDE.md                 # Índice enxuto + tabela de skills
├── .claude/
│   ├── settings.json
│   └── skills/               # 10 skills (task-flow-*, rbin-*)
├── .cursor/
│   ├── rules/                # Referência + Cursor alwaysApply
│   └── skills/               # Espelho das mesmas skills
└── .task-flow/
```

Após `rbin-task-flow init` ou `update`, use **`/task-flow-sync`**, **`/task-flow-run`**, etc. Reinicie o Claude Code se `.claude/skills/` foi criado pela primeira vez na sessão.

---

## 3. Arquitetura recomendada (Claude-first + Task Flow)

```text
CLAUDE.md                          # ≤ 150 linhas: índice + invariantes
.claude/
├── settings.json                  # modelo opcional; permissões
└── skills/
    ├── task-flow-sync/
    │   ├── SKILL.md
    │   └── workflow.md
    ├── task-flow-run/
    │   ├── SKILL.md
    │   └── workflow.md
    ├── task-flow-audit/
    └── rbin-git/
.task-flow/                        # tasks, status, contexts (inalterado)
```

**Invariantes no `CLAUDE.md` (sempre carregados):**

- “Task flow” = RBIN Task Flow; dados em `.task-flow/`.
- Nunca executar `git add`, `commit`, `push`, `pull`, `merge`, `checkout`, `reset`, `rebase`.
- Após subtarefa concluída: sugerir commit (Conventional Commits + ID da task).
- Índice: “sync → `/task-flow-sync` ou `task-flow: sync`”.

**Procedimentos nas skills:** conteúdo de `task_work.mdc`, `task_generation.mdc`, etc.

---

## 4. Skills: anatomia e boas práticas

### 4.1 Estrutura de pasta

```text
task-flow-run/
├── SKILL.md           # Obrigatório — entrada
├── workflow.md        # Passos completos (carregar quando executar)
├── checklist.md       # Opcional
└── scripts/           # Opcional — validação, não lógica de negócio
```

### 4.2 Frontmatter essencial

| Campo | Uso com Task Flow |
|-------|-------------------|
| `description` | **Obrigatório para descoberta.** Terceira pessoa, WHAT + WHEN, termos `task-flow`, `run next`, `sync`, `RBIN`. Limite ~1536 caracteres na listagem. |
| `name` | Opcional; comando `/` vem do **nome da pasta** (`task-flow-run` → `/task-flow-run`). |
| `disable-model-invocation: true` | Workflows com efeito colateral: `run`, `sync`, deploy. Você dispara; Claude não “decide” sozinho. |
| `user-invocable: false` | Conhecimento de fundo (ex.: legado) — raro no Task Flow. |
| `allowed-tools` | Restringir ferramentas em skills sensíveis (ex.: só `Read`, `Grep` para audit read-only). |
| `paths` | Ex.: `[".task-flow/**"]` — auto-carregar skill ao editar arquivos de task. |
| `context: fork` + `agent` | Tasks longas (`run all`) em subagente isolado. |

### 4.3 Tipos de conteúdo na skill

| Tipo | Exemplo Task Flow |
|------|------------------|
| **Referência** | `/rbin-coding-standards` sob demanda (`disable-model-invocation: true`) — checklist primeiro |
| **Tarefa** | `task-flow-run`, `task-flow-sync` — passos sequenciais; use `disable-model-invocation: true` |

Mantenha o corpo do `SKILL.md` **curto** (< 500 linhas). Detalhe em `workflow.md`.

### 4.4 Injeção dinâmica (diferencial do Claude Code)

Inclua estado real **antes** das instruções:

```markdown
## Status atual

!`cat .task-flow/tasks.status.md | head -40`

## Próximas subtarefas pendentes

!`node -e "const s=require('./.task-flow/.internal/status.json'); ..."`

## Instruções

1. ...
```

O prefixo `` !`comando` `` executa o comando e substitui a linha pelo output. Ideal para `run` e `validate`.

### 4.5 Descoberta e monorepos

- Skills em `.claude/skills/` na **raiz** do repo são vistas ao iniciar na raiz ou em subpastas (walk para cima).
- Ao editar arquivos em `packages/api/`, Claude também procura `packages/api/.claude/skills/`.
- **Watcher:** editar skill existente → efeito na sessão atual. **Criar** pasta `.claude/skills/` pela primeira vez → **reiniciar** Claude Code.

### 4.6 Prioridade de nomes

Enterprise > pessoal (`~/.claude/skills/`) > projeto. Skills de plugin: namespace `plugin:skill`.

Para Task Flow em equipe: prefira **skills de projeto** versionadas (ajuste o `.gitignore` — ver seção 10).

---

## 5. Mapeamento: comando → skill → regra `.mdc`

| Comando usuário | Skill sugerida | `/` | Regra fonte |
|-----------------|----------------|-----|-------------|
| `task-flow: from contexts` | `task-flow-from-contexts` | `/task-flow-from-contexts` | `task_from_contexts.mdc` |
| `task-flow: sync` | `task-flow-sync` | `/task-flow-sync` | `task-flow-sync.mdc` · `task_generation.mdc` (subtasks) |
| `task-flow: run next X` / `run X` | `task-flow-run` | `/task-flow-run` | `workflow.md` · stub `task_work.mdc` |
| `task-flow: status` | `task-flow-status` | `/task-flow-status` | `task_status.mdc` |
| `task-flow: audit` | `task-flow-audit` | `/task-flow-audit` | `task_audit.mdc` |
| `task-flow: estimate X` / `X,Y` / `all` | `task-flow-estimate` | `/task-flow-estimate` | `task_estimate.mdc` |
| `task-flow: report X` | `task-flow-report` | `/task-flow-report` | `task_report.mdc` |
| Implementar código | `rbin-coding-standards` | `/rbin-coding-standards` | checklist `coding_standards.mdc` + `docs/coding-standards-full.md` on demand |
| Após concluir subtarefa | `rbin-git` | `/rbin-git` | `rbin-git-policy.mdc` (always) |

---

## 6. Exemplo completo: `task-flow-run`

**`.claude/skills/task-flow-run/SKILL.md`:**

```yaml
---
name: task-flow-run
description: Executes RBIN Task Flow subtasks from tasks.json and status.json. Use when the user says task-flow run, run next X subtasks, work on task N, execute pending subtasks, or implement task flow.
disable-model-invocation: true
allowed-tools: Read Write Edit Glob Grep Shell
paths: [".task-flow/**"]
---

# Task Flow — Run

## Status (resumo)

!`head -35 .task-flow/tasks.status.md`

## Quick steps

1. Read `.task-flow/.internal/tasks.json` and `status.json`.
2. Parse intent: `run next X` | `run X` | `run X,Y` | `run all`.
3. For `run X`: block if tasks `1..X-1` have pending subtasks.
4. Per subtask: follow `instructions`; read `.task-flow/contexts/*` if referenced.
5. Update `status.json` + `tasks.status.md` (regenerate 📊 Summary).
6. Suggest commit; **never** `git add`/`commit`/`push`.

## Full procedure

See [workflow.md](workflow.md).
```

Copie o corpo longo de `.cursor/rules/task_work.mdc` para `workflow.md`.

---

## 7. Fluxos de trabalho otimizados

### 7.1 Dia a dia (desenvolvimento)

```text
1. Editar .task-flow/tasks.input.txt
2. /task-flow-sync   (ou: task-flow: sync)
3. /task-flow-status
4. /task-flow-run run next 3
5. Você: git add && git commit  (mensagem sugerida pela IA)
```

### 7.2 Antes do PR

```text
/task-flow-validate
```

### 7.3 Planejamento / cobrança

```text
/task-flow-estimate 3
/task-flow-estimate 1,2,3
/task-flow-estimate all
```

### 7.4 Múltiplos agentes no mesmo repo

- Use **checagem de dependência** (`run 3` só se 1–2 done) — já em `task_work.mdc`.
- Skills com `disable-model-invocation: true` evitam dois Claudes disparando `sync` ao mesmo tempo sem intenção.

---

## 8. Bundled skills do Claude Code (complementares)

Skills nativas úteis **junto** com Task Flow ([docs](https://code.claude.com/docs/en/skills)):

| Skill | Uso com Task Flow |
|-------|-------------------|
| `/code-review` | Após `task-flow: run`, antes do commit |
| `/debug` | Subtarefa travada em bug |
| `/verify` | Validar app rodando em runtime |
| `/run` | Subir app para testar UI de subtarefa |
| `/run-skill-generator` | Uma vez por repo — grava receita de build em `.claude/skills/run-*/` |

`/verify` cobre comportamento em runtime quando testes não bastam.

---

## 9. `CLAUDE.md` enxuto (template)

```markdown
# Projeto

Stack: …

## RBIN Task Flow

- Tarefas: `.task-flow/tasks.input.txt`
- Status: `.task-flow/tasks.status.md` (auto)
- Dados: `.task-flow/.internal/` (não editar à mão)
- Contextos: `.task-flow/contexts/`

## Skills (preferir `/` ou pedir por nome)

| Ação | Skill |
|------|--------|
| Sync | `/task-flow-sync` |
| Executar | `/task-flow-run` |
| Status | `/task-flow-status` |
| Padrões de código | `/rbin-coding-standards` |

Comandos naturais `task-flow: …` também valem.

## Git

Nunca executar git que modifica o repo. Sugerir Conventional Commits com Task ID.

## Referência legada

Detalhe completo ainda em `.cursor/rules/` se uma skill não existir.
```

---

## 10. Versionamento e `.gitignore`

O instalador RBIN ignora `.claude/` no git do cliente. Para **time + Claude**:

```gitignore
# Manter skills no repo; ignorar só local
.claude/settings.local.json
# NÃO ignorar .claude/skills/
```

Ou use `AGENTS.override.md` / settings locais fora do git e commite `.claude/skills/`.

---

## 11. Prompts que funcionam

| Situação | Prompt |
|----------|--------|
| Com skills | `/task-flow-run run next 4` |
| Com skills | `Use a skill task-flow-sync` |
| Sem skills ainda | `Leia .cursor/rules/task_work.mdc e execute task-flow: run next 2` |
| Contexto visual | `Implemente subtarefa 1.3; mockup em .task-flow/contexts/login.png` |
| Forçar padrões | `/rbin-coding-standards depois task-flow: run next 1` |

---

## 12. Anti-padrões

| Evite | Por quê |
|-------|---------|
| Colar `task_work.mdc` inteiro no `CLAUDE.md` | Estoura contexto fixo da sessão |
| `disable-model-invocation: false` em `sync`/`run` | Claude pode executar workflow pesado sem você pedir |
| Editar `status.json` à mão | Dessincroniza `tasks.status.md` |
| Confiar só em “continua as tasks” | Sem número ou skill, ordem fica ambígua |
| Ignorar reinício após criar `.claude/skills/` | Skills não aparecem no `/` |

---

## 13. Checklist de maturidade Claude + Task Flow

- [x] `CLAUDE.md` enxuto com índice de skills
- [x] Skills instaladas via `rbin-task-flow init` (10 skills)
- [x] `paths: [".task-flow/**"]` em `task-flow-run`, `sync`, `estimate`, `report`
- [x] Injeção `` !`head tasks.status.md` `` em `task-flow-run`
- [ ] `.claude/skills/` versionado no git (ajustar `.gitignore` se o time quiser)
- [ ] `.task-flow/contexts/` populado para tasks de UI
- [ ] `graphify extract .` em repos grandes (opcional)

---

## 14. Graphify (opcional)

Durante **`task-flow: run`**, use `/graphify` ou `graphify query` para achar módulos — não substitua atualização de status. O Task Flow **não** roda `graphify claude install` no init (evita inchhar `CLAUDE.md`). Ver [GRAPHIFY.md](../GRAPHIFY.md).

---

## 15. Referências

- [Claude Code — Skills](https://code.claude.com/docs/en/skills)
- [Agent Skills open standard](https://agentskills.io/) (interoperável com Cursor)
- Comandos Task Flow: [../../README.md](../../README.md)
- Regras completas: `../../.cursor/rules/`

---

*Atualize este guia quando o instalador passar a incluir `.claude/skills/` no template.*
