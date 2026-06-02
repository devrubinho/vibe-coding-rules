const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

function showHeader() {
  let version = '';
  try {
    const pkgPath = path.join(__dirname, '..', 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = require(pkgPath);
      version = pkg.version ? ' v' + pkg.version : '';
    }
  } catch (_) {}

  console.clear();
  console.log(chalk.cyan('╔════════════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + '        ' + chalk.magenta('✨ RBIN Task Flow - Installation ✨') + '          ' + chalk.cyan('║'));
  console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════╝'));
  if (version) console.log(chalk.gray('Version' + version) + '\n');
  else console.log('');
}

function showSuccess(message) {
  console.log(chalk.green('✅ ' + message));
}

function showError(message) {
  console.log(chalk.red('❌ ' + message));
}

function showWarning(message) {
  console.log(chalk.yellow('⚠️  ' + message));
}

function showInfo(message) {
  console.log(chalk.blue('ℹ️  ' + message));
}

function measureAlwaysOnRules(targetPath) {
  const rulesDir = path.join(targetPath, '.cursor', 'rules');
  if (!fs.existsSync(rulesDir)) return null;

  let totalBytes = 0;
  const files = fs.readdirSync(rulesDir).filter((name) => name.endsWith('.mdc'));

  for (const name of files) {
    const filePath = path.join(rulesDir, name);
    const content = fs.readFileSync(filePath, 'utf8');
    if (/alwaysApply:\s*true\b/.test(content)) {
      totalBytes += Buffer.byteLength(content, 'utf8');
    }
  }

  if (totalBytes === 0) return null;
  return {
    bytes: totalBytes,
    kb: totalBytes / 1024,
    approxTokens: Math.round(totalBytes / 4),
  };
}

function showNextSteps(targetPath) {
  const alwaysOn = measureAlwaysOnRules(targetPath);

  console.log('\n' + chalk.cyan('═'.repeat(60)));
  console.log(chalk.magenta.bold('  Next Steps:'));
  console.log(chalk.cyan('═'.repeat(60)));
  if (alwaysOn) {
    const kbLabel = alwaysOn.kb < 10 ? alwaysOn.kb.toFixed(1) : String(Math.round(alwaysOn.kb));
    console.log(
      chalk.gray('  Always-on rules:'),
      chalk.yellow(`~${kbLabel} KB`),
      chalk.gray(`(~${alwaysOn.approxTokens.toLocaleString('en-US')} tokens est.)`)
    );
  }
  console.log(chalk.blue('  1.'), 'Edit', chalk.yellow('.task-flow/tasks.input.txt'));
  console.log(chalk.blue('  2.'), 'Sync:', chalk.cyan('task-flow: sync'), chalk.gray('· Cursor/Claude: @task-flow-sync or /task-flow-sync'));
  console.log(chalk.blue('  3.'), 'Run:', chalk.cyan('task-flow: run next X'), chalk.gray('· @task-flow-run'));
  console.log(chalk.blue('  4.'), 'Check status:', chalk.cyan('task-flow: status'));
  console.log(chalk.blue('  5.'), 'Codex:', chalk.gray('AGENTS.md + .task-flow/CODEX.md on demand'));
  console.log(chalk.blue('  6.'), 'Optional Graphify:', chalk.yellow('graphify extract .'), chalk.gray('— .task-flow/GRAPHIFY.md'));
  console.log(chalk.cyan('═'.repeat(60)));
  console.log(chalk.blue('\n  See'), chalk.yellow('.task-flow/README.md'), chalk.blue('for all available commands\n'));
}

function parseTaskIds(input, allTasks = []) {
  if (!input || input.trim().toLowerCase() === 'all') {
    return allTasks.map(t => t.id);
  }
  
  const ids = input.split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0)
    .map(id => parseInt(id))
    .filter(id => !isNaN(id));
  
  return ids;
}

module.exports = {
  showHeader,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showNextSteps,
  measureAlwaysOnRules,
  parseTaskIds
};
