#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const { installInProject } = require('../lib/install');
const { parseProfileOption } = require('../lib/profiles');
const { checkVersionUpdates } = require('../lib/version');
const { estimateTask } = require('../lib/estimate');
const { generateReport } = require('../lib/report');
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
    .option('-g, --graphify', 'Run graphify extract → .task-flow/guides/graphify-out/ (claude-cli backend; requires graphify CLI)')
    .option(
      '--profile <profile>',
      'Cursor rules: minimal (2 always-on + skills) or standard (all rules); reset without flag keeps .task-flow/install-meta.json'
    )
    .option(
      '--share-ai-config',
      'Save team AI config preference in install-meta.json (appends .task-flow to .gitignore)'
    )
    .option(
      '--keep-tasks',
      'Preserve tasks.input.txt, tasks.status.md, .internal/, and dev-logs/ on reset (upgrade package without losing task definitions)'
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
          keepTasks: options.keepTasks === true,
        });
      } catch (error) {
        console.error(chalk.red('\n' + error.message + '\n'));
        process.exit(1);
      }
    });
}

addInstallCommand('init', 'Initialize RBIN Task Flow in current directory');
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
  .command('validate')
  .description('Validate .task-flow state (tasks.json/status.json) against schemas + referential integrity')
  .option('-p, --path <path>', 'Target directory (default: current directory)')
  .option('-s, --schema', 'Validate against JSON schemas and cross-check task/subtask ids')
  .action(async (options) => {
    const targetPath = options.path || process.cwd();
    const { validateTaskFlow } = require('../lib/validate');
    const code = await validateTaskFlow(targetPath);
    process.exit(code);
  });

program
  .command('render-status')
  .description('Deterministically render .task-flow/tasks.status.md from tasks.json + status.json')
  .option('-p, --path <path>', 'Target directory (default: current directory)')
  .option('--stdout', 'Print to stdout instead of writing tasks.status.md')
  .action(async (options) => {
    const targetPath = options.path || process.cwd();
    const { renderStatusFile } = require('../lib/render-status');
    const code = await renderStatusFile(targetPath, { stdout: options.stdout === true });
    process.exit(code);
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
    console.log(chalk.cyan('  rbin-task-flow reset') + '        - Reset task flow files from scratch');
    console.log(chalk.cyan('  rbin-task-flow reset --keep-tasks') + ' - Upgrade package without overwriting tasks');
    console.log(chalk.cyan('  rbin-task-flow reset --graphify') + ' - Reset + graphify extract --backend claude-cli (if CLI installed)');
    console.log(chalk.cyan('  rbin-task-flow reset --keep-tasks --graphify') + ' - Upgrade + keep tasks + graphify extract');
    console.log(chalk.cyan('  rbin-task-flow version-check') + ' - Check for model updates');
    console.log(chalk.cyan('  rbin-task-flow estimate <ids>') + ' - Estimate time (e.g., "1" or "1,2" or "all")');
    console.log(chalk.cyan('  rbin-task-flow report <ids>') + '  - Generate report (e.g., "1" or "1,2" or "all")');
    console.log(chalk.cyan('  rbin-task-flow validate --schema') + ' - Validate state files (schema + referential integrity)');
    console.log(chalk.cyan('  rbin-task-flow render-status') + '  - Render tasks.status.md from state (deterministic)');
    console.log(chalk.cyan('  rbin-task-flow info') + '         - Show this information');
    console.log(chalk.gray('  task-flow: audit — use in AI (@task-flow-audit)\n'));
  });

program.parse();
