#!/usr/bin/env node
'use strict';

// ────────────────────────────────────────────────────────────────
// RBIN Task Flow — PostToolUse hook: remind to sync.
// When the agent edits .task-flow/tasks.input.txt, surface an advisory
// note to run /task-flow-sync. Never blocks (always exit 0); sync needs
// model judgment, so this only reminds — it does not auto-run sync.
// ────────────────────────────────────────────────────────────────

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

function isTasksInput(filePath) {
  if (!filePath) return false;
  const normalized = String(filePath).replace(/\\/g, '/');
  return /(^|\/)\.task-flow\/tasks\.input\.txt$/.test(normalized);
}

async function main() {
  const raw = await readStdin();

  let payload = {};
  try {
    payload = JSON.parse(raw || '{}');
  } catch (error) {
    process.exit(0);
  }

  const filePath = payload.tool_input && payload.tool_input.file_path;
  if (!isTasksInput(filePath)) process.exit(0);

  const message =
    '📋 tasks.input.txt changed — run /task-flow-sync to update tasks.json/status.json ' +
    '(adds new, removes deleted, updates modified, preserves status).';

  try {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext: message,
        },
      }) + '\n'
    );
  } catch (error) {
    process.stderr.write(message + '\n');
  }

  process.exit(0); // advisory only — never block
}

main();
