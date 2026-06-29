const fs = require('fs-extra');
const os = require('os');
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
      ? chalk.yellow('share-ai-config') + chalk.gray(' (flag saved in install-meta.json)')
      : chalk.gray('appends .task-flow + graphify-out to .gitignore')
  );
  if (options.keepTasks) {
    console.log(
      chalk.blue('📋 Tasks:'),
      chalk.yellow('keep-tasks') + chalk.gray(' (tasks.input.txt, tasks.status.md, .internal/, dev-logs/)')
    );
  }
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

    let taskBackup = null;
    const taskFlowPath = path.join(targetPath, '.task-flow');
    if (isReset && options.keepTasks && (await fs.pathExists(taskFlowPath))) {
      taskBackup = await backupTaskFiles(taskFlowPath);
    }

    if (isReset) {
      await fs.remove(taskFlowPath);
    }

    const dirs = [
      '.cursor/rules',
      '.cursor/skills',
      '.claude',
      '.claude/skills',
      '.claude/hooks',
      '.claude/agents',
      '.task-flow',
      '.codex'
    ];

    for (const dir of dirs) {
      await fs.ensureDir(path.join(targetPath, dir));
    }

    spinner.text = 'Copying configuration files...';

    await copyConfigs(targetPath, {
      reset: isReset,
      profile,
      keepTasks: options.keepTasks === true,
      taskBackup,
    });

    spinner.text = 'Updating .gitignore...';

    await updateGitignore(targetPath);
    showSuccess('.gitignore updated');
    showInfo('Git: appended .task-flow and graphify-out to .gitignore');

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
  const isReset = options.reset || false;
  const profile = options.profile;
  const taskBackup = options.taskBackup || null;

  const rulesResult = await copyCursorRules(targetPath, TEMPLATE_DIR, {
    profile,
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

  const claudeHooksSrc = path.join(TEMPLATE_DIR, '.claude/hooks');
  if (fs.existsSync(claudeHooksSrc)) {
    await fs.copy(
      claudeHooksSrc,
      path.join(targetPath, '.claude/hooks'),
      { overwrite: true }
    );
    showSuccess('Claude hooks (git-write blocker)');
  }

  const claudeAgentsSrc = path.join(TEMPLATE_DIR, '.claude/agents');
  if (fs.existsSync(claudeAgentsSrc)) {
    await fs.copy(
      claudeAgentsSrc,
      path.join(targetPath, '.claude/agents'),
      { overwrite: true }
    );
    showSuccess('Claude agents (task-runner, task-reviewer)');
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

  await copyTaskFlow(targetPath, {
    reset: isReset,
    keepTasks: options.keepTasks === true,
    taskBackup,
  });
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

async function backupTaskFiles(taskFlowDest) {
  const backup = {};
  const files = ['tasks.input.txt', 'tasks.status.md'];
  for (const name of files) {
    const filePath = path.join(taskFlowDest, name);
    if (await fs.pathExists(filePath)) {
      backup[name] = await fs.readFile(filePath, 'utf8');
    }
  }
  const internalPath = path.join(taskFlowDest, '.internal');
  if (await fs.pathExists(internalPath)) {
    backup['.internal'] = await fs.mkdtemp(path.join(os.tmpdir(), 'rbin-task-flow-internal-'));
    await fs.copy(internalPath, path.join(backup['.internal'], '.internal'));
  }
  const devLogsPath = path.join(taskFlowDest, 'dev-logs');
  if (await fs.pathExists(devLogsPath)) {
    backup['dev-logs'] = await fs.mkdtemp(path.join(os.tmpdir(), 'rbin-task-flow-dev-logs-'));
    await fs.copy(devLogsPath, path.join(backup['dev-logs'], 'dev-logs'));
  }
  return backup;
}

async function restoreTaskFiles(taskFlowDest, backup) {
  if (!backup) return;
  for (const name of ['tasks.input.txt', 'tasks.status.md']) {
    if (backup[name] !== undefined) {
      await fs.writeFile(path.join(taskFlowDest, name), backup[name], 'utf8');
    }
  }
  if (backup['.internal']) {
    const src = path.join(backup['.internal'], '.internal');
    if (await fs.pathExists(src)) {
      await fs.copy(src, path.join(taskFlowDest, '.internal'), { overwrite: true });
    }
    await fs.remove(backup['.internal']);
  }
  if (backup['dev-logs']) {
    const src = path.join(backup['dev-logs'], 'dev-logs');
    if (await fs.pathExists(src)) {
      await fs.copy(src, path.join(taskFlowDest, 'dev-logs'), { overwrite: true });
    }
    await fs.remove(backup['dev-logs']);
  }
}

async function copyTaskFlow(targetPath, options = {}) {
  const isReset = options.reset || false;
  const keepTasks = options.keepTasks === true;
  const taskBackup = options.taskBackup || null;
  const taskFlowSrc = path.join(TEMPLATE_DIR, '.task-flow');
  const taskFlowDest = path.join(targetPath, '.task-flow');

  await fs.ensureDir(taskFlowDest);

  const PROTECTED = [
    path.join(taskFlowDest, '.internal'),
  ];
  const PRESERVED_ON_INIT = [
    path.join(taskFlowDest, 'tasks.input.txt'),
    path.join(taskFlowDest, 'tasks.status.md'),
    path.join(taskFlowDest, 'install-meta.json'),
  ];
  const PRESERVED_KEEP_TASKS = [
    path.join(taskFlowDest, 'tasks.input.txt'),
    path.join(taskFlowDest, 'tasks.status.md'),
  ];

  await fs.copy(taskFlowSrc, taskFlowDest, {
    overwrite: true,
    filter: (src, dest) => {
      if (isReset && !keepTasks) {
        return true;
      }

      if (PROTECTED.some((p) => src.startsWith(p) || dest.startsWith(p))) {
        return false;
      }

      if (keepTasks && PRESERVED_KEEP_TASKS.includes(dest) && fs.existsSync(dest)) {
        return false;
      }

      if (!isReset && !keepTasks && PRESERVED_ON_INIT.includes(dest) && fs.existsSync(dest)) {
        return false;
      }

      return true;
    },
  });

  if (taskBackup) {
    await restoreTaskFiles(taskFlowDest, taskBackup);
  }

  await fs.ensureDir(path.join(taskFlowDest, 'contexts'));
  await fs.ensureDir(path.join(taskFlowDest, 'dev-logs'));
  await fs.ensureDir(path.join(taskFlowDest, 'guides', 'reports'));
  await migrateLegacyTaskFlowLayout(taskFlowDest);

  showSuccess('Task Flow directory');
  if (keepTasks) {
    showInfo('Kept: tasks.input.txt, tasks.status.md, .internal/, dev-logs/');
  } else if (isReset) {
    showWarning('Reset completed: .task-flow was recreated from scratch');
  } else {
    showInfo('Protected on init: .internal/, tasks.input.txt, tasks.status.md');
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
