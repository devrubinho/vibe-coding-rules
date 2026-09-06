const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { validateAgainstSchema } = require('./schema-validate');

const tasksSchema = require('./schemas/tasks.schema.json');
const statusSchema = require('./schemas/status.schema.json');

// Cross-check that every task/subtask in tasks.json has a status entry and
// vice-versa. This is the real-world drift bug schema checks alone miss.
function checkReferentialIntegrity(tasksData, statusData) {
  const errors = [];
  const tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : [];
  const statusTasks = (statusData && statusData.tasks) || {};

  const taskById = new Map();
  for (const task of tasks) taskById.set(String(task.id), task);

  for (const task of tasks) {
    const key = String(task.id);
    const status = statusTasks[key];
    if (!status) {
      errors.push(`referential: task ${key} has no status entry in status.json`);
      continue;
    }
    const statusSubs = status.subtasks || {};
    for (const subtask of Array.isArray(task.subtasks) ? task.subtasks : []) {
      if (!(String(subtask.id) in statusSubs)) {
        errors.push(`referential: subtask ${key}.${subtask.id} is missing in status.json`);
      }
    }
  }

  for (const task of tasks) {
    for (const depId of Array.isArray(task.dependsOn) ? task.dependsOn : []) {
      if (depId === task.id) {
        errors.push(`referential: task ${task.id} lists itself in dependsOn`);
      } else if (!taskById.has(String(depId))) {
        errors.push(`referential: task ${task.id} dependsOn ${depId}, which does not exist`);
      }
    }
  }

  for (const [key, status] of Object.entries(statusTasks)) {
    const task = taskById.get(key);
    if (!task) {
      errors.push(`referential: status task ${key} has no matching task in tasks.json`);
      continue;
    }
    const subIds = new Set(
      (Array.isArray(task.subtasks) ? task.subtasks : []).map((s) => String(s.id))
    );
    for (const sid of Object.keys(status.subtasks || {})) {
      if (!subIds.has(sid)) {
        errors.push(`referential: status subtask ${key}.${sid} has no matching subtask in tasks.json`);
      }
    }
  }

  return errors;
}

async function validateTaskFlow(targetPath = process.cwd()) {
  const internalDir = path.join(targetPath, '.task-flow/.internal');
  const tasksPath = path.join(internalDir, 'tasks.json');
  const statusPath = path.join(internalDir, 'status.json');

  const tasksExists = fs.existsSync(tasksPath);
  const statusExists = fs.existsSync(statusPath);

  if (!tasksExists && !statusExists) {
    console.log(
      chalk.yellow('⚠️  No .task-flow/.internal state found. Run "task-flow: sync" first — nothing to validate.')
    );
    return 0; // clean no-op (e.g. fresh project or the tool's own repo)
  }

  const errors = [];
  let tasksData = null;
  let statusData = null;

  if (tasksExists) {
    try {
      tasksData = await fs.readJSON(tasksPath);
    } catch (error) {
      errors.push(`tasks.json: invalid JSON — ${error.message}`);
    }
  } else {
    errors.push('tasks.json: missing while status.json exists');
  }

  if (statusExists) {
    try {
      statusData = await fs.readJSON(statusPath);
    } catch (error) {
      errors.push(`status.json: invalid JSON — ${error.message}`);
    }
  } else {
    errors.push('status.json: missing while tasks.json exists');
  }

  if (tasksData) errors.push(...validateAgainstSchema(tasksSchema, tasksData, 'tasks.json'));
  if (statusData) errors.push(...validateAgainstSchema(statusSchema, statusData, 'status.json'));

  if (tasksData && statusData) {
    errors.push(...checkReferentialIntegrity(tasksData, statusData));
  }

  if (errors.length === 0) {
    console.log(chalk.green('✅ Task Flow state is valid (schema + referential integrity).'));
    return 0;
  }

  console.log(chalk.red(`❌ Task Flow validation found ${errors.length} issue(s):`));
  for (const error of errors) {
    console.log(chalk.red('  • ') + error);
  }
  console.log(chalk.gray('\nFix .task-flow/.internal/*.json or re-run "task-flow: sync".'));
  return 1;
}

module.exports = { validateTaskFlow, checkReferentialIntegrity };
