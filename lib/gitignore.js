const fs = require('fs-extra');
const path = require('path');

const GITIGNORE_ENTRY = '.task-flow';

const LEGACY_MARKER_START = '# RBIN Task Flow (rbin-task-flow)';
const LEGACY_MARKER_END = '# END RBIN Task Flow (rbin-task-flow)';

const STRIP_LINE_PATTERNS = [
  /^\.task-flow\/?\s*$/m,
  /^\.claude\/\s*$/m,
  /^\.cursor\/\s*$/m,
  /^CLAUDE\.md\s*$/m,
  /^AGENTS\.md\s*$/m,
  /^\.cursor\/settings\.json\s*$/m,
  /^\.cursor\/rules\/\*\.local\.mdc\s*$/m,
  /^graphify-out\/\s*$/m,
  /^\.task-flow\/scripts\/tasks\.json\s*$/m,
  /^\.task-flow\/scripts\/status\.json\s*$/m,
  /^# RBIN Task Flow.*$/m,
  /^# END RBIN Task Flow.*$/m,
  /^# share-ai-config:.*$/m,
  /^# Trade-off:.*$/m,
  /^# Default \(no flag\):.*$/m,
  /^# Only \.task-flow\/.*$/m,
  /^# \.cursor\/.*$/m,
];

function stripTaskFlowGitignoreLines(content) {
  let next = content;

  const blockRegex = new RegExp(
    `\\n?${LEGACY_MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${LEGACY_MARKER_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n?`,
    'g'
  );
  next = next.replace(blockRegex, '\n');

  for (const pattern of STRIP_LINE_PATTERNS) {
    next = next.replace(pattern, '');
  }

  return next.replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '');
}

function appendTaskFlowEntry(content) {
  const normalized = stripTaskFlowGitignoreLines(content);
  const suffix = normalized.length > 0 ? '\n' : '';
  return `${normalized}${suffix}${GITIGNORE_ENTRY}\n`;
}

async function updateGitignore(targetPath) {
  const gitignorePath = path.join(targetPath, '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    await fs.writeFile(gitignorePath, `${GITIGNORE_ENTRY}\n`);
    return;
  }

  const content = await fs.readFile(gitignorePath, 'utf8');
  await fs.writeFile(gitignorePath, appendTaskFlowEntry(content));
}

module.exports = {
  GITIGNORE_ENTRY,
  stripTaskFlowGitignoreLines,
  appendTaskFlowEntry,
  updateGitignore,
};
