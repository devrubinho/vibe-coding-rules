const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');
const { showSuccess, showWarning, showInfo } = require('./utils');

const GRAPHIFY_GUIDES_DIR = '.task-flow/guides';
const GRAPHIFY_OUT_REL = `${GRAPHIFY_GUIDES_DIR}/graphify-out`;
const GRAPHIFY_GRAPH_JSON = `${GRAPHIFY_OUT_REL}/graph.json`;
const GRAPHIFY_GRAPH_FLAG = `--graph ${GRAPHIFY_GRAPH_JSON}`;
const LEGACY_GRAPHIFY_OUT = 'graphify-out';
const UPSTREAM_GRAPHIFY_RULE = 'graphify.mdc';
const GRAPHIFY_EXTRACT_CMD = `graphify extract . --backend claude-cli --out ${GRAPHIFY_GUIDES_DIR}`;
const GRAPHIFY_EXTRACT_ARGS = ['extract', '.', '--backend', 'claude-cli', '--out', GRAPHIFY_GUIDES_DIR];

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

function stripLegacyGraphifyGitignore(targetPath) {
  const gitignorePath = path.join(targetPath, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    return false;
  }

  let content = fs.readFileSync(gitignorePath, 'utf8');
  const before = content;
  const linePattern = new RegExp(`^${LEGACY_GRAPHIFY_OUT}\\/?\\s*$`, 'gm');
  content = content.replace(linePattern, '');

  if (content === before) {
    return false;
  }

  fs.writeFileSync(gitignorePath, content.replace(/\n{3,}/g, '\n\n'));
  return true;
}

async function migrateLegacyGraphifyOut(targetPath) {
  await fs.ensureDir(path.join(targetPath, GRAPHIFY_GUIDES_DIR));

  const legacyDir = path.join(targetPath, LEGACY_GRAPHIFY_OUT);
  const guidesOutDir = path.join(targetPath, GRAPHIFY_OUT_REL);

  if (!fs.existsSync(legacyDir)) {
    return false;
  }

  if (fs.existsSync(guidesOutDir)) {
    showInfo(`Legacy ${LEGACY_GRAPHIFY_OUT}/ kept — ${GRAPHIFY_OUT_REL}/ already exists`);
    return false;
  }

  await fs.move(legacyDir, guidesOutDir);
  showSuccess(`Graphify output moved: ${LEGACY_GRAPHIFY_OUT}/ → ${GRAPHIFY_OUT_REL}/`);
  return true;
}

function runGraphifyExtract(targetPath) {
  if (!graphifyCliAvailable()) {
    showWarning('Graphify CLI not found — skip extract (install via rbin-install-dev Graphify module)');
    return false;
  }

  fs.ensureDirSync(path.join(targetPath, GRAPHIFY_GUIDES_DIR));

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

  showSuccess(`Graphify knowledge graph (${GRAPHIFY_OUT_REL}/)`);
  return true;
}

async function setupGraphifyIntegration(targetPath, options = {}) {
  const demoted = demoteUpstreamGraphifyRule(targetPath);
  if (demoted) {
    showSuccess('Graphify upstream rule demoted (alwaysApply: false) — Task Flow keeps priority');
  }

  await migrateLegacyGraphifyOut(targetPath);

  const gitignoreCleaned = stripLegacyGraphifyGitignore(targetPath);
  if (gitignoreCleaned) {
    showInfo('Removed legacy graphify-out/ from .gitignore (graph lives under .task-flow/guides/)');
  }

  await fs.ensureDir(path.join(targetPath, GRAPHIFY_GUIDES_DIR));

  if (options.extract) {
    runGraphifyExtract(targetPath);
  } else if (graphifyCliAvailable()) {
    const graphJson = path.join(targetPath, GRAPHIFY_GRAPH_JSON);
    if (!fs.existsSync(graphJson)) {
      showInfo(`Graphify CLI detected — run: ${GRAPHIFY_EXTRACT_CMD}  (or: rbin-task-flow init --graphify)`);
    }
  }

  showInfo(`Graphify + Task Flow guide: .task-flow/guides/GRAPHIFY.md (output: ${GRAPHIFY_OUT_REL}/)`);
}

module.exports = {
  setupGraphifyIntegration,
  demoteUpstreamGraphifyRule,
  stripLegacyGraphifyGitignore,
  migrateLegacyGraphifyOut,
  runGraphifyExtract,
  graphifyCliAvailable,
  GRAPHIFY_EXTRACT_CMD,
  GRAPHIFY_EXTRACT_ARGS,
  GRAPHIFY_GUIDES_DIR,
  GRAPHIFY_OUT_REL,
  GRAPHIFY_GRAPH_JSON,
  GRAPHIFY_GRAPH_FLAG,
};
