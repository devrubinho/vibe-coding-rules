const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// ────────────────────────────────────────────────────────────────
// Deterministic renderer for .task-flow/tasks.status.md.
// Pure function of (tasks.json, status.json) — moves the mechanical
// markdown rendering off the LLM. Reproduces the shipped format
// byte-for-byte for the 0-subtask case and extends it with indented
// subtasks + manual handling per .cursor/rules/task-flow-sync.mdc.
// ────────────────────────────────────────────────────────────────

const BANNER = '<!-- ⚠️ WARNING: This file is automatically updated by AI. DO NOT edit manually. -->';

function statusEntry(statusData, taskId) {
  const tasks = (statusData && statusData.tasks) || {};
  return tasks[String(taskId)] || null;
}

function subState(entry, subId) {
  if (!entry || !entry.subtasks) return 'pending';
  return entry.subtasks[String(subId)] || 'pending';
}

function isTaskDone(task, entry) {
  if (entry && entry.status === 'done') return true;
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  if (subtasks.length === 0) return entry ? entry.status === 'done' : false;
  return subtasks.every((s) => subState(entry, s.id) === 'done');
}

function boxFor(state) {
  if (state === 'done') return '[x]';
  if (state === 'manual') return '[~]';
  return '[ ]';
}

// A task is parallel-ready when it isn't done yet and every task listed in
// its `dependsOn` is done. The first `maxSlots` ready tasks (in tasks.json
// order) get AI 1..N — this caps how many independent streams get flagged
// at once, matching how many AI runners can actually work in parallel.
function computeParallelSlots(tasks, statusData, maxSlots = 3) {
  const doneIds = new Set();
  for (const task of tasks) {
    if (isTaskDone(task, statusEntry(statusData, task.id))) doneIds.add(task.id);
  }

  const slots = new Map();
  let next = 1;
  for (const task of tasks) {
    if (next > maxSlots) break;
    if (doneIds.has(task.id)) continue;
    const deps = Array.isArray(task.dependsOn) ? task.dependsOn : [];
    const blocked = deps.some((depId) => depId !== task.id && !doneIds.has(depId));
    if (blocked) continue;
    slots.set(task.id, next);
    next += 1;
  }
  return slots;
}

function renderStatus(tasksData, statusData) {
  const tasks = (tasksData && Array.isArray(tasksData.tasks)) ? tasksData.tasks : [];
  const parallelSlots = computeParallelSlots(tasks, statusData);

  let completed = 0;
  let inProgress = 0;
  let remainingSubtasks = 0;
  let manualCount = 0;

  const summaryLines = [];
  const taskBlocks = [];

  for (const task of tasks) {
    const entry = statusEntry(statusData, task.id);
    const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
    const total = subtasks.length;

    let doneSubs = 0;
    let manualSubs = 0;
    for (const sub of subtasks) {
      const state = subState(entry, sub.id);
      if (state === 'done') doneSubs += 1;
      else remainingSubtasks += 1;
      if (state === 'manual') manualSubs += 1;
    }
    manualCount += manualSubs;

    const taskDone = isTaskDone(task, entry);
    const remaining = total - doneSubs;
    if (taskDone) completed += 1;
    else if ((entry && entry.status === 'in_progress') || doneSubs > 0 || manualSubs > 0) inProgress += 1;

    const slot = parallelSlots.get(task.id);
    const parallelBadge = slot ? ` — 🤖 AI ${slot} available` : '';
    summaryLines.push(
      `- ${taskDone ? '✅' : '⏳'} Task ${task.id}: ${task.title} (${remaining} remaining subtasks out of ${total})${parallelBadge}`
    );

    const taskBox = taskDone ? '[x]' : (manualSubs > 0 ? '[~]' : '[ ]');
    const block = [`- ${taskBox} ${task.title}`];
    for (const sub of subtasks) {
      const state = subState(entry, sub.id);
      let line = `  - ${boxFor(state)} ${sub.title}`;
      if (state === 'manual') {
        line += ` — manual: .task-flow/dev-logs/task-${task.id}.${sub.id}-manual.md`;
      }
      block.push(line);
    }
    taskBlocks.push(block.join('\n'));
  }

  const lines = [
    '# Task Status',
    '',
    BANNER,
    '',
    '## 📊 Summary',
    '',
    `- ✅ **Completed Tasks**: ${completed}`,
    `- ⏳ **Tasks in Progress**: ${inProgress}`,
    `- 📝 **Remaining Subtasks**: ${remainingSubtasks}`,
  ];
  if (manualCount > 0) {
    lines.push(`- 🖐️ **Manual (awaiting you)**: ${manualCount}`);
  }
  lines.push('', '**Tasks:**');
  lines.push(...summaryLines);
  lines.push('', '---', '', '## Tasks', '');
  lines.push(taskBlocks.join('\n\n'));

  return lines.join('\n') + '\n';
}

async function renderStatusFile(targetPath = process.cwd(), options = {}) {
  const internalDir = path.join(targetPath, '.task-flow/.internal');
  const tasksPath = path.join(internalDir, 'tasks.json');
  const statusPath = path.join(internalDir, 'status.json');

  if (!fs.existsSync(tasksPath) || !fs.existsSync(statusPath)) {
    process.stderr.write(
      chalk.red('❌ No .task-flow/.internal state found. Run "task-flow: sync" first.\n')
    );
    return 1;
  }

  let tasksData;
  let statusData;
  try {
    tasksData = await fs.readJSON(tasksPath);
    statusData = await fs.readJSON(statusPath);
  } catch (error) {
    process.stderr.write(chalk.red(`❌ Cannot read state: ${error.message}\n`));
    return 1;
  }

  const markdown = renderStatus(tasksData, statusData);

  if (options.stdout) {
    process.stdout.write(markdown);
    return 0;
  }

  const outPath = path.join(targetPath, '.task-flow/tasks.status.md');
  await fs.writeFile(outPath, markdown, 'utf8');
  console.log(chalk.green(`✅ Rendered ${outPath}`));
  return 0;
}

module.exports = { renderStatus, renderStatusFile, computeParallelSlots };
