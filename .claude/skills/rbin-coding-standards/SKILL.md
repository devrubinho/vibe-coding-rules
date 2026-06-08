---
name: rbin-coding-standards
description: Applies RBIN coding standards when implementing features. Use when the user invokes this skill, asks for coding standards, or is writing pages, components, services, use-cases, forms, or NestJS modules. Not auto-invoked — user or @mention required.
disable-model-invocation: true
paths: ["src/**", "app/**"]
---

# RBIN coding standards

**Invoke only** (`/rbin-coding-standards` or `@rbin-coding-standards`). Do not load the full standards doc unless this skill runs or the user asks.

## Steps

1. Apply the **checklist** in `.cursor/rules/coding_standards.mdc` (default for all implementation). Do **not** read the entire `.mdc` or full markdown into context if the checklist already covers the task.
2. Implement using checklist rules: `app/` thin, `features/`, `shared/`, service+use-case, RHF+zod+`Controller`, `cn()`, no `any`, no raw base UI.
3. **Only if ambiguous** (Nest gateways, DataHandler, route groups, naming edge case): open **one or two sections** of `.task-flow/guides/coding-standards-full.md` — never paste or load the whole file.
4. If `graphify-out/graph.json` exists, `graphify query` before choosing file paths for new code.
5. No explanatory code comments; use `dev-logs/` for non-obvious design notes.

## Token discipline

| Do | Don't |
|----|--------|
| Checklist + targeted full-doc sections | Load all 800+ lines of full reference |
| `@rbin-coding-standards` when coding | Rely on glob alone for complex architecture |

## Quick reference

[reference.md](reference.md) — checklist table + full-doc section index.
