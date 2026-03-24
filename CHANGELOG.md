# Changelog

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
