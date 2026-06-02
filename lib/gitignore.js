const fs = require('fs-extra');
const path = require('path');

const MARKER_START = '# RBIN Task Flow (rbin-task-flow)';
const MARKER_END = '# END RBIN Task Flow (rbin-task-flow)';

const ENTRIES_DEFAULT = [
  '.claude/',
  '.cursor/',
  '.task-flow/',
  'graphify-out/',
  'CLAUDE.md',
  'AGENTS.md',
];

const ENTRIES_SHARE_AI_CONFIG = [
  '.claude/',
  '.cursor/settings.json',
  '.cursor/rules/*.local.mdc',
  '.task-flow/',
  'graphify-out/',
  'CLAUDE.md',
  'AGENTS.md',
];

const STRIP_PATTERNS = [
  ...ENTRIES_DEFAULT,
  ...ENTRIES_SHARE_AI_CONFIG,
  MARKER_START,
  MARKER_END,
  '# share-ai-config:',
  '# Trade-off:',
  '# Default (no flag):',
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripRbinGitignoreBlock(content) {
  let next = content;

  const blockRegex = new RegExp(
    `\\n?${escapeRegExp(MARKER_START)}[\\s\\S]*?${escapeRegExp(MARKER_END)}\\n?`,
    'g'
  );
  next = next.replace(blockRegex, '\n');

  for (const entry of STRIP_PATTERNS) {
    const lineRegex = new RegExp(`^${escapeRegExp(entry)}\\s*$`, 'gm');
    next = next.replace(lineRegex, '');
  }

  return next.replace(/\n{3,}/g, '\n\n');
}

function buildRbinGitignoreBlock(shareAiConfig) {
  const lines = ['', MARKER_START, ''];

  if (shareAiConfig) {
    lines.push(
      '# share-ai-config: .cursor/skills/ and .cursor/rules/ are NOT ignored — commit them for team consistency.',
      '# Trade-off: shared AI config improves workflow parity; each developer still pays token cost when the Agent loads rules/skills.',
      '# Default (no flag): entire .cursor/ stays local and gitignored — lower repo noise, no team sync of rules.',
      ''
    );
    lines.push(...ENTRIES_SHARE_AI_CONFIG);
  } else {
    lines.push(...ENTRIES_DEFAULT);
  }

  lines.push(MARKER_END, '');
  return lines.join('\n');
}

async function updateGitignore(targetPath, { shareAiConfig = false } = {}) {
  const gitignorePath = path.join(targetPath, '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    await fs.writeFile(gitignorePath, '');
  }

  let content = await fs.readFile(gitignorePath, 'utf8');
  content = stripRbinGitignoreBlock(content);

  if (!content.endsWith('\n')) {
    content += '\n';
  }

  content += buildRbinGitignoreBlock(shareAiConfig);
  await fs.writeFile(gitignorePath, content);

  return { shareAiConfig };
}

module.exports = {
  MARKER_START,
  buildRbinGitignoreBlock,
  stripRbinGitignoreBlock,
  updateGitignore,
};
