# Task Flow no OpenAI Codex

Guia para extrair o máximo do **RBIN Task Flow** no [OpenAI Codex](https://developers.openai.com/codex) (CLI, IDE, TUI). Codex **não** lê `.cursor/rules/*.mdc` automaticamente — a entrada do projeto é **`AGENTS.md`**. Este guia cobre descoberta, limites de tamanho e como compensar a ausência de rules.

**Índice geral:** [AI-PLATFORMS.md](../AI-PLATFORMS.md) · **Outras plataformas:** [claude-code.md](claude-code.md) · [cursor.md](cursor.md)

---

## 1. Como o Codex carrega instruções

### 1.1 Cadeia de descoberta (ordem de precedência)

1. **Global** (`~/.codex/`): `AGENTS.override.md` **ou** `AGENTS.md` (só o primeiro não vazio).
2. **Projeto** (da raiz Git até o diretório atual): em **cada pasta**, `AGENTS.override.md` → `AGENTS.md` → fallbacks em `project_doc_fallback_filenames` (config).
3. **Merge:** arquivos concatenados da raiz → folha, separados por linha em branco. **Mais profundo vence** (aparece por último).

Documentação: [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md).

### 1.2 Limite crítico: 32 KiB (truncamento silencioso)

Por padrão, `project_doc_max_bytes` = **32 KiB** para a cadeia combinada. Acima disso, o Codex **corta sem aviso**.

| Implicação para Task Flow |
|---------------------------|
| Não cole `coding_standards.mdc` inteiro no `AGENTS.md` |
| Task Flow no `AGENTS.md` = **resumo + links** |
| Detalhe em arquivos referenciados que o Codex **lê com ferramentas** quando você pede |
| Monorepo: `services/api/AGENTS.md` com regras locais em vez de um root gigante |

Aumentar limite (exemplo em `~/.codex/config.toml` ou `.codex/config.toml`):

```toml
project_doc_max_bytes = 65536
```

Verifique o que o Codex realmente vê:

```bash
codex --ask-for-approval never "Summarize the current instructions you are following."
```

### 1.3 O que o Codex **não** carrega do RBIN

| Artefato | Codex |
|----------|-------|
| `.cursor/rules/*.mdc` | ❌ Ignorado na descoberta automática |
| `CLAUDE.md` | ❌ (a menos que esteja em `project_doc_fallback_filenames`) |
| `.claude/skills/` | ❌ |
| `.task-flow/.internal/*.json` | ✅ Via leitura de arquivo quando a tarefa pede |

O instalador RBIN copia **`AGENTS.md`** (resumo) + todo `.cursor/rules/` (para Cursor/Claude, não para Codex nativo).

---

## 2. O que o RBIN Task Flow instala para Codex

```
projeto/
├── AGENTS.md                 # Entrada Codex: git + tabela de comandos + sync/run embutidos
├── .codex/
│   └── config.toml           # project_doc_max_bytes = 65536 (se não existir)
├── .task-flow/
│   ├── CODEX.md              # Workflows completos (ler sob demanda)
│   └── platforms/codex.md    # Este guia
└── .cursor/rules/            # Lidos quando AGENTS.md / CODEX.md indicam
```

**v1.21+:** `sync` e `run` vêm **resumidos no AGENTS.md** (~dentro do orçamento 32–64 KiB). Demais comandos → ler `.task-flow/guides/CODEX.md` ou `.mdc` indicado.

Verifique após init:

```bash
codex --ask-for-approval never "Summarize RBIN Task Flow instructions."
```

---

## 3. Arquitetura recomendada (Codex + Task Flow)

```text
AGENTS.md                          # ≤ 8–12 KiB: invariantes + índice + links
.task-flow/
├── tasks.input.txt
├── tasks.status.md
├── platforms/                     # Este guia
│   └── codex.md
└── .internal/
src/AGENTS.md                      # Opcional: só para subtree (monorepo)
.codex/config.toml                 # Opcional: project_doc_max_bytes, fallbacks
```

### 3.1 Camadas de instrução

| Camada | Conteúdo | Tamanho |
|--------|----------|---------|
| **AGENTS.md (raiz)** | Git, lista de comandos, caminhos `.task-flow/`, “ao executar run leia X” | Pequeno |
| **AGENTS.md (subpasta)** | Regras do pacote `packages/billing/` | Médio |
| **Arquivos sob demanda** | `task-flow-run/workflow.md`, checklist `coding_standards.mdc`, full `docs/coding-standards-full.md` (seções) | Quando o prompt manda |
| **Dados** | `tasks.json`, `status.json`, `contexts/` | Sempre via Read |

---

## 4. Expandir `AGENTS.md` sem estourar 32 KiB

### 4.1 Bloco Task Flow enxuto (copiar/adaptar)

```markdown
## RBIN Task Flow

- **Input:** `.task-flow/tasks.input.txt` (linhas `- descrição`)
- **Status humano:** `.task-flow/tasks.status.md` (não editar à mão)
- **Sistema:** `.task-flow/.internal/tasks.json`, `status.json`
- **Contextos:** `.task-flow/contexts/` (ler quando subtarefa citar)

### Comandos (dizer explicitamente no prompt)

| Comando | Antes de executar, ler |
|---------|-------------------------|
| `task-flow: sync` | `.cursor/rules/task-flow-sync.mdc` |
| `task-flow: run next X` / `run N` | `.claude/skills/task-flow-run/workflow.md` (fallback: `task_work.mdc`) |
| `task-flow: status` | `.task-flow/tasks.status.md` |
| `task-flow: improve changes` | `.cursor/rules/task_improve_changes.mdc` + `git diff --name-only HEAD` |
| `task-flow: check` | `.cursor/rules/task_check.mdc` + `package.json` scripts |
| `task-flow: audit` | `.cursor/rules/task_audit.mdc` + checklist `coding_standards.mdc` (full doc seções se necessário) |

Após cada subtarefa: atualizar `status.json` e `tasks.status.md` (resumo no topo).
Git: nunca `git add`/`commit`/`push` — só sugerir mensagem com Task ID.
```

### 4.2 Fallback filenames (opcional)

Em `.codex/config.toml` do projeto:

```toml
project_doc_fallback_filenames = ["TEAM_AGENTS.md", "CLAUDE.md"]
```

Só use se quiser que Codex trate `CLAUDE.md` como instrução — **cuidado** com duplicação e tamanho.

### 4.3 `AGENTS.override.md` (local, gitignored)

Para preferências **pessoais** sem commitar:

```markdown
# ~/.codex/ ou raiz do repo (em .gitignore)
Sempre responda em português.
Modelo de esforço: alto em tasks de arquitetura.
```

Codex prefere `AGENTS.override.md` sobre `AGENTS.md` **no mesmo nível**.

---

## 5. Mapeamento comando → o que pedir ao Codex

| Comando | Prompt mínimo eficaz |
|---------|---------------------|
| `task-flow: sync` | `Leia AGENTS.md e task-flow-sync.mdc. Execute task-flow: sync em tasks.input.txt.` |
| `task-flow: run next 3` | `Siga task-flow-run workflow.md. task-flow: run next 3. Atualize status.json e tasks.status.md.` |
| `task-flow: run 2` | Idem + respeitar dependências tasks 1..X-1 |
| `task-flow: status` | `Mostre o conteúdo de .task-flow/tasks.status.md` |
| `task-flow: think` | `task-flow: think — sugira tasks; pergunte antes de gravar em tasks.input.txt` |
| `task-flow: improve changes` | `git diff --name-only HEAD` · checklist `coding_standards.mdc` nos paths alterados |
| `task-flow: check` | `Rode lint:fix e build do package.json; corrija até passar` |
| `task-flow: review 1` | `task_review.mdc — verifique se task 1 done está realmente implementada` |
| `task-flow: validate` | `task_validate.mdc — valide todas as tasks, reverta false done, adicione lacunas em tasks.input.txt e sync` |
| `task-flow: estimate 1` | `task_estimate.mdc para task 1` |
| `task-flow: report 1` | `task_report.mdc — task 1 deve estar done` |
| `task-flow: generate flow` | `task_generate_flow.mdc — preencher tasks.flow.md` |

**Padrão universal:**

```text
Leia AGENTS.md. Para este pedido, leia também .cursor/rules/<regra>.mdc. Então: <comando task-flow>.
```

---

## 6. Fluxos de trabalho otimizados

### 6.1 Sessão TUI / CLI

```bash
cd /caminho/do/repo
codex
```

```text
Leia AGENTS.md. task-flow: sync.
```

```text
task-flow: run next 2 — leia .claude/skills/task-flow-run/workflow.md e .task-flow/.internal/tasks.json.
```

```text
task-flow: check
```

Você executa git manualmente.

### 6.2 Codex em subpasta (monorepo)

```bash
cd packages/frontend
codex
```

Codex mescla: `AGENTS.md` (raiz) + `packages/frontend/AGENTS.md` se existir.

**Padrão:** raiz = Task Flow global; subpasta = “este pacote usa Expo, não Next”.

### 6.3 Antes do PR

```text
task-flow: improve changes
```

```text
task-flow: review 2,3
```

### 6.4 Sem project doc (debug)

```bash
codex --no-project-doc
```

Confirma se comportamento estranho vem de `AGENTS.md` truncado ou conflitante.

---

## 7. Compensar ausência de `.mdc` automáticas

| Estratégia | Quando usar |
|------------|-------------|
| **Prompt com path explícito** | Toda execução `run`/`sync` |
| **@ arquivo** (se UI suportar) | Anexar `task-flow-run/workflow.md` uma vez na sessão |
| **AGENTS.md com tabela “ler arquivo X”** | Time Codex-only |
| **Script wrapper** | `scripts/codex-task-run.sh` que imprime instruções + chama codex |
| **Duplicar resumo** | 10–20 linhas do workflow crítico **dentro** de AGENTS.md (não 500) |

### Resumo embutido: `run next` (exemplo ~15 linhas)

Coloque no `AGENTS.md` se o time não quiser citar `.mdc` sempre:

```markdown
### task-flow: run (resumo)

1. Ler `.task-flow/.internal/tasks.json` e `status.json`.
2. `run next X`: próximas X subtarefas pending em ordem (task 1.1, 1.2, …).
3. `run N`: só se tasks 1..N-1 estiverem 100% done.
4. Por subtarefa: seguir `instructions`; ler `.task-flow/contexts/` se citado.
5. Marcar done em `status.json` + `tasks.status.md` (regenerar Summary).
6. Sugerir commit; nunca executar git write.
```

---

## 8. Configuração avançada (`.codex/`)

Codex lê `.codex/config.toml` da raiz até o CWD ([Advanced Configuration](https://developers.openai.com/codex/config-advanced)).

| Chave | Uso com Task Flow |
|-------|-------------------|
| `project_doc_max_bytes` | Aumentar se AGENTS + overrides legítimos > 32 KiB |
| `project_doc_fallback_filenames` | Incluir nomes alternativos de doc de time |
| `project_root_markers` | Padrão `.git` — raiz do repo para achar `.task-flow/` |

Config mais específica (perto do CWD) **sobrescreve** a da raiz.

---

## 9. Codex vs Cursor vs Claude (expectativas)

| Capacidade | Codex | Cursor (RBIN default) |
|------------|-------|------------------------|
| Auto-load task workflows | ❌ | ✅ via `.mdc` |
| Limite explícito de instruções | 32 KiB default | Context window maior |
| Skills `SKILL.md` | ❌ nativo | ✅ `.cursor/skills/` |
| `AGENTS.override.md` local | ✅ | N/A |
| Mesmos arquivos `.task-flow/` | ✅ | ✅ |

**Melhor dos dois mundos:** mantenha `rbin-task-flow init` (rules + AGENTS + task-flow). Devs Codex seguem este guia; devs Cursor usam [cursor.md](cursor.md).

---

## 10. CLI `rbin-task-flow` + Codex

| Ferramenta | Papel |
|------------|-------|
| `rbin-task-flow init` | Instala `AGENTS.md` + `.task-flow/` + `.cursor/rules/` |
| `rbin-task-flow audit` | Lista unstaged (útil antes de `improve changes`) |
| Codex | Executa lógica descrita nas regras |

Codex **não** substitui `task-flow: sync` — isso é trabalho do agente lendo as regras.

---

## 11. Anti-padrões

| Evite | Por quê |
|-------|---------|
| AGENTS.md com 40 KiB de standards | Truncamento silencioso |
| Assumir que Codex “sabe” task-flow | Sem `.mdc` no prompt, comportamento genérico |
| `task-flow: audit` em todo commit pequeno | Use `improve changes` |
| Duplicar git rules em 3 arquivos sem necessidade | Desperdício do orçamento 32 KiB |
| `CODEX_DISABLE_PROJECT_DOC=1` esquecido no env | AGENTS.md ignorado |

---

## 12. Troubleshooting

| Sintoma | Diagnóstico | Correção |
|---------|-------------|------------|
| Ignora “nunca commit” | AGENTS truncado ou não carregado | `Summarize current instructions`; reduzir AGENTS |
| Não atualiza status | Procedimento não no prompt | Citir `task-flow-run/workflow.md` ou resumo embutido |
| Comportamento diferente na subpasta | AGENTS local sobrescreve | Revisar `packages/*/AGENTS.md` |
| Muito contexto em standards | audit puxou arquivo inteiro | Escopo `improve changes` + paths |
| Conflito global vs repo | `~/.codex/AGENTS.md` | Simplificar global; detalhe no repo |

---

## 13. Checklist de maturidade Codex + Task Flow

- [x] `AGENTS.md` otimizado após `init` (sync/run embutidos + tabela)
- [x] `.task-flow/guides/CODEX.md` para workflows sob demanda
- [x] `.codex/config.toml` com `project_doc_max_bytes = 65536`
- [ ] Tamanho `AGENTS.md` < ~28 KiB se não usar config.toml
- [ ] Prompts citam `AGENTS.md` + `.task-flow/guides/CODEX.md` para `run`
- [ ] `improve changes` + `check` antes de PR
- [ ] `AGENTS.md` em subpastas de monorepo se necessário

---

## 14. Template `AGENTS.md` enxuto (Codex-first)

```markdown
# [Nome do projeto]

## Stack
Next.js 15, TypeScript, …

## Comandos que funcionam
pnpm lint:fix && pnpm build && pnpm test

## RBIN Task Flow
[Bloco seção 4.1 deste guia]

## Git
Nunca executar git write. Sugerir Conventional Commits + Task/Subtask ID.

## Coding standards
Ao implementar código, seguir o checklist em `.cursor/rules/coding_standards.mdc`; exemplos completos em `.task-flow/guides/coding-standards-full.md` (só seções necessárias).

## Mais detalhe
- Task Flow por plataforma: `.task-flow/guides/platforms/codex.md`
- Comandos: `.task-flow/README.md`
```

---

## 15. Graphify (opcional)

Não adicionamos Graphify ao `AGENTS.md` (limite 32 KiB). Em **`task-flow: run`**, peça no prompt: `graphify query "…"` se `graphify-out/` existir. Ver [GRAPHIFY.md](../GRAPHIFY.md).

---

## 16. Referências

- [Codex — AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Codex — Advanced config](https://developers.openai.com/codex/config-advanced)
- [Issue: truncamento silencioso 32 KiB](https://github.com/openai/codex/issues/7138)
- Template RBIN: `../../AGENTS.md`
- Cursor (rules automáticas): [cursor.md](cursor.md)
- Claude (skills): [claude-code.md](claude-code.md)

---

*Codex exige instruções explícitas e compactas — trate `AGENTS.md` como índice e `.cursor/rules/` como manual sob demanda.*
