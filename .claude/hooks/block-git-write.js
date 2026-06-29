#!/usr/bin/env node
'use strict';

// ────────────────────────────────────────────────────────────────
// RBIN Task Flow — PreToolUse hook: block git write commands.
// Reads the Bash tool payload on stdin; blocks (exit 2) when the
// command runs a git write verb in any segment. Read-only git passes.
// ────────────────────────────────────────────────────────────────

const WRITE_VERBS = new Set([
  'add', 'commit', 'push', 'pull', 'merge', 'checkout', 'reset', 'rebase',
]);

// git global options that consume the following token as their value
// (so the real subcommand is not mistaken for the option's argument).
const OPTS_WITH_VALUE = new Set([
  '-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path',
]);

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

function splitSegments(command) {
  // Break on shell command separators so each `git ...` is checked
  // independently (handles `git add . && git commit -m x`).
  return command.split(/(?:&&|\|\||[;\n|&])+/);
}

function cleanToken(token) {
  // Strip leading subshell / command-substitution / grouping punctuation
  // so `(git`, `$(git`, `{git` still resolve to the `git` token.
  return token.replace(/^\$\(/, '').replace(/^[!(){}`]+/, '');
}

function gitWriteVerbInSegment(segment) {
  const tokens = segment
    .trim()
    .split(/\s+/)
    .map(cleanToken)
    .filter(Boolean);

  for (let i = 0; i < tokens.length; i++) {
    // A `git` token anywhere also covers proxy/env-prefix forms:
    // `rtk git commit`, `FOO=bar git commit`, `rtk proxy git commit`.
    if (tokens[i] !== 'git') continue;

    let j = i + 1;
    while (j < tokens.length) {
      const arg = tokens[j];
      if (arg.includes('=') && OPTS_WITH_VALUE.has(arg.split('=')[0])) {
        j += 1; // --git-dir=/path
        continue;
      }
      if (OPTS_WITH_VALUE.has(arg)) {
        j += 2; // -C <path> / -c <key=val>
        continue;
      }
      if (arg.startsWith('-')) {
        j += 1; // other global flags: --no-pager, -p, --paginate, ...
        continue;
      }
      break;
    }

    const subcommand = tokens[j];
    if (subcommand && WRITE_VERBS.has(subcommand)) {
      return subcommand;
    }
  }

  return null;
}

async function main() {
  const raw = await readStdin();

  let payload = {};
  try {
    payload = JSON.parse(raw || '{}');
  } catch (error) {
    process.exit(0); // not our payload — never block on parse failure
  }

  const command = (payload.tool_input && payload.tool_input.command) || '';
  if (!command) process.exit(0);

  let verb = null;
  for (const segment of splitSegments(command)) {
    verb = gitWriteVerbInSegment(segment);
    if (verb) break;
  }
  if (!verb) process.exit(0);

  const reason =
    `Blocked by RBIN Task Flow: "git ${verb}" is a git write command and the agent ` +
    `never runs git add/commit/push/pull/merge/checkout/reset/rebase in this project. ` +
    `Use /rbin-git for a Conventional Commit suggestion, then run git yourself.`;

  try {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: reason,
        },
      }) + '\n'
    );
  } catch (error) {
    // fall through to exit 2 below
  }

  process.stderr.write(reason + '\n');
  process.exit(2); // blocking signal for PreToolUse
}

main();
