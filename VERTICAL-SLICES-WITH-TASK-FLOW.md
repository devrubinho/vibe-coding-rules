# Vertical Slices + Task Flow — playbook operacional

> Como eu rodaria o **RBIN Task Flow** dentro do workflow de *vertical slices + TDD + gate de
> contexto + handoff* (estilo Matt Pocock / "Smart Zone"). Task Flow é o **motor** (decomposição,
> estado determinístico, dispatch paralelo); o workflow abaixo é a **disciplina** (escopo pequeno,
> contexto limpo, verificação objetiva, passagem de estado explícita).

---

## Princípio

O handoff só é barato porque o slice é **fechado e testado**. Por isso a ordem importa:

```
slice vertical (1 comportamento ponta-a-ponta)
  → teste de comportamento primeiro (HITL aprova o teste)
    → menor implementação que passa
      → refactor
        → estado canônico atualizado (render-status)
          → gate de contexto → handoff por ponteiro → sessão limpa
```

Regra de ouro do handoff: **aponte para artefatos, não recont(e o conteúdo)**. Os artefatos
canônicos do Task Flow já existem:

| Artefato | Papel |
|----------|-------|
| `.task-flow/.internal/status.json` | fonte da verdade do estado (não editar à mão) |
| `.task-flow/tasks.status.md` | progresso legível (= seu `PROGRESS.md`), renderizado por `render-status` |
| `.task-flow/dev-logs/task-X.Y-manual.md` | passos manuais + log da conversa |
| `.task-flow/guides/reports/task-X-implementation.md` | relatório pós-implementação |

---

## Mapeamento publicação → Task Flow

| Etapa da publicação | Equivalente em Task Flow | Lacuna a cobrir |
|---------------------|--------------------------|-----------------|
| `PRD.md` / `spec.md` | arquivos em `.task-flow/contexts/` | — |
| `/to-issues` | `/task-flow-from-contexts` → `/task-flow-sync` | garantir **slice vertical** (ver abaixo) |
| issues verticais pequenas | 1 task = 1 slice; subtasks = passos | `sync` tende a gerar passos; force vertical no enunciado |
| loop por issue/fase | `/task-flow-run X` (ou `next 1`) | — |
| `/tdd` (teste→impl→refactor) | convenção: **1ª subtask = teste de comportamento** | TDD não é nativo; vira convenção |
| harness atualiza `PROGRESS.md` | `rbin-task-flow render-status` (determinístico) | — |
| gate de contexto (55–60%) | heurística manual antes de novo trabalho | gate não é nativo |
| `/handoff` | **lacuna**: criar `/task-flow-handoff` | hoje: handoff manual por ponteiros |
| sessão limpa resgata handoff | nova sessão lê `tasks.status.md` + dev-logs + handoff | — |

> 3 peças que faltam no Task Flow para casar 100% com a publicação: **(1)** skill `/task-flow-handoff`,
> **(2)** convenção TDD-first no `sync`/`run`, **(3)** regra de "slice vertical" no `from-contexts`.
> Enquanto não existem como skill, aplico como **convenção** (abaixo).

---

## O que é um "slice vertical" aqui

Cada linha `- ...` em `tasks.input.txt` deve atravessar as camadas e entregar **1 comportamento
observável**, não uma camada inteira.

- ❌ Horizontal: `- Criar todos os endpoints`, `- Criar todos os componentes`
- ✅ Vertical: `- Usuário faz login com email/senha e vê o dashboard` (UI → action → service → persistência → teste)

Heurística: se o slice não pode ser **demonstrado** e **testado por comportamento** sozinho, fatie mais.

---

## Cenário A — 1 task com contextos

Você tem um mockup/spec e quer entregar **um** comportamento.

```bash
# 1. Contexto entra no funil canônico
#    copie o(s) arquivo(s) para .task-flow/contexts/  (ex.: login-mockup.png, login-spec.md)

# 2. Rascunha a task a partir do contexto (≈ /to-issues)
task-flow: from contexts login-mockup.png,login-spec.md
#    edite a linha gerada para garantir slice VERTICAL + comportamento:
#    - Usuário faz login (email/senha), sessão persiste e dashboard carrega  task-flow-screen login-mockup.png

# 3. Materializa subtasks no estado
task-flow: sync
#    CONVENÇÃO TDD: reordene/edite para a 1ª subtask ser o teste de comportamento:
#      1. Teste de comportamento: login válido → dashboard; inválido → erro (HITL aprova ESTE teste)
#      2. Menor implementação que passa
#      3. Refactor / bordas (loading, erro, a11y)

# 4. Loop da issue (TDD com HITL)
task-flow: run 1
#    - escreve o teste (subtask 1) → VOCÊ aprova o teste (HITL) antes de implementar
#    - implementa o mínimo (subtask 2) até o teste passar
#    - refatora (subtask 3)

# 5. Estado canônico (determinístico, sem o modelo reescrever markdown)
rbin-task-flow render-status        # atualiza tasks.status.md (= PROGRESS.md)
rbin-task-flow validate --schema    # gate: estado íntegro (schema + integridade referencial)

# 6. Gate de contexto + handoff
#    Se a fase terminou OU contexto >~55–60% com ruído acumulando → HANDOFF (ver template)
#    → abrir SESSÃO LIMPA e continuar.
```

**Por que isso usa a Smart Zone:** a sessão de implementação carrega só o necessário (instructions
da task + contexts citados), o estado vive em arquivos, e o gate evita iniciar trabalho novo com
contexto sujo.

---

## Cenário B — 10 funcionalidades

Você tem 10 features. A meta é **uma feature = um slice vertical = uma issue**, com paralelismo onde
não há conflito e handoff entre fases.

```bash
# 1. Defina 10 slices verticais em .task-flow/tasks.input.txt (1 linha por feature, comportamento claro)
#    - Feature 1: <comportamento ponta-a-ponta>
#    - ...
#    - Feature 10: <comportamento ponta-a-ponta>
#    (use contexts/ + `task-flow: from contexts` se vierem de specs/mockups)

# 2. Materializa
task-flow: sync
task-flow: estimate all        # opcional: dimensiona as fases

# 3. Planeje fases por dependência/conflito de arquivos
task-flow: split:3
#    No CLAUDE: despacha subagents task-runner em PARALELO para grupos file-disjoint;
#    o orquestrador aplica status sequencialmente + valida + renderiza UMA vez.
#    (Cursor/Codex: saem as linhas copy-paste `task-flow: run a,b,c`.)

# 4. Loop POR FASE (não por todas as 10 de uma vez):
#    para cada feature da fase:
task-flow: run <id>            # TDD: teste de comportamento (HITL) → impl mínima → refactor
rbin-task-flow render-status
rbin-task-flow validate --schema

# 5. Fim de cada FASE = ponto natural de handoff
#    → /handoff (template) → SESSÃO LIMPA → próxima fase
#    Nunca arraste 10 features numa só sessão: 1 fase ≈ 1 sessão limpa.
```

**Regra de fatiamento da fase:** agrupe por **disjunção de arquivos** (use `graphify query` se o grafo
existir). Features que tocam o mesmo arquivo → mesma fase sequencial, nunca em paralelo.

---

## Template de handoff (até existir `/task-flow-handoff`)

Salve em `.task-flow/dev-logs/handoff-YYYY-MM-DD-HHmm.md`. **Ponteiros, não resumo.**

```markdown
# Handoff — <data/hora>

## Onde paramos
- Fase atual: <N> · Slice em andamento: Task <id> (<comportamento>)
- Estado: ver .task-flow/tasks.status.md  (render-status; não recontar aqui)

## Verificação no momento do handoff
- `rbin-task-flow validate --schema`: <ok / pendências>
- Testes: <comando> → <verde/vermelho>

## Próximo passo único
- task-flow: run <próximo id>  (1ª subtask = teste de comportamento, HITL)

## Aberto / bloqueado
- <manual pendente → .task-flow/dev-logs/task-X.Y-manual.md>

## Não repetir contexto
- Specs: .task-flow/contexts/<...>
- Decisões: <link/arquivo canônico>
```

Na **sessão nova**: leia o handoff + `tasks.status.md` (+ dev-log da subtask alvo). Não recarregue a
conversa anterior.

---

## Checklist por slice (cole no início de cada loop)

- [ ] Slice é **vertical** e demonstrável sozinho?
- [ ] 1ª subtask é **teste de comportamento** e foi aprovada por mim (HITL)?
- [ ] Implementação é a **mínima** que passa? Refactor depois?
- [ ] `render-status` + `validate --schema` rodaram (estado íntegro)?
- [ ] Contexto <~55–60% **e** sem ruído? Senão → handoff + sessão limpa.
- [ ] Handoff aponta para **artefatos**, sem duplicar conteúdo?
- [ ] Commit sugerido via `/rbin-git` (você roda o git)?

---

## Onde o Task Flow ainda pode evoluir para este workflow

1. **`/task-flow-handoff`** — gera o arquivo de handoff por ponteiros (status + próximo passo + abertos),
   garantindo que não duplica conteúdo. (Maior alavanca.)
2. **TDD-first como convenção no `sync`/`run`** — primeira subtask sempre o teste de comportamento;
   `run` não marca `done` sem teste verde.
3. **Regra de slice vertical no `from-contexts`** — recusar/avisar enunciados horizontais.
4. **Gate de contexto** — heurística não é automatizável pelo modelo, mas o handoff + sessão limpa a
   tornam operacional.
