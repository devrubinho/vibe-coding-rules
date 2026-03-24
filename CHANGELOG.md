# Changelog

## [Unreleased]

## [1.19.3] - 2026-03-24

### Changed

- **task_generate_flow.mdc** - Replaced legacy `Codex` recommendation with current `GPT-5.x` family guidance for flow generation.
- **task_generate_flow.mdc** - Model priority and effort are now defined from task context, not fixed ordering or subtask count.
- **task_estimate.mdc / lib/estimate.js** - Estimation now uses task-level heuristics, risk, and scope signals instead of relying only on subtask totals.
- **lib/install.js / install.sh** - `rbin-task-flow init` now preserves existing `.task-flow/tasks.input.txt`, `.task-flow/tasks.status.md`, and `.task-flow/tasks.flow.md` while still overwriting the rest of the template.

## [1.19.2] - 2025-03-07

### Fixed

- **task_generate_flow.mdc** - New tasks.flow.md format: direct blocks per task, 3 models (Codex, Composer, Claude) with version and effort per task, Opus prohibited (only Haiku or Sonnet), simpler structure.

## [1.19.1] - 2025-03-07

### Fixed

- **coding_standards.mdc** - ESLint section: document @rbinflow/eslint-config only, no extra plugins. Add table with all available configs (node, node-with-semi, react, next, expo).

## [1.19.0] - 2025-03-07

### Added

- **tasks.flow.md** - New file created on `rbin-task-flow init` for dependencies, estimated hours, and AI model recommendations
- **task-flow: generate flow** - Command to populate tasks.flow.md with:
  - Task dependencies (for parallelization)
  - Estimated development hours (for billing)
  - AI model recommendations (Codex, Composer, Claude) with effort levels
- Web search for current AI model versions during flow generation
- Keywords: `generate-flow`, `tasks-flow`

### Changed

- `task-flow: sync` explicitly does not update tasks.flow.md (only `generate flow` populates it)
- CLAUDE.md, README, and docs updated with generate flow command
