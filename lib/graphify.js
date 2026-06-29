const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');
const { showSuccess, showWarning, showInfo } = require('./utils');

const GRAPHIFY_OUT_REL = 'graphify-out';
const LEGACY_NESTED_OUT = '.task-flow/guides/graphify-out';
const GRAPHIFY_GRAPH_JSON = `${GRAPHIFY_OUT_REL}/graph.json`;
const GRAPHIFY_GRAPH_FLAG = `--graph ${GRAPHIFY_GRAPH_JSON}`;
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
      '- **RBIN Task Flow:** This file was set to `alwaysApply: false` by `rbin-task-flow` to avoid competing with Task Flow rules. Use [.cursor/rules/graphify-task-flow.mdc](mdc:.cursor/rules/graphify-task-flow.mdc) and [.task-flow/guides/GRAPHIFY.md](mdc:.task-flow/guides/GRAPHIFY.md) instead.',
      '',
    ].join('\n');
    content = content.trimEnd() + notice;
  }

  fs.writeFileSync(rulePath, content);
  return true;
}

async function removeLegacyNestedGraphifyOut(targetPath) {
  const nestedDir = path.join(targetPath, LEGACY_NESTED_OUT);
  if (!(await fs.pathExists(nestedDir))) {
    return false;
  }

  const rootDir = path.join(targetPath, GRAPHIFY_OUT_REL);
  if (await fs.pathExists(rootDir)) {
    await fs.remove(nestedDir);
    showInfo(`Removed legacy ${LEGACY_NESTED_OUT}/ (Graphify uses ${GRAPHIFY_OUT_REL}/ at project root)`);
    return true;
  }

  await fs.move(nestedDir, rootDir);
  showSuccess(`Moved legacy ${LEGACY_NESTED_OUT}/ → ${GRAPHIFY_OUT_REL}/ (Graphify default location)`);
  return true;
}

function runGraphifyExtract(targetPath) {
  if (!graphifyCliAvailable()) {
    showWarning('Graphify CLI not found — skip extract (install via rbin-install-dev Graphify module)');
    return false;
  }

  showInfo(`Running ${GRAPHIFY_EXTRACT_CMD} → ${GRAPHIFY_OUT_REL}/ (Graphify default, no --out override)`);
  const result = spawnSync('graphify', GRAPHIFY_EXTRACT_ARGS, {
    cwd: targetPath,
    encoding: 'utf8',
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    showWarning(`graphify extract failed — you can run it later: ${GRAPHIFY_EXTRACT_CMD}`);
    return false;
  }

  showSuccess(`Graphify knowledge graph (${GRAPHIFY_OUT_REL}/)`);
  return true;
}

async function setupGraphifyIntegration(targetPath, options = {}) {
  const demoted = demoteUpstreamGraphifyRule(targetPath);
  if (demoted) {
    showSuccess('Graphify upstream rule demoted (alwaysApply: false) — Task Flow keeps priority');
  }

  await removeLegacyNestedGraphifyOut(targetPath);

  if (options.extract) {
    runGraphifyExtract(targetPath);
  } else if (graphifyCliAvailable()) {
    const graphJson = path.join(targetPath, GRAPHIFY_GRAPH_JSON);
    if (!fs.existsSync(graphJson)) {
      showInfo(`Graphify CLI detected — run: ${GRAPHIFY_EXTRACT_CMD}  (or: rbin-task-flow init --graphify)`);
    }
  }

  showInfo(`Graphify coexistence: .task-flow/guides/GRAPHIFY.md · output stays in ${GRAPHIFY_OUT_REL}/`);
}

module.exports = {
  setupGraphifyIntegration,
  demoteUpstreamGraphifyRule,
  removeLegacyNestedGraphifyOut,
  runGraphifyExtract,
  graphifyCliAvailable,
  GRAPHIFY_EXTRACT_CMD,
  GRAPHIFY_EXTRACT_ARGS,
  GRAPHIFY_OUT_REL,
  LEGACY_NESTED_OUT,
  GRAPHIFY_GRAPH_JSON,
  GRAPHIFY_GRAPH_FLAG,
};
