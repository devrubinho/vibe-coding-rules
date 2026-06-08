# Release 1.24.0 — publicação npm

Checklist para publicar **rbin-task-flow@1.24.0** (minor — `task-flow: validate`).

## Semver

- **1.23.1** → **1.24.0** = bump do **número do meio** (minor — novo comando).
- Sem breaking changes nas regras Cursor.

## O que entra nesta versão

- **`task-flow: validate`** — verificação profunda, revert false `done`, lacunas → `tasks.input.txt`, sync
- **15ª skill** `task-flow-validate` + regra `task_validate.mdc`
- Docs: `CLAUDE.md`, `AGENTS.md`, `CODEX.md`, `README.md`, `GRAPHIFY.md`, etc.

## Pré-requisitos

- [ ] `npm whoami` OK
- [ ] Commit com versão 1.24.0
- [ ] Tag `v1.24.0` (você cria)

## Verificação local

```bash
npm run measure:rules
rg 'alwaysApply: true' .cursor/rules   # 2 arquivos
ls .claude/skills/ | wc -l            # 15 skills
npm pack --dry-run
```

## Publicar (você executa)

```bash
git add package.json CHANGELOG.md RELEASE-1.24.0.md README.md \
  .claude/skills/task-flow-validate/ .claude/skills/task-flow-think/SKILL.md \
  .cursor/rules/task_validate.mdc .cursor/rules/task-flow-cursor.mdc \
  .cursor/rules/task_analysis.mdc .cursor/rules/task_execution.mdc \
  .cursor/rules/task_review.mdc .cursor/rules/graphify-task-flow.mdc \
  .task-flow/guides/CODEX.md .task-flow/guides/CURSOR.md .task-flow/guides/GRAPHIFY.md \
  .task-flow/README.md .task-flow/platforms/codex.md \
  AGENTS.md CLAUDE.md

git commit -m "chore(release): v1.24.0 — task-flow validate command and skill"

git tag -a v1.24.0 -m "v1.24.0 — task-flow: validate"

npm publish

git push && git push origin v1.24.0
```

## Consumidores (1.23.x → 1.24.0)

```bash
npm install -g rbin-task-flow@1.24
cd your-project && rbin-task-flow update
```

Uso:

```text
task-flow: validate
@task-flow-validate        # Cursor
/task-flow-validate        # Claude Code
```

## Pós-publish

- [ ] `npm view rbin-task-flow version` → `1.24.0`
