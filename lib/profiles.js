const fs = require('fs-extra');
const path = require('path');

const PROFILE_STANDARD = 'standard';
const PROFILE_MINIMAL = 'minimal';

const MINIMAL_RULE_FILES = ['task-flow-cursor.mdc', 'rbin-git-policy.mdc'];

function normalizeProfile(profile) {
  const value = String(profile || PROFILE_STANDARD).trim().toLowerCase();
  if (value !== PROFILE_STANDARD && value !== PROFILE_MINIMAL) {
    throw new Error(`Invalid profile "${profile}". Use "minimal" or "standard".`);
  }
  return value;
}

function parseProfileOption(value) {
  return normalizeProfile(value || PROFILE_STANDARD);
}

async function readInstallMeta(targetPath) {
  const metaPath = path.join(targetPath, '.task-flow', 'install-meta.json');
  if (!fs.existsSync(metaPath)) {
    return null;
  }
  try {
    return await fs.readJson(metaPath);
  } catch {
    return null;
  }
}

async function writeInstallMeta(targetPath, { profile, packageVersion, shareAiConfig }) {
  const metaPath = path.join(targetPath, '.task-flow', 'install-meta.json');
  await fs.ensureDir(path.dirname(metaPath));
  const existing = (await readInstallMeta(targetPath)) || {};
  const meta = {
    ...existing,
    profile: normalizeProfile(profile),
    packageVersion,
    updatedAt: new Date().toISOString(),
  };
  if (shareAiConfig !== undefined) {
    meta.shareAiConfig = Boolean(shareAiConfig);
  }
  await fs.writeJson(metaPath, meta, { spaces: 2 });
}

async function resolveShareAiConfig(targetPath, options = {}) {
  if (options.shareAiConfig !== undefined) {
    return Boolean(options.shareAiConfig);
  }
  const meta = await readInstallMeta(targetPath);
  if (meta && typeof meta.shareAiConfig === 'boolean') {
    return meta.shareAiConfig;
  }
  return false;
}

async function resolveProfile(targetPath, options = {}) {
  if (options.profile) {
    return normalizeProfile(options.profile);
  }
  const meta = await readInstallMeta(targetPath);
  if (meta?.profile) {
    return normalizeProfile(meta.profile);
  }
  return PROFILE_STANDARD;
}

async function copyCursorRules(targetPath, templateDir, { profile, reset }) {
  const src = path.join(templateDir, '.cursor', 'rules');
  const dest = path.join(targetPath, '.cursor', 'rules');

  if (!fs.existsSync(src)) {
    return;
  }

  if (reset && fs.existsSync(dest)) {
    await fs.emptyDir(dest);
  }
  await fs.ensureDir(dest);

  if (profile === PROFILE_MINIMAL) {
    for (const file of MINIMAL_RULE_FILES) {
      const from = path.join(src, file);
      if (fs.existsSync(from)) {
        await fs.copy(from, path.join(dest, file), { overwrite: true });
      }
    }
    return { mode: PROFILE_MINIMAL, count: MINIMAL_RULE_FILES.length };
  }

  await fs.copy(src, dest, { overwrite: true });
  const count = (await fs.readdir(dest)).filter((name) => name.endsWith('.mdc')).length;
  return { mode: PROFILE_STANDARD, count };
}

module.exports = {
  PROFILE_STANDARD,
  PROFILE_MINIMAL,
  MINIMAL_RULE_FILES,
  normalizeProfile,
  parseProfileOption,
  readInstallMeta,
  writeInstallMeta,
  resolveProfile,
  resolveShareAiConfig,
  copyCursorRules,
};
