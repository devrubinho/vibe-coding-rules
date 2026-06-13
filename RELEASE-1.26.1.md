# Release 1.26.1 — publicação npm

Patch — `disable-model-invocation: false` nos skills `task-flow-*` (fix `/task-flow-sync` no Claude Code).

## Verificação local

```bash
npm run measure:rules
grep disable-model-invocation .claude/skills/task-flow-sync/SKILL.md   # false
grep disable-model-invocation .claude/skills/rbin-coding-standards/SKILL.md  # true
npm pack --dry-run
```

## Publicar (você executa)

```bash
git add package.json CHANGELOG.md RELEASE-1.26.1.md CLAUDE.md \
  .claude/skills/task-flow-*/ .cursor/rules/task-flow-sync.mdc \
  .task-flow/guides/platforms/claude-code.md

git commit -m "fix(skills): disable-model-invocation false on task-flow-* (v1.26.1)"

git tag -a v1.26.1 -m "v1.26.1 — fix Claude Code /task-flow-sync"

npm publish

git push && git push origin v1.26.1
```

## Consumidores

```bash
npm install -g rbin-task-flow@1.26.1
cd your-project && rbin-task-flow update
```

Reinicie Claude Code após `update` se skills já estavam carregados.
