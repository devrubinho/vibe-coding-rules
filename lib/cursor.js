const fs = require('fs-extra');
const path = require('path');
const { showSuccess, showInfo } = require('./utils');

async function setupCursorIntegration(targetPath, options = {}) {
  const profile = options.profile || 'standard';
  const skillsDir = path.join(targetPath, '.cursor', 'skills');
  const cursorMd = path.join(targetPath, '.task-flow', 'CURSOR.md');
  const coreRule = path.join(targetPath, '.cursor', 'rules', 'task-flow-cursor.mdc');

  if (fs.existsSync(coreRule)) {
    showSuccess('Cursor bootstrap rule (task-flow-cursor.mdc — always on)');
  }

  if (fs.existsSync(skillsDir)) {
    const count = (await fs.readdir(skillsDir)).filter((name) =>
      fs.statSync(path.join(skillsDir, name)).isDirectory()
    ).length;
    showInfo(`Cursor skills: ${count} in .cursor/skills/ — use @task-flow-run, @task-flow-sync, …`);
  }

  if (fs.existsSync(cursorMd)) {
    showInfo('Cursor guide: .task-flow/guides/CURSOR.md');
  }

  const gitPolicy = path.join(targetPath, '.cursor', 'rules', 'rbin-git-policy.mdc');
  if (fs.existsSync(gitPolicy)) {
    showSuccess('Git policy (rbin-git-policy.mdc — always on)');
  }

  if (profile === 'minimal') {
    showInfo('Minimal profile: 2 always-on rules; workflows via @task-flow-* skills only');
    showInfo('Full rules: rbin-task-flow reset --profile standard --keep-tasks');
  } else {
    showInfo('Rules: 2 always-on + intelligent/glob rules; prefer @task-flow-* skills for workflows');
  }

  return true;
}

module.exports = { setupCursorIntegration };
