const fs = require('fs-extra');
const path = require('path');
const { showSuccess, showInfo, showWarning } = require('./utils');

const TEMPLATE_DIR = path.join(__dirname, '..');
const CODEX_CONFIG_SRC = path.join(TEMPLATE_DIR, '.codex', 'config.toml');

async function setupCodexIntegration(targetPath, options = {}) {
  const codexDir = path.join(targetPath, '.codex');
  const configDest = path.join(codexDir, 'config.toml');

  await fs.ensureDir(codexDir);

  const force = options.forceCodexConfig === true;
  if (!fs.existsSync(configDest) || force) {
    if (fs.existsSync(CODEX_CONFIG_SRC)) {
      await fs.copy(CODEX_CONFIG_SRC, configDest, { overwrite: force });
      showSuccess('Codex config (.codex/config.toml — project_doc_max_bytes)');
    }
  } else {
    showInfo('Codex config preserved (.codex/config.toml already exists)');
  }

  const codexWorkflows = path.join(targetPath, '.task-flow', 'CODEX.md');
  if (fs.existsSync(codexWorkflows)) {
    showInfo('Codex workflows: .task-flow/guides/CODEX.md (read on demand)');
  }

  showInfo('Codex entry: AGENTS.md — embedded sync/run + command table');
  showInfo('Verify: codex --ask-for-approval never "Summarize RBIN Task Flow instructions."');

  const agentsPath = path.join(targetPath, 'AGENTS.md');
  if (fs.existsSync(agentsPath)) {
    const size = fs.statSync(agentsPath).size;
    if (size > 28 * 1024) {
      showWarning(
        `AGENTS.md is ${Math.round(size / 1024)} KiB — may truncate with default 32 KiB; .codex/config.toml raises limit`
      );
    }
  }

  return true;
}

module.exports = { setupCodexIntegration };
