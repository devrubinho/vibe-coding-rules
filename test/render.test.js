'use strict';

// WU-13: deterministic tasks.status.md renderer (lib/render-status.js).

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { renderStatus } = require('../lib/render-status');

const ROOT = path.join(__dirname, '..');
const FIXTURES = path.join(__dirname, 'fixtures');
const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const validTasks = readJSON(path.join(FIXTURES, 'state-valid/tasks.json'));
const validStatus = readJSON(path.join(FIXTURES, 'state-valid/status.json'));

test('render: matches the golden fixture byte-for-byte', () => {
  const golden = fs.readFileSync(path.join(FIXTURES, 'tasks.status.golden.md'), 'utf8');
  assert.equal(renderStatus(validTasks, validStatus), golden);
});

test('render: is idempotent', () => {
  assert.equal(renderStatus(validTasks, validStatus), renderStatus(validTasks, validStatus));
});

test('render: reproduces the shipped default tasks.status.md', () => {
  const tasks = {
    tasks: [
      { id: 1, title: 'First task', description: '', originalRequest: '- First task', createdAt: 'x', subtasks: [] },
      { id: 2, title: 'Second task', description: '', originalRequest: '- Second task', createdAt: 'x', subtasks: [] },
    ],
  };
  const status = { tasks: { 1: { status: 'pending', subtasks: {} }, 2: { status: 'pending', subtasks: {} } } };
  const shipped = fs.readFileSync(path.join(ROOT, '.task-flow/tasks.status.md'), 'utf8');
  assert.equal(renderStatus(tasks, status), shipped);
});

test('render: summary counts are correct', () => {
  const md = renderStatus(validTasks, validStatus);
  assert.match(md, /- ✅ \*\*Completed Tasks\*\*: 1/);
  assert.match(md, /- ⏳ \*\*Tasks in Progress\*\*: 2/); // task 2 in_progress + task 3 manual-bearing
  assert.match(md, /- 📝 \*\*Remaining Subtasks\*\*: 2/);
  assert.match(md, /- 🖐️ \*\*Manual \(awaiting you\)\*\*: 1/);
});

test('render: checkboxes and manual dev-log link', () => {
  const md = renderStatus(validTasks, validStatus);
  assert.match(md, /- \[x\] Auth feature\n {2}- \[x\] Login form\n {2}- \[x\] Session handling/);
  assert.match(md, /- \[ \] Billing\n {2}- \[x\] Stripe integration\n {2}- \[ \] Webhooks/);
  assert.match(md, /- \[~\] Deploy\n {2}- \[~\] Vercel setup — manual: \.task-flow\/dev-logs\/task-3\.1-manual\.md/);
});

test('render: no manual line when nothing is manual', () => {
  const status = { tasks: { 1: { status: 'pending', subtasks: { 1: 'pending', 2: 'pending' } } } };
  const tasks = { tasks: [validTasks.tasks[0]] };
  const md = renderStatus(tasks, status);
  assert.doesNotMatch(md, /Manual \(awaiting you\)/);
});

test('render: empty task list does not crash and ends with newline', () => {
  const md = renderStatus({ tasks: [] }, { tasks: {} });
  assert.match(md, /# Task Status/);
  assert.match(md, /## Tasks/);
  assert.ok(md.endsWith('\n'));
});
