const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { parseTaskIds } = require('./utils');

async function estimateTask(taskIdsInput, targetPath = process.cwd()) {
  const tasksPath = path.join(targetPath, '.task-flow/.internal/tasks.json');

  if (!fs.existsSync(tasksPath)) {
    console.log(chalk.red('❌ Tasks file not found. Run "task-flow: sync" first.'));
    return;
  }

  try {
    const tasksData = await fs.readJSON(tasksPath);
    const taskIds = parseTaskIds(taskIdsInput, tasksData.tasks);
    
    if (taskIds.length === 0) {
      console.log(chalk.red('❌ No valid task IDs provided.'));
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const taskId of taskIds) {
      const task = tasksData.tasks.find(t => t.id === taskId);

      if (!task) {
        console.log(chalk.red(`❌ Task ${taskId} not found.`));
        errorCount++;
        continue;
      }

      const subtaskCount = task.subtasks ? task.subtasks.length : 0;

      if (subtaskCount === 0) {
        console.log(chalk.yellow(`⚠️  Task ${taskId} has no subtasks. Cannot estimate.`));
        errorCount++;
        continue;
      }

      const analysis = analyzeTaskComplexity(task);
      const estimates = calculateEstimates(analysis);

      if (taskIds.length > 1) {
        console.log('\n' + chalk.cyan('═'.repeat(70)));
      } else {
        console.log('\n' + chalk.cyan('═'.repeat(70)));
      }
      console.log(chalk.magenta('📊 Task Estimation Report'));
      console.log(chalk.cyan('═'.repeat(70)) + '\n');

      console.log(chalk.blue.bold('Task:'), chalk.yellow(`#${taskId} - ${task.title}\n`));
      console.log(chalk.blue(`Complexity: ${chalk.yellow(analysis.level)} (${subtaskCount} subtasks)\n`));

      console.log(chalk.cyan('─'.repeat(70)));
      console.log(chalk.magenta.bold('Time Estimates by Experience Level:\n'));

      console.log(chalk.gray(`Signals: ${analysis.signals.join(', ')}\n`));

      const juniorDays = Math.ceil(estimates.junior.upper / 8);
      const midDays = Math.ceil(estimates.mid.upper / 8);
      const seniorDays = Math.ceil(estimates.senior.upper / 8);

      console.log(chalk.gray('👶 Junior Developer (0-2 years):'));
      console.log(chalk.white('   Hours:'), chalk.yellow(`${estimates.junior.lower}-${estimates.junior.upper} hours`));
      console.log(chalk.white('   Days: '), chalk.yellow(`~${juniorDays} business day(s)`));
      console.log('');

      console.log(chalk.gray('👨‍💼 Intermediate (3-5 years):'));
      console.log(chalk.white('   Hours:'), chalk.yellow(`${estimates.mid.lower}-${estimates.mid.upper} hours`));
      console.log(chalk.white('   Days: '), chalk.yellow(`~${midDays} business day(s)`));
      console.log('');

      console.log(chalk.gray('👴 Senior Developer (6+ years):'));
      console.log(chalk.white('   Hours:'), chalk.yellow(`${estimates.senior.lower}-${estimates.senior.upper} hours`));
      console.log(chalk.white('   Days: '), chalk.yellow(`~${seniorDays} business day(s)`));
      console.log('');

      console.log(chalk.cyan('─'.repeat(70)));
      console.log(chalk.magenta.bold('Recommendation for Management:\n'));
      console.log(chalk.white('   Recommended estimate:'), chalk.yellow(`${estimates.mid.lower}-${estimates.mid.upper} hours`), chalk.gray('(3-5 years baseline)'));
      console.log(chalk.white('   Buffer recommended:'), chalk.yellow(`+20%`), chalk.gray('for unexpected issues'));
      console.log(chalk.white('   Total estimate:'), chalk.yellow(`${Math.round(estimates.mid.upper * 1.2)} hours`), chalk.gray(`(~${Math.ceil(estimates.mid.upper * 1.2 / 8)} business days)`));
      console.log('');

      successCount++;
    }

    if (taskIds.length > 1) {
      console.log(chalk.cyan(`\n📊 Estimated ${successCount} task(s), ${errorCount} error(s)`));
    }

  } catch (error) {
    console.error(chalk.red('Error reading tasks:'), error.message);
  }
}

function calculateEstimates(analysis) {
  const { subtaskCount, level, riskMultiplier } = analysis;
  const levelRanges = {
    low: { lower: 1.5, upper: 2.5 },
    medium: { lower: 2.5, upper: 4 },
    high: { lower: 4, upper: 6.5 }
  };
  const baseRange = levelRanges[level] || levelRanges.medium;
  const baseLower = subtaskCount * baseRange.lower * riskMultiplier;
  const baseUpper = subtaskCount * baseRange.upper * riskMultiplier;

  return {
    junior: {
      lower: Math.round(baseLower * 1.5),
      upper: Math.round(baseUpper * 1.5)
    },
    mid: {
      lower: baseLower,
      upper: baseUpper
    },
    senior: {
      lower: Math.round(baseLower * 0.7),
      upper: Math.round(baseUpper * 0.7)
    }
  };
}

function analyzeTaskComplexity(task) {
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  const subtaskCount = subtasks.length;
  const content = buildTaskContent(task, subtasks);
  const keywordScores = scoreKeywords(content);

  let score = 0;

  if (subtaskCount <= 2) score += 1;
  else if (subtaskCount <= 5) score += 2;
  else score += 3;

  score += keywordScores.complexity;

  let level = 'medium';
  if (score <= 2) level = 'low';
  else if (score >= 6) level = 'high';

  const riskMultiplier = Math.max(1, 1 + keywordScores.risk * 0.08 + keywordScores.scope * 0.06);
  const signals = [
    `${subtaskCount} subtasks`,
    `${level} task level`
  ];

  if (keywordScores.scope > 0) signals.push('multi-file or integration indicators');
  if (keywordScores.risk > 0) signals.push('risk or validation indicators');
  if (keywordScores.architecture > 0) signals.push('architecture/refactor indicators');
  if (signals.length === 2) signals.push('no elevated complexity indicators');

  return {
    subtaskCount,
    level,
    riskMultiplier,
    signals
  };
}

function buildTaskContent(task, subtasks) {
  const parts = [task.title, task.description];

  for (const subtask of subtasks) {
    if (typeof subtask === 'string') {
      parts.push(subtask);
      continue;
    }

    if (subtask && typeof subtask === 'object') {
      parts.push(subtask.title, subtask.description);
    }
  }

  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function scoreKeywords(content) {
  const architectureKeywords = [
    'architecture', 'arquitetura', 'refactor', 'refator', 'migrate', 'migra',
    'core', 'infra', 'foundation', 'sdk', 'abstraction'
  ];
  const scopeKeywords = [
    'integration', 'integracao', 'integrar', 'api', 'database', 'banco',
    'auth', 'oauth', 'deploy', 'pipeline', 'webhook', 'service', 'provider'
  ];
  const riskKeywords = [
    'critical', 'critico', 'security', 'seguranca', 'performance', 'perf',
    'bug', 'fix', 'regression', 'migration', 'compliance', 'billing', 'payment'
  ];

  const architecture = countMatches(content, architectureKeywords);
  const scope = countMatches(content, scopeKeywords);
  const risk = countMatches(content, riskKeywords);

  return {
    architecture,
    scope,
    risk,
    complexity: architecture * 2 + scope + risk
  };
}

function countMatches(content, keywords) {
  return keywords.reduce((total, keyword) => total + (content.includes(keyword) ? 1 : 0), 0);
}

module.exports = { estimateTask };
