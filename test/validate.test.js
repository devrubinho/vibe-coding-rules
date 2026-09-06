'use strict';

// WU-12: schema validation + referential integrity (lib/validate.js,
// lib/schema-validate.js). Note: sync/diff itself is model-driven (no JS
// module), so these tests cover the deterministic guardrail that catches
// the state drift a bad sync would produce.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { validateAgainstSchema } = require('../lib/schema-validate');
const { checkReferentialIntegrity } = require('../lib/validate');
const tasksSchema = require('../lib/schemas/tasks.schema.json');
const statusSchema = require('../lib/schemas/status.schema.json');

const FIXTURES = path.join(__dirname, 'fixtures', 'state-valid');
const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const validTasks = () => readJSON(path.join(FIXTURES, 'tasks.json'));
const validStatus = () => readJSON(path.join(FIXTURES, 'status.json'));

// ---- schema: tasks.json ----

test('schema: valid tasks.json passes', () => {
  assert.deepEqual(validateAgainstSchema(tasksSchema, validTasks(), 'tasks.json'), []);
});

test('schema: task missing originalRequest fails', () => {
  const data = { tasks: [{ id: 1, title: 'x', subtasks: [] }] };
  const errors = validateAgainstSchema(tasksSchema, data, 'tasks.json');
  assert.equal(errors.length, 1);
  assert.match(errors[0], /missing required "originalRequest"/);
});

test('schema: subtask missing instructions fails', () => {
  const data = {
    tasks: [{ id: 1, title: 'x', originalRequest: '- x', subtasks: [{ id: 1, title: 's' }] }],
  };
  const errors = validateAgainstSchema(tasksSchema, data, 'tasks.json');
  assert.ok(errors.some((e) => /instructions/.test(e)));
});

// ---- schema: status.json ----

test('schema: valid status.json passes', () => {
  assert.deepEqual(validateAgainstSchema(statusSchema, validStatus(), 'status.json'), []);
});

test('schema: bad status enum fails', () => {
  const data = { tasks: { 1: { status: 'doing', subtasks: { 1: 'pending' } } } };
  const errors = validateAgainstSchema(statusSchema, data, 'status.json');
  assert.ok(errors.some((e) => /is not one of/.test(e)));
});

test('schema: non-numeric task key fails', () => {
  const data = { tasks: { abc: { status: 'pending', subtasks: {} } } };
  const errors = validateAgainstSchema(statusSchema, data, 'status.json');
  assert.ok(errors.some((e) => /must match \^\[0-9\]\+\$/.test(e)));
});

// ---- referential integrity ----

test('referential: valid fixture has no issues', () => {
  assert.deepEqual(checkReferentialIntegrity(validTasks(), validStatus()), []);
});

test('referential: subtask in status missing from tasks', () => {
  const status = validStatus();
  status.tasks['3'].subtasks['9'] = 'done'; // 3.9 does not exist in tasks
  const errors = checkReferentialIntegrity(validTasks(), status);
  assert.ok(errors.some((e) => /status subtask 3\.9 has no matching subtask/.test(e)));
});

test('referential: task in status missing from tasks', () => {
  const status = validStatus();
  status.tasks['99'] = { status: 'pending', subtasks: {} };
  const errors = checkReferentialIntegrity(validTasks(), status);
  assert.ok(errors.some((e) => /status task 99 has no matching task/.test(e)));
});

test('referential: subtask in tasks missing from status', () => {
  const status = validStatus();
  delete status.tasks['1'].subtasks['2']; // 1.2 exists in tasks, drop from status
  const errors = checkReferentialIntegrity(validTasks(), status);
  assert.ok(errors.some((e) => /subtask 1\.2 is missing in status\.json/.test(e)));
});

test('referential: task in tasks missing from status', () => {
  const status = validStatus();
  delete status.tasks['2'];
  const errors = checkReferentialIntegrity(validTasks(), status);
  assert.ok(errors.some((e) => /task 2 has no status entry/.test(e)));
});

test('referential: dependsOn pointing at a non-existent task', () => {
  const tasks = validTasks();
  tasks.tasks[1].dependsOn = [99];
  const errors = checkReferentialIntegrity(tasks, validStatus());
  assert.ok(errors.some((e) => /task 2 dependsOn 99, which does not exist/.test(e)));
});

test('referential: dependsOn listing itself', () => {
  const tasks = validTasks();
  tasks.tasks[1].dependsOn = [2];
  const errors = checkReferentialIntegrity(tasks, validStatus());
  assert.ok(errors.some((e) => /task 2 lists itself in dependsOn/.test(e)));
});
