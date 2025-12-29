# Rubinho Task Flow - Comandos Rápidos

## 🚀 Comandos Rápidos

| Comando | Descrição |
|---------|-----------|
| `task-flow: sync` | Sincronização completa: adiciona novas, remove removidas, atualiza modificadas, preserva status |
| `task-flow: think` | Analisa código e sugere novas tasks |
| `task-flow: run next X` | Trabalha nas próximas X subtasks (ex: `task-flow: run next 4`) |
| `task-flow: run task X` | Executa todas as subtasks pendentes da task X (ex: `task-flow: run task 1`) |
| `task-flow: status` | Mostra status atual das tasks |
| `task-flow: review` | Revisa tasks marcadas como "done" |
| `task-flow: refactor` | Refatora código do commit atual |

**Veja detalhes completos abaixo ↓**

---

## Comandos Detalhados

### `task-flow: sync`
Sincronização completa entre `tasks.input.txt` e o sistema:
- ✅ Adiciona novas tasks do `tasks.input.txt`
- ✅ Remove tasks que foram removidas do `tasks.input.txt`
- ✅ Atualiza tasks que foram modificadas no `tasks.input.txt`
- ✅ Preserva o status (done/pending) das tasks existentes
- ✅ Sincroniza status entre `status.json` e `tasks.status.md` (garante que estão sempre alinhados)

### `task-flow: think`
Analisa código e sugere novas tasks. Pergunta antes de adicionar ao `tasks.input.txt`.

### `task-flow: run next X`
Trabalha nas próximas X subtasks pendentes em ordem sequencial. Implementa e marca como "done".

**Exemplos:**
- `task-flow: run next 4` → Próximas 4 subtasks
- `task-flow: run next` → Próxima 1 subtask

### `task-flow: run task X`
Executa todas as subtasks pendentes de uma task específica. Implementa e marca como "done".

**⚠️ Verificação de Dependências:**
- Só executa se todas as tasks anteriores (1, 2, ..., X-1) estiverem completamente concluídas
- Permite trabalho paralelo por múltiplas IAs sem conflitos
- Se houver tasks anteriores pendentes, avisa quais precisam ser concluídas primeiro

**Exemplos:**
- `task-flow: run task 1` → Todas as subtasks pendentes da task 1 (sempre pode executar)
- `task-flow: run task 3` → Só executa se tasks 1 e 2 estiverem completas

### `task-flow: status`
Mostra o status atual das tasks e subtasks do arquivo `tasks.status.md`.

### `task-flow: review`
Revisa tasks marcadas como "done" para verificar se estão realmente concluídas.

### `task-flow: refactor`
Refatora código do commit atual. Remove comentários explicativos, melhora código sem mudar funcionalidade.

---

## Arquivos

- `.task-flow/tasks.input.txt` - Edite tasks aqui (formato: `- Task description`)
- `.task-flow/tasks.status.md` - ⚠️ **NÃO EDITE** - Atualizado automaticamente pela IA
- `.task-flow/.internal/` - ⚠️ **IGNORE** - Arquivos internos do sistema (não precisa ler nem editar)
