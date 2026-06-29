'use strict';

// WU-11 harness sanity check: proves `node --test` runs and that the core
// lib modules + fixtures load. Comprehensive coverage lives in the other
// test files (sync/render/validate).

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { validateAgainstSchema } = require('../lib/schema-validate');
const tasksSchema = require('../lib/schemas/tasks.schema.json');
const statusSchema = require('../lib/schemas/status.schema.json');

const FIXTURES = path.join(__dirname, 'fixtures');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

test('harness runs and lib modules load', () => {
  assert.equal(typeof validateAgainstSchema, 'function');
});

test('valid fixture passes both schemas', () => {
  const tasks = readJSON(path.join(FIXTURES, 'state-valid/tasks.json'));
  const status = readJSON(path.join(FIXTURES, 'state-valid/status.json'));
  assert.deepEqual(validateAgainstSchema(tasksSchema, tasks, 'tasks.json'), []);
  assert.deepEqual(validateAgainstSchema(statusSchema, status, 'status.json'), []);
});
