const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

function getPackageManager(targetPath) {
  const cwd = path.resolve(targetPath);

  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }

  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
    return 'yarn';
  }

  if (fs.existsSync(path.join(cwd, 'bun.lockb')) || fs.existsSync(path.join(cwd, 'bun.lock'))) {
    return 'bun';
  }

  return 'npm';
}

function readPackageJson(targetPath) {
  const packageJsonPath = path.join(path.resolve(targetPath), 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

function buildRunCommand(packageManager, scriptName, args = []) {
  if (packageManager === 'yarn') {
    return ['yarn', scriptName, ...args].join(' ');
  }

  return [packageManager, 'run', scriptName, ...(args.length > 0 ? ['--', ...args] : [])].join(' ');
}

function resolveLintScript(scripts = {}) {
  if (scripts['lint:fix']) {
    return { scriptName: 'lint:fix', label: 'lint:fix' };
  }

  if (scripts['lint-fix']) {
    return { scriptName: 'lint-fix', label: 'lint-fix' };
  }

  if (scripts.lint) {
    if (scripts.lint.includes('--fix')) {
      return { scriptName: 'lint', label: 'lint' };
    }

    return { scriptName: 'lint', args: ['--fix'], label: 'lint --fix' };
  }

  return null;
}

function runScript(targetPath, packageManager, scriptConfig) {
  const command = buildRunCommand(packageManager, scriptConfig.scriptName, scriptConfig.args);
  execSync(command, {
    cwd: path.resolve(targetPath),
    stdio: 'inherit',
    encoding: 'utf8'
  });
}

async function runCheck(targetPath = process.cwd()) {
  const cwd = path.resolve(targetPath);
  const packageJson = readPackageJson(cwd);

  if (!packageJson) {
    console.log(chalk.red('❌ package.json not found. Run this command from a project root.'));
    return;
  }

  const packageManager = getPackageManager(cwd);
  const scripts = packageJson.scripts || {};
  const lintScript = resolveLintScript(scripts);
  const hasBuild = Boolean(scripts.build);
  let ranSomething = false;

  console.log(chalk.cyan('🔎 Running project checks'));
  console.log(chalk.gray(`   Package manager: ${packageManager}`));

  if (lintScript) {
    ranSomething = true;
    console.log(chalk.cyan(`\n▶ Running ${lintScript.label}`));
    runScript(cwd, packageManager, lintScript);
  } else {
    console.log(chalk.yellow('\n⚠️  No lint script found. Skipping lint step.'));
  }

  if (hasBuild) {
    ranSomething = true;
    console.log(chalk.cyan('\n▶ Running build'));
    runScript(cwd, packageManager, { scriptName: 'build' });
  } else {
    console.log(chalk.yellow('\n⚠️  No build script found. Skipping build step.'));
  }

  if (!ranSomething) {
    console.log(chalk.yellow('\n⚠️  Nothing to run. Add a lint and/or build script to package.json.'));
    return;
  }

  console.log(chalk.green('\n✅ Checks completed successfully.'));
}

module.exports = { runCheck };
