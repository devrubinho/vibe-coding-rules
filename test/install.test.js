'use strict';

// WU-14: installer smoke test — init produces the expected files (incl. the
// hooks/agents added in Phases 1 & 3); reset --keep-tasks preserves user task
// state while refreshing configs.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CLI = path.join(ROOT, 'bin/cli.js');

function run(args) {
  execFileSync('node', [CLI, ...args], { stdio: 'ignore' });
}
function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'rbin-install-'));
}
const exists = (dir, rel) => fs.existsSync(path.join(dir, rel));

test('init produces the expected files', () => {
  const dir = tmp();
  try {
    run(['init', '-p', dir]);
    for (const rel of [
      'CLAUDE.md',
      'AGENTS.md',
      '.claude/settings.json',
      '.claude/hooks/block-git-write.js',
      '.claude/hooks/remind-sync.js',
      '.claude/agents/task-runner.md',
      '.claude/agents/task-reviewer.md',
      '.claude/skills',
      '.cursor/rules',
      '.task-flow/tasks.input.txt',
    ]) {
      assert.ok(exists(dir, rel), `missing after init: ${rel}`);
    }
    // shipped settings carry the git-write hook
    const settings = JSON.parse(fs.readFileSync(path.join(dir, '.claude/settings.json'), 'utf8'));
    assert.equal(settings.hooks.PreToolUse[0].matcher, 'Bash');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('reset --keep-tasks preserves task state and refreshes configs', () => {
  const dir = tmp();
  try {
    run(['init', '-p', dir]);

    // user state
    fs.writeFileSync(path.join(dir, '.task-flow/tasks.input.txt'), '- My custom task\n');
    fs.mkdirSync(path.join(dir, '.task-flow/.internal'), { recursive: true });
    fs.writeFileSync(
      path.join(dir, '.task-flow/.internal/tasks.json'),
      JSON.stringify({ tasks: [{ id: 1, title: 'My custom task', originalRequest: '- My custom task', subtasks: [] }] })
    );
    fs.mkdirSync(path.join(dir, '.task-flow/dev-logs'), { recursive: true });
    fs.writeFileSync(path.join(dir, '.task-flow/dev-logs/task-1.1-manual.md'), '# manual\n');

    run(['reset', '--keep-tasks', '-p', dir]);

    // preserved
    assert.equal(
      fs.readFileSync(path.join(dir, '.task-flow/tasks.input.txt'), 'utf8'),
      '- My custom task\n'
    );
    assert.ok(exists(dir, '.task-flow/.internal/tasks.json'), 'lost .internal on reset --keep-tasks');
    assert.ok(exists(dir, '.task-flow/dev-logs/task-1.1-manual.md'), 'lost dev-logs on reset --keep-tasks');

    // refreshed configs (hooks/agents re-applied)
    assert.ok(exists(dir, '.claude/hooks/block-git-write.js'), 'hooks not refreshed');
    assert.ok(exists(dir, '.claude/agents/task-runner.md'), 'agents not refreshed');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
