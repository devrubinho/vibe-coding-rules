const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');
const { showSuccess, showWarning, showInfo } = require('./utils');

const GRAPHIFY_OUT = 'graphify-out/';
const UPSTREAM_GRAPHIFY_RULE = 'graphify.mdc';
const GRAPHIFY_EXTRACT_CMD = 'graphify extract . --backend claude-cli';
const GRAPHIFY_EXTRACT_ARGS = ['extract', '.', '--backend', 'claude-cli'];

function graphifyCliAvailable() {
  const result = spawnSync('graphify', ['--help'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return result.status === 0 || result.status === 1;
}

function demoteUpstreamGraphifyRule(targetPath) {
  const rulePath = path.join(targetPath, '.cursor', 'rules', UPSTREAM_GRAPHIFY_RULE);
  if (!fs.existsSync(rulePath)) {
    return false;
  }

  let content = fs.readFileSync(rulePath, 'utf8');
  const hadAlwaysApply = /alwaysApply:\s*true/i.test(content);

  if (!hadAlwaysApply) {
    return false;
  }

  content = content.replace(/alwaysApply:\s*true/gi, 'alwaysApply: false');

  if (!content.includes('RBIN Task Flow')) {
    const notice = [
      '',
      '- **RBIN Task Flow:** This file was set to `alwaysApply: false` by `rbin-task-flow` to avoid competing with Task Flow rules. Use [.cursor/rules/graphify-task-flow.mdc](mdc:.cursor/rules/graphify-task-flow.mdc) and [.task-flow/GRAPHIFY.md](mdc:.task-flow/GRAPHIFY.md) instead.',
      '',
    ].join('\n');
    content = content.trimEnd() + notice;
  }

  fs.writeFileSync(rulePath, content);
  return true;
}

function ensureGraphifyGitignore(targetPath) {
  const gitignorePath = path.join(targetPath, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    return false;
  }

  let content = fs.readFileSync(gitignorePath, 'utf8');
  const entry = GRAPHIFY_OUT.replace(/\/$/, '');
  const linePattern = new RegExp(`^${entry}\\/?$`, 'm');

  if (linePattern.test(content)) {
    return false;
  }

  if (!content.endsWith('\n')) {
    content += '\n';
  }
  content += `\n${entry}/\n`;
  fs.writeFileSync(gitignorePath, content);
  return true;
}

function runGraphifyExtract(targetPath) {
  if (!graphifyCliAvailable()) {
    showWarning('Graphify CLI not found — skip extract (install via rbin-install-dev Graphify module)');
    return false;
  }

  showInfo(`Running ${GRAPHIFY_EXTRACT_CMD} (may take a few minutes)...`);
  const result = spawnSync('graphify', GRAPHIFY_EXTRACT_ARGS, {
    cwd: targetPath,
    encoding: 'utf8',
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    showWarning(`graphify extract failed — you can run it later: ${GRAPHIFY_EXTRACT_CMD}`);
    return false;
  }

  showSuccess('Graphify knowledge graph (graphify-out/)');
  return true;
}

async function setupGraphifyIntegration(targetPath, options = {}) {
  const demoted = demoteUpstreamGraphifyRule(targetPath);
  if (demoted) {
    showSuccess('Graphify upstream rule demoted (alwaysApply: false) — Task Flow keeps priority');
  }

  const gitignoreUpdated = ensureGraphifyGitignore(targetPath);
  if (gitignoreUpdated) {
    showSuccess('graphify-out/ added to .gitignore');
  }

  if (options.extract) {
    runGraphifyExtract(targetPath);
  } else if (graphifyCliAvailable()) {
    const graphJson = path.join(targetPath, 'graphify-out', 'graph.json');
    if (!fs.existsSync(graphJson)) {
      showInfo(`Graphify CLI detected — run: ${GRAPHIFY_EXTRACT_CMD}  (or: rbin-task-flow init --graphify)`);
    }
  }

  showInfo('Graphify + Task Flow guide: .task-flow/GRAPHIFY.md');
}

module.exports = {
  setupGraphifyIntegration,
  demoteUpstreamGraphifyRule,
  ensureGraphifyGitignore,
  runGraphifyExtract,
  graphifyCliAvailable,
  GRAPHIFY_EXTRACT_CMD,
  GRAPHIFY_EXTRACT_ARGS,
};
