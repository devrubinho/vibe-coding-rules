#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const { installInProject } = require('../lib/install');
const { parseProfileOption } = require('../lib/profiles');
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
    .option('-g, --graphify', 'Run graphify extract → graphify-out/ at project root (claude-cli backend; requires graphify CLI)')
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

program.parse();
