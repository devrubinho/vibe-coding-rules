#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(__dirname, '..', '.cursor', 'rules');

const PATCHES = {
  'task_work.mdc': `---
description: Executes RBIN Task Flow subtasks (task-flow run, run next X, run task N, work on next subtasks). Prefer @task-flow-run skill when available.
alwaysApply: false
---`,
  'task-flow-sync.mdc': `---
description: Full task-flow sync — reconciles tasks.input.txt with tasks.json, status.json, and tasks.status.md. Use for task-flow sync. Prefer @task-flow-sync skill.
globs: .task-flow/**
alwaysApply: false
---`,
  'task_from_contexts.mdc': `---
description: Drafts tasks in tasks.input.txt from .task-flow/contexts/ files. Use for task-flow from contexts or import contexts.
alwaysApply: false
---`,
  'task_generation.mdc': `---
description: Subtask generation templates for new tasks. For sync use task-flow-sync.mdc or @task-flow-sync.
globs: .task-flow/**
alwaysApply: false
---`,
  'task_execution.mdc': `---
description: RBIN Task Flow command reference and workflow principles. Use when user mentions task-flow commands or task flow setup.
alwaysApply: false
---`,
  'task_status.mdc': `---
description: Shows RBIN Task Flow progress from tasks.status.md. Use for task-flow status or show task status.
globs: .task-flow/**
alwaysApply: false
---`,
  'task_audit.mdc': `---
description: Audits full codebase against coding standards for task-flow audit. Non-destructive; user chooses improvements.
alwaysApply: false
---`,
  'task_estimate.mdc': `---
description: Estimates hours for task-flow estimate X. Average developer pace, no AI acceleration.
alwaysApply: false
---`,
  'task_report.mdc': `---
description: Generates task-flow implementation report for completed task X. Use for task-flow report.
alwaysApply: false
---`,
  'coding_standards.mdc': `---
description: RBIN coding standards for TypeScript React Next.js NestJS. Use when implementing features or editing src/ or app/ code.
globs: src/**,app/**
alwaysApply: false
---`,
  'code_comments.mdc': `---
description: No explanatory code comments; use dev-logs. Applies when editing TypeScript or JavaScript source files.
globs: **/*.{ts,tsx,js,jsx}
alwaysApply: false
---`,
  'cursor_rules.mdc': `---
globs: .cursor/rules/**
alwaysApply: false
---`,
  'self_improve.mdc': `---
alwaysApply: false
---`,
};

function replaceFrontmatter(filePath, newFrontmatter) {
  const content = fs.readFileSync(filePath, 'utf8');
  const end = content.indexOf('\n---\n');
  if (end === -1) return false;
  const body = content.slice(end + 5);
  fs.writeFileSync(filePath, newFrontmatter + '\n' + body);
  return true;
}

for (const [file, fm] of Object.entries(PATCHES)) {
  const p = path.join(RULES_DIR, file);
  if (!fs.existsSync(p)) {
    console.warn('skip', file);
    continue;
  }
  replaceFrontmatter(p, fm);
  console.log('patched', file);
}
