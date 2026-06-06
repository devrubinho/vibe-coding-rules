#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const { installInProject } = require('../lib/install');
const { parseProfileOption } = require('../lib/profiles');
const { checkVersionUpdates } = require('../lib/version');
const { estimateTask } = require('../lib/estimate');
const { generateReport } = require('../lib/report');
const { runAudit } = require('../lib/audit');
const { runCheck } = require('../lib/check');
const chalk = require('chalk');

program
  .name('rbin-task-flow')
  .description('AI-powered task management for Claude and Cursor')
  .version(require('../package.json').version);

function addInstallCommand(name, description, extra = {}) {
  program
    .command(name)
    .description(description)
    .option('-p, --path <path>', 'Target directory (default: current directory)')
    .option('-g, --graphify', 'Run graphify extract . --backend claude-cli after install (requires graphify CLI)')
    .option(
      '--profile <profile>',
      'Cursor rules: minimal (2 always-on + skills) or standard (all rules); update without flag keeps .task-flow/install-meta.json'
    )
    .option(
      '--share-ai-config',
      'Do not gitignore .cursor/skills/ or .cursor/rules/ (team can commit shared AI config; see .gitignore comment)'
    )
    .action(async (options) => {
      const targetPath = options.path || process.cwd();
      try {
        const profile =
          options.profile !== undefined ? parseProfileOption(options.profile) : undefined;
        const shareAiConfig = options.shareAiConfig ? true : undefined;
        await installInProject(targetPath, {
          ...extra,
          graphify: options.graphify,
          profile,
          shareAiConfig,
        });
      } catch (error) {
        console.error(chalk.red('\n' + error.message + '\n'));
        process.exit(1);
      }
    });
}

addInstallCommand('init', 'Initialize RBIN Task Flow in current directory');
addInstallCommand('update', 'Update RBIN Task Flow in current directory', { update: true });
addInstallCommand('reset', 'Reset RBIN Task Flow in current directory', { reset: true });

program
  .command('version-check')
  .description('Check for model version updates')
  .action(async () => {
    await checkVersionUpdates();
  });

program
  .command('estimate')
  .description('Estimate time for task(s) based on real task complexity and average development pace')
  .argument('<taskIds>', 'Task ID(s) to estimate (comma-separated or "all")')
  .option('-p, --path <path>', 'Target directory (default: current directory)')
  .action(async (taskIds, options) => {
    const targetPath = options.path || process.cwd();
    await estimateTask(taskIds, targetPath);
  });

program
  .command('report')
  .description('Generate implementation report for completed task(s)')
  .argument('<taskIds>', 'Task ID(s) to generate report for (comma-separated or "all")')
  .option('-p, --path <path>', 'Target directory (default: current directory)')
  .action(async (taskIds, options) => {
    const targetPath = options.path || process.cwd();
    await generateReport(taskIds, targetPath);
  });

program
  .command('audit')
  .description('List files with unstaged changes (not yet git add)')
  .option('-p, --path <path>', 'Target directory (default: current directory)')
  .action(async (options) => {
    const targetPath = options.path || process.cwd();
    await runAudit(targetPath);
  });

program
  .command('check')
  .description('Run lint fix when available, then build')
  .option('-p, --path <path>', 'Target directory (default: current directory)')
  .action(async (options) => {
    const targetPath = options.path || process.cwd();
    await runCheck(targetPath);
  });

program
  .command('info')
  .description('Show information about RBIN Task Flow')
  .action(() => {
    console.log('\n' + chalk.cyan('╔════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + '        ' + chalk.magenta('✨ RBIN Task Flow ✨') + '                           ' + chalk.cyan('║'));
    console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════╝') + '\n');
    console.log(chalk.blue('AI-powered task management for Claude and Cursor'));
    console.log(chalk.yellow('\nVersion:'), require('../package.json').version);
    console.log(chalk.yellow('Repository:'), 'https://github.com/rbinoliveira/rbin-task-flow');
    console.log(chalk.yellow('\nCommands:'));
    console.log(chalk.cyan('  rbin-task-flow init') + '         - Initialize in current directory');
    console.log(chalk.cyan('  rbin-task-flow init --profile minimal') + ' - Low-token install (2 always-on rules + skills)');
    console.log(chalk.cyan('  rbin-task-flow init --share-ai-config') + ' - Version .cursor/skills and rules in git');
    console.log(chalk.cyan('  rbin-task-flow init --graphify') + ' - Init + graphify extract --backend claude-cli (if CLI installed)');
    console.log(chalk.cyan('  rbin-task-flow update') + '       - Update configurations');
    console.log(chalk.cyan('  rbin-task-flow reset') + '        - Reset task flow files from scratch');
    console.log(chalk.cyan('  rbin-task-flow reset --graphify') + ' - Reset + graphify extract --backend claude-cli (if CLI installed)');
    console.log(chalk.cyan('  rbin-task-flow version-check') + ' - Check for model updates');
    console.log(chalk.cyan('  rbin-task-flow estimate <ids>') + ' - Estimate time (e.g., "1" or "1,2" or "all")');
    console.log(chalk.cyan('  rbin-task-flow report <ids>') + '  - Generate report (e.g., "1" or "1,2" or "all")');
    console.log(chalk.cyan('  rbin-task-flow check') + '       - Run lint fix and build when available');
    console.log(chalk.cyan('  rbin-task-flow audit') + '       - List unstaged files (not yet git add)');
    console.log(chalk.cyan('  rbin-task-flow info') + '         - Show this information\n');
  });

program.parse();
