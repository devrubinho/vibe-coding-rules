const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { showHeader, showSuccess, showError, showWarning, showInfo, showNextSteps } = require('./utils');
const { setupGraphifyIntegration } = require('./graphify');
const { copySkillsToProject } = require('./skills');
const { setupCodexIntegration } = require('./codex');
const { setupCursorIntegration } = require('./cursor');
const {
  PROFILE_MINIMAL,
  PROFILE_STANDARD,
  resolveProfile,
  resolveShareAiConfig,
  writeInstallMeta,
  copyCursorRules,
} = require('./profiles');
const { updateGitignore } = require('./gitignore');

const PROFILES = { STANDARD: PROFILE_STANDARD, MINIMAL: PROFILE_MINIMAL };

const TEMPLATE_DIR = path.join(__dirname, '..');
const PACKAGE_VERSION = require('../package.json').version;

async function installInProject(targetPath, options = {}) {
  const isUpdate = options.update || false;
  const isReset = options.reset || false;

  let profile;
  let shareAiConfig;
  try {
    profile = await resolveProfile(targetPath, { profile: options.profile });
    shareAiConfig = await resolveShareAiConfig(targetPath, {
      shareAiConfig: options.shareAiConfig,
    });
  } catch (error) {
    showError(error.message);
    process.exit(1);
  }

  showHeader();

  if (isReset) {
    console.log(chalk.blue('♻️  Resetting RBIN Task Flow...'));
  } else if (isUpdate) {
    console.log(chalk.blue('🔄 Updating RBIN Task Flow...'));
  } else {
    console.log(chalk.blue('🚀 Installing RBIN Task Flow...'));
  }

  console.log(chalk.blue('📁 Target:'), targetPath);
  console.log(
    chalk.blue('📦 Profile:'),
    profile === PROFILES.MINIMAL ? chalk.yellow('minimal') : chalk.green('standard'),
    profile === PROFILES.MINIMAL
      ? chalk.gray('(2 always-on rules + skills; workflows via @task-flow-*)')
      : chalk.gray('(all Cursor rules + skills)')
  );
  console.log(
    chalk.blue('🔗 Git:'),
    shareAiConfig
      ? chalk.yellow('share-ai-config') + chalk.gray(' (.cursor/skills + .cursor/rules versionáveis)')
      : chalk.gray('local .cursor/ gitignored (default)')
  );
  console.log('');

  const spinner = ora('Processing...').start();

  try {
    if (!fs.existsSync(targetPath)) {
      spinner.fail(chalk.red(`Directory not found: ${targetPath}`));
      process.exit(1);
    }

    try {
      fs.accessSync(targetPath, fs.constants.W_OK);
    } catch (error) {
      spinner.fail(chalk.red('No write permission in target directory'));
      process.exit(1);
    }

    spinner.text = 'Creating directories...';

    if (isReset) {
      await fs.remove(path.join(targetPath, '.task-flow'));
    }

    const dirs = [
      '.cursor/rules',
      '.cursor/skills',
      '.claude',
      '.claude/skills',
      '.task-flow',
      '.codex'
    ];

    for (const dir of dirs) {
      await fs.ensureDir(path.join(targetPath, dir));
    }

    spinner.text = 'Copying configuration files...';

    await copyConfigs(targetPath, { update: isUpdate, reset: isReset, profile });

    spinner.text = 'Updating .gitignore...';

    await updateGitignore(targetPath, { shareAiConfig });
    showSuccess('.gitignore updated');
    if (shareAiConfig) {
      showInfo('Git: .cursor/skills/ and .cursor/rules/ can be committed (see .gitignore comment)');
    }

    spinner.text = 'Installing agent skills...';
    await copySkillsToProject(targetPath);

    spinner.text = 'Configuring Cursor (rules + skills)...';
    await setupCursorIntegration(targetPath, { profile });

    await writeInstallMeta(targetPath, {
      profile,
      packageVersion: PACKAGE_VERSION,
      shareAiConfig,
    });

    spinner.text = 'Configuring Codex (AGENTS.md + .codex/config.toml)...';
    await setupCodexIntegration(targetPath);

    spinner.text = 'Configuring Graphify coexistence...';
    await setupGraphifyIntegration(targetPath, { extract: options.graphify === true });

    spinner.succeed(chalk.green('Installation completed!'));

    console.log('');

    await showModelVersions(targetPath);

    showNextSteps(targetPath);

  } catch (error) {
    spinner.fail(chalk.red('Installation failed'));
    console.error(chalk.red('\nError:'), error.message);
    process.exit(1);
  }
}

async function copyConfigs(targetPath, options = {}) {
  const isUpdate = options.update || false;
  const isReset = options.reset || false;
  const profile = options.profile;

  const rulesResult = await copyCursorRules(targetPath, TEMPLATE_DIR, {
    profile,
    update: isUpdate,
    reset: isReset,
  });
  if (rulesResult?.mode === PROFILE_MINIMAL) {
    showSuccess(`Cursor rules (minimal: ${rulesResult.count} files, always-on only)`);
    showInfo('Use @task-flow-* skills for sync, run, audit — omit heavy .mdc rules to save tokens');
  } else if (rulesResult) {
    showSuccess(`Cursor rules (${rulesResult.count} files)`);
  }

  const cursorSettingsPath = path.join(TEMPLATE_DIR, '.cursor/settings.json');
  if (fs.existsSync(cursorSettingsPath)) {
    await fs.copy(
      cursorSettingsPath,
      path.join(targetPath, '.cursor/settings.json'),
      { overwrite: true }
    );
    showSuccess('Cursor settings');
  }

  const claudeSettingsPath = path.join(TEMPLATE_DIR, '.claude/settings.json');
  if (fs.existsSync(claudeSettingsPath)) {
    await fs.copy(
      claudeSettingsPath,
      path.join(targetPath, '.claude/settings.json'),
      { overwrite: true }
    );
    showSuccess('Claude settings');
  }

  const claudeInstructionsPath = path.join(TEMPLATE_DIR, 'CLAUDE.md');
  if (fs.existsSync(claudeInstructionsPath)) {
    await fs.copy(
      claudeInstructionsPath,
      path.join(targetPath, 'CLAUDE.md'),
      { overwrite: true }
    );
    showSuccess('Claude instructions');
  }

  const agentsPath = path.join(TEMPLATE_DIR, 'AGENTS.md');
  if (fs.existsSync(agentsPath)) {
    await fs.copy(
      agentsPath,
      path.join(targetPath, 'AGENTS.md'),
      { overwrite: true }
    );
    showSuccess('Codex instructions (AGENTS.md)');
  }

  await copyTaskFlow(targetPath, { update: isUpdate, reset: isReset });
}

const LEGACY_TASK_FLOW_ROOT_FILES = [
  'GRAPHIFY.md',
  'CODEX.md',
  'CURSOR.md',
  'AI-PLATFORMS.md',
  'OPTIMIZATION-PLAN.md',
  'OPTIMIZATION-IMPLEMENTATION-TASKS.md',
];

async function migrateLegacyTaskFlowLayout(taskFlowDest) {
  await fs.ensureDir(path.join(taskFlowDest, 'guides', 'reports'));

  for (const file of LEGACY_TASK_FLOW_ROOT_FILES) {
    const legacyPath = path.join(taskFlowDest, file);
    if (fs.existsSync(legacyPath)) {
      await fs.remove(legacyPath);
    }
  }

  const legacyDocs = path.join(taskFlowDest, 'docs');
  if (fs.existsSync(legacyDocs)) {
    const standardsSrc = path.join(legacyDocs, 'coding-standards-full.md');
    const standardsDest = path.join(taskFlowDest, 'guides', 'coding-standards-full.md');
    if (fs.existsSync(standardsSrc) && !fs.existsSync(standardsDest)) {
      await fs.move(standardsSrc, standardsDest);
    }
    const reportsDest = path.join(taskFlowDest, 'guides', 'reports');
    const entries = await fs.readdir(legacyDocs);
    for (const entry of entries) {
      if (entry.startsWith('task-') && entry.endsWith('.md')) {
        await fs.move(path.join(legacyDocs, entry), path.join(reportsDest, entry), {
          overwrite: true,
        });
      }
    }
    await fs.remove(legacyDocs);
  }

  const legacyPlatforms = path.join(taskFlowDest, 'platforms');
  const platformsDest = path.join(taskFlowDest, 'guides', 'platforms');
  if (fs.existsSync(legacyPlatforms)) {
    await fs.ensureDir(platformsDest);
    const entries = await fs.readdir(legacyPlatforms);
    for (const entry of entries) {
      await fs.move(path.join(legacyPlatforms, entry), path.join(platformsDest, entry), {
        overwrite: true,
      });
    }
    await fs.remove(legacyPlatforms);
  }
}

async function copyTaskFlow(targetPath, options = {}) {
  const isUpdate = options.update || false;
  const isReset = options.reset || false;
  const taskFlowSrc = path.join(TEMPLATE_DIR, '.task-flow');
  const taskFlowDest = path.join(targetPath, '.task-flow');

  await fs.ensureDir(taskFlowDest);

  const PROTECTED = [
    path.join(taskFlowDest, '.internal'),
  ];
  const PRESERVED_ON_INIT = [
    path.join(taskFlowDest, 'tasks.input.txt'),
    path.join(taskFlowDest, 'tasks.status.md'),
    path.join(taskFlowDest, 'tasks.flow.md'),
    path.join(taskFlowDest, 'install-meta.json'),
  ];

  await fs.copy(taskFlowSrc, taskFlowDest, {
    overwrite: true,
    filter: (src, dest) => {
      if (isReset) {
        return true;
      }

      if (PROTECTED.some((p) => src.startsWith(p) || dest.startsWith(p))) {
        return false;
      }

      if (!isUpdate && PRESERVED_ON_INIT.includes(dest) && fs.existsSync(dest)) {
        return false;
      }

      return true;
    },
  });

  await fs.ensureDir(path.join(taskFlowDest, 'contexts'));
  await fs.ensureDir(path.join(taskFlowDest, 'guides', 'reports'));
  await migrateLegacyTaskFlowLayout(taskFlowDest);

  const flowPath = path.join(taskFlowDest, 'tasks.flow.md');
  if (!fs.existsSync(flowPath)) {
    const flowStub = [
      '# Task Flow — Dependencies, Hours & Model Recommendations',
      '',
      '<!-- Populated by task-flow: generate flow. Do not edit manually. -->',
      '<!-- Horas: uso para cobrança ao cliente -->',
      '',
    ].join('\n');
    await fs.writeFile(flowPath, flowStub);
  }

  showSuccess('Task Flow directory');
  if (isReset) {
    showWarning('Reset completed: .task-flow was recreated from scratch');
  } else if (isUpdate) {
    showInfo('Protected: .internal/ (your task data is safe)');
  } else {
    showInfo('Protected on init: .internal/, tasks.input.txt, tasks.status.md, tasks.flow.md');
  }
}

async function showModelVersions(targetPath) {
  console.log(chalk.cyan('═'.repeat(60)));
  console.log(chalk.magenta('📋 Model Versions Configured:'));
  console.log(chalk.cyan('═'.repeat(60)));
  console.log('');

  let hasModels = false;

  const claudeSettingsPath = path.join(targetPath, '.claude/settings.json');
  if (fs.existsSync(claudeSettingsPath)) {
    try {
      const settings = await fs.readJSON(claudeSettingsPath);
      if (settings.model) {
        console.log(chalk.blue('Claude:'), chalk.yellow(settings.model));
        hasModels = true;
      } else {
        console.log(chalk.blue('Claude:'), chalk.yellow('Default (recommended)'));
        hasModels = true;
      }
    } catch (error) {
    }
  }

  const cursorSettingsPath = path.join(targetPath, '.cursor/settings.json');
  if (fs.existsSync(cursorSettingsPath)) {
    try {
      const settings = await fs.readJSON(cursorSettingsPath);
      if (settings.model) {
        console.log(chalk.blue('Cursor:'), chalk.yellow(settings.model));
        hasModels = true;
      }
    } catch (error) {
    }
  }

  if (!hasModels) {
    console.log(chalk.yellow('No model versions configured yet'));
  }

  console.log('');
}

module.exports = { installInProject };
