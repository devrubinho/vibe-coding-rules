const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { showHeader, showSuccess, showError, showWarning, showInfo, showNextSteps } = require('./utils');

const TEMPLATE_DIR = path.join(__dirname, '..');

async function installInProject(targetPath, options = {}) {
  const isUpdate = options.update || false;

  showHeader();

  if (isUpdate) {
    console.log(chalk.blue('🔄 Updating RBIN Task Flow...'));
  } else {
    console.log(chalk.blue('🚀 Installing RBIN Task Flow...'));
  }

  console.log(chalk.blue('📁 Target:'), targetPath, '\n');

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

    const dirs = [
      '.cursor/rules',
      '.claude',
      '.task-flow'
    ];

    for (const dir of dirs) {
      await fs.ensureDir(path.join(targetPath, dir));
    }

    spinner.text = 'Copying configuration files...';

    await copyConfigs(targetPath, isUpdate);

    spinner.text = 'Updating .gitignore...';

    await updateGitignore(targetPath);

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

async function copyConfigs(targetPath, isUpdate = false) {
  const cursorRulesPath = path.join(TEMPLATE_DIR, '.cursor/rules');
  const cursorRulesDest = path.join(targetPath, '.cursor/rules');
  if (fs.existsSync(cursorRulesPath)) {
    if (isUpdate && fs.existsSync(cursorRulesDest)) {
      await fs.emptyDir(cursorRulesDest);
    }
    await fs.copy(cursorRulesPath, cursorRulesDest, { overwrite: true });
    showSuccess('Cursor rules');
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

  await copyTaskFlow(targetPath);
}

async function copyTaskFlow(targetPath) {
  const taskFlowSrc = path.join(TEMPLATE_DIR, '.task-flow');
  const taskFlowDest = path.join(targetPath, '.task-flow');

  await fs.ensureDir(taskFlowDest);

  const PROTECTED = [
    path.join(taskFlowDest, '.internal'),
  ];

  await fs.copy(taskFlowSrc, taskFlowDest, {
    overwrite: true,
    filter: (src) => {
      return !PROTECTED.some((p) => src.startsWith(p));
    },
  });

  await fs.ensureDir(path.join(taskFlowDest, 'contexts'));

  const flowPath = path.join(taskFlowDest, 'tasks.flow.md');
  if (!fs.existsSync(flowPath)) {
    const flowStub = [
      '# Task Flow — Dependencies, Hours & Model Recommendations',
      '',
      '<!-- Populated by task-flow: generate flow. Do not edit manually. -->',
      '<!-- Horas: dev mediano (3-5 anos), uso para cobrança ao cliente -->',
      '',
    ].join('\n');
    await fs.writeFile(flowPath, flowStub);
  }

  showSuccess('Task Flow directory (overwritten)');
  showInfo('Protected: .internal/ (your task data is safe)');
}

async function updateGitignore(targetPath) {
  const gitignorePath = path.join(targetPath, '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    await fs.writeFile(gitignorePath, '');
  }

  let content = await fs.readFile(gitignorePath, 'utf8');

  const entries = [
    '.claude/',
    '.cursor/',
    '.task-flow/',
    'CLAUDE.md',
    'AGENTS.md'
  ];

  for (const entry of entries) {
    const regex = new RegExp(`^${entry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'gm');
    content = content.replace(regex, '');
  }

  content = content.replace(/\n{3,}/g, '\n\n');

  if (!content.endsWith('\n')) {
    content += '\n';
  }

  content += '\n' + entries.join('\n') + '\n';

  await fs.writeFile(gitignorePath, content);

  showSuccess('.gitignore updated');
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
