#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_RULES_DIR = path.join(process.cwd(), '.cursor', 'rules');
const DEFAULT_MAX_ALWAYS_ON_KB = 5;

function parseArgs(argv) {
  const options = {
    rulesDir: process.env.RBIN_RULES_DIR || DEFAULT_RULES_DIR,
    maxAlwaysOnKb:
      process.env.RBIN_MAX_ALWAYS_ON_KB !== undefined
        ? Number(process.env.RBIN_MAX_ALWAYS_ON_KB)
        : DEFAULT_MAX_ALWAYS_ON_KB,
    json: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') {
      options.json = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--rules-dir' && argv[i + 1]) {
      options.rulesDir = path.resolve(argv[++i]);
    } else if (arg.startsWith('--rules-dir=')) {
      options.rulesDir = path.resolve(arg.slice('--rules-dir='.length));
    } else if (arg === '--max-kb' && argv[i + 1]) {
      options.maxAlwaysOnKb = Number(argv[++i]);
    } else if (arg.startsWith('--max-kb=')) {
      options.maxAlwaysOnKb = Number(arg.slice('--max-kb='.length));
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/measure-rule-bytes.js [options]

Measure .cursor/rules/*.mdc size for token budget checks (RBIN Task Flow).

Options:
  --rules-dir <path>   Rules directory (default: .cursor/rules)
  --max-kb <n>         Fail if always-on total exceeds n KB (default: ${DEFAULT_MAX_ALWAYS_ON_KB})
  --json               Machine-readable output
  -h, --help           Show this help

Environment:
  RBIN_RULES_DIR         Same as --rules-dir
  RBIN_MAX_ALWAYS_ON_KB  Same as --max-kb
`);
}

function parseAlwaysApply(content) {
  if (!content.startsWith('---')) {
    return false;
  }
  const end = content.indexOf('\n---', 3);
  if (end === -1) {
    return false;
  }
  const frontmatter = content.slice(3, end);
  const match = frontmatter.match(/alwaysApply:\s*(true|false)/i);
  if (!match) {
    return false;
  }
  return match[1].toLowerCase() === 'true';
}

function lineCount(content) {
  if (content.length === 0) {
    return 0;
  }
  return content.split('\n').length;
}

function measureRules(rulesDir) {
  if (!fs.existsSync(rulesDir)) {
    throw new Error(`Rules directory not found: ${rulesDir}`);
  }

  const files = fs
    .readdirSync(rulesDir)
    .filter((name) => name.endsWith('.mdc'))
    .sort();

  const rows = files.map((name) => {
    const filePath = path.join(rulesDir, name);
    const content = fs.readFileSync(filePath, 'utf8');
    const bytes = Buffer.byteLength(content, 'utf8');
    const lines = lineCount(content);
    const always = parseAlwaysApply(content);
    return { name, bytes, lines, always };
  });

  const alwaysOn = rows.filter((row) => row.always);
  const other = rows.filter((row) => !row.always);

  const sumBytes = (list) => list.reduce((acc, row) => acc + row.bytes, 0);

  return {
    rulesDir,
    rows,
    alwaysOn: {
      files: alwaysOn.length,
      bytes: sumBytes(alwaysOn),
      lines: alwaysOn.reduce((acc, row) => acc + row.lines, 0),
    },
    other: {
      files: other.length,
      bytes: sumBytes(other),
      lines: other.reduce((acc, row) => acc + row.lines, 0),
    },
    total: {
      files: rows.length,
      bytes: sumBytes(rows),
      lines: rows.reduce((acc, row) => acc + row.lines, 0),
    },
  };
}

function pad(value, width) {
  const text = String(value);
  return text.length >= width ? text : text + ' '.repeat(width - text.length);
}

function formatKb(bytes) {
  return (bytes / 1024).toFixed(2);
}

function printTable(report) {
  console.log(`\nRBIN Task Flow — rule bytes (${report.rulesDir})\n`);

  const colFile = Math.max(6, ...report.rows.map((row) => row.name.length));
  const header = `${pad('file', colFile)}  ${pad('bytes', 8)}  ${pad('lines', 6)}  always`;
  console.log(header);
  console.log('-'.repeat(header.length));

  for (const row of report.rows) {
    console.log(
      `${pad(row.name, colFile)}  ${pad(row.bytes, 8)}  ${pad(row.lines, 6)}  ${row.always ? 'yes' : 'no'}`
    );
  }

  console.log('');
  console.log(
    `Always-on: ${report.alwaysOn.files} file(s), ${report.alwaysOn.bytes} bytes (${formatKb(report.alwaysOn.bytes)} KB), ~${Math.round(report.alwaysOn.bytes / 4)} tokens est.`
  );
  console.log(
    `Other:     ${report.other.files} file(s), ${report.other.bytes} bytes (${formatKb(report.other.bytes)} KB)`
  );
  console.log(
    `Total:     ${report.total.files} file(s), ${report.total.bytes} bytes (${formatKb(report.total.bytes)} KB)`
  );
  console.log('');
}

function main() {
  const options = parseArgs(process.argv);

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (Number.isNaN(options.maxAlwaysOnKb) || options.maxAlwaysOnKb < 0) {
    console.error('Invalid --max-kb / RBIN_MAX_ALWAYS_ON_KB (must be a non-negative number).');
    process.exit(1);
  }

  let report;
  try {
    report = measureRules(options.rulesDir);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const alwaysOnKb = report.alwaysOn.bytes / 1024;
  const withinBudget = alwaysOnKb <= options.maxAlwaysOnKb;

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          ...report,
          maxAlwaysOnKb: options.maxAlwaysOnKb,
          alwaysOnKb,
          withinBudget,
        },
        null,
        2
      )
    );
  } else {
    printTable(report);
    if (withinBudget) {
      console.log(
        `✅ Always-on budget OK: ${formatKb(report.alwaysOn.bytes)} KB ≤ ${options.maxAlwaysOnKb} KB`
      );
    } else {
      console.error(
        `❌ Always-on budget exceeded: ${formatKb(report.alwaysOn.bytes)} KB > ${options.maxAlwaysOnKb} KB`
      );
    }
  }

  process.exit(withinBudget ? 0 : 1);
}

main();
