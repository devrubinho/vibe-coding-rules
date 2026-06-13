# Release 1.27.0 — publicação npm

Minor — `task-flow: split` (plano paralelo para 3 IAs).

## Verificação

```bash
ls .claude/skills/ | wc -l    # 11
test -f .claude/skills/task-flow-split/SKILL.md
test -f .cursor/rules/task_split.mdc
npm run measure:rules
npm pack --dry-run
```

## Publicar

```bash
git add package.json CHANGELOG.md RELEASE-1.27.0.md \
  .claude/skills/task-flow-split/ .cursor/rules/task_split.mdc \
  .cursor/rules/task-flow-cursor.mdc .cursor/rules/task_execution.mdc \
  CLAUDE.md AGENTS.md README.md .task-flow/README.md \
  .task-flow/guides/CODEX.md .task-flow/guides/CURSOR.md \
  .task-flow/guides/AI-PLATFORMS.md .task-flow/guides/platforms/ \
  scripts/patch-cursor-rule-modes.js

git commit -m "feat(task-flow): add split command for 3-IA parallel plan (v1.27.0)"

git tag -a v1.27.0 -m "v1.27.0 — task-flow: split"

npm publish --otp=SEU_2FA

git push && git push origin v1.27.0
```

## Uso

```text
task-flow: split:3
task-flow: split:3 50-72
```

Output exemplo → colar em 3 sessões:

```text
task-flow: run 58,61,62,63,64,65,66,67,68
task-flow: run 50,51,59,53,60
task-flow: run 52,54,55,56,57,69,70,71,72
```
