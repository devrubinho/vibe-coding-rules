const fs = require('fs-extra');
const path = require('path');
const { showSuccess, showInfo } = require('./utils');

const TEMPLATE_DIR = path.join(__dirname, '..');
const SKILLS_SRC = path.join(TEMPLATE_DIR, '.claude', 'skills');

async function copySkillsToProject(targetPath) {
  if (!fs.existsSync(SKILLS_SRC)) {
    return false;
  }

  const destinations = [
    path.join(targetPath, '.claude', 'skills'),
    path.join(targetPath, '.cursor', 'skills'),
  ];

  for (const dest of destinations) {
    await fs.ensureDir(dest);
    await fs.copy(SKILLS_SRC, dest, { overwrite: true });
  }

  const count = (await fs.readdir(SKILLS_SRC)).filter((name) =>
    fs.statSync(path.join(SKILLS_SRC, name)).isDirectory()
  ).length;

  showSuccess(`Agent skills (${count} skills → .claude/skills/ and .cursor/skills/)`);
  showInfo('Claude Code: restart session if .claude/skills/ was created for the first time');
  showInfo('Claude: /task-flow-run · Cursor: @task-flow-run in Agent (or task-flow: run next X)');

  return true;
}

module.exports = { copySkillsToProject, SKILLS_SRC };
