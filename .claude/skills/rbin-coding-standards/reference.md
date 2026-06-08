# Coding standards — quick reference

## Documents

| Doc | Path | When |
|-----|------|------|
| **Checklist** (default) | `.cursor/rules/coding_standards.mdc` | Every implementation; glob on `src/**`, `app/**` in Cursor |
| **Full reference** (sections only) | `.task-flow/guides/coding-standards-full.md` | Nest/Prisma detail, long examples, ESLint table, DataHandler, providers |

## Checklist essentials

| Area | Rule |
|------|------|
| Routes | `app/` only imports feature page/screen |
| Pages | Orchestrators; short; compose components |
| API | use-case (pure) + service (react-query) |
| Forms | zod schema + `Controller` + `zodResolver` |
| Classes | Always `cn()` |
| Names | kebab-case + suffix (`.page.tsx`, `.use-case.ts`, …) |
| Shared | Flat folders under `shared/`; no subfolders (web/mobile) |
| Git | Never commit for user — `@rbin-git` suggests only |

## Full doc — open by section (not whole file)

| Section in `coding-standards-full.md` | Use when |
|---------------------------------------|----------|
| Project Structure | Unsure where a file belongs |
| Tech Stack / ESLint | Stack or `@rbinflow/eslint-config` setup |
| app/ — Routes Only | Next route groups, Nest controllers |
| features/ — Feature Organization | Use-cases, repositories, page naming |
| shared/ | Shared folder layout |
| DataHandler | Loading/error UI pattern |
| Feature `platform` | AppProviders, shell |
| Providers Composition | Provider nesting |
| cn() | Class merging edge cases |
| React Query | Service + use-case examples |
| Forms | InputText / Controller examples |
| File Naming Conventions | Suffix disputes |
| TypeScript Types | `.api.type.ts` vs `.type.ts` |
| Context / Auth Hook | Auth provider pattern |
| Testing | E2E placement |
| Critical Rules | Final verification |
