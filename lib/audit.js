const { execSync } = require('child_process');
const path = require('path');
const chalk = require('chalk');

function getUnstagedFiles(targetPath) {
  const cwd = path.resolve(targetPath);
  try {
    const out = execSync('git diff --name-only', { encoding: 'utf8', cwd });
    return out
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch (err) {
    if (err.stderr && (err.stderr.includes('not a git repository') || err.message.includes('not a git'))) {
      return null;
    }
    throw err;
  }
}

async function runAudit(targetPath = process.cwd()) {
  const files = getUnstagedFiles(targetPath);

  if (files === null) {
    console.log(chalk.red('❌ Not a git repository. Run from a project root with git initialized.'));
    return;
  }

  if (files.length === 0) {
    console.log(chalk.yellow('⚠️  No unstaged changes. All modified files are staged (or working tree is clean).'));
    console.log(chalk.gray('   Use "task-flow: audit" after editing files and before "git add".'));
    return;
  }

  console.log(chalk.cyan('📋 Unstaged files (not yet added with git add):'));
  console.log(chalk.cyan('─'.repeat(50)));
  files.forEach((f) => console.log(chalk.white('  ' + f)));
  console.log(chalk.cyan('─'.repeat(50)));
  console.log(chalk.magenta('  Total:'), chalk.yellow(files.length), chalk.magenta('file(s)'));
  console.log('');
  console.log(chalk.gray('  Tip: run lint/test only on these paths, then "git add" when ready.'));
}

module.exports = { runAudit, getUnstagedFiles };
