---
description: Collaboration rules (chunk-wise implementation, clarify ambiguities, guardrails for risky changes).
globs:
  - "**/*"
---

## How we work (chunk-wise)

- Implement work in **small, reviewable chunks**. Prefer completing one vertical slice at a time.
- When requirements are ambiguous, **ask 1–2 clarifying questions** before coding.
- Keep changes easy to learn from: readable names, small functions, and short comments where helpful.

## Guardrails (must ask first)

Ask for confirmation before doing any of the following:

- **Prisma schema changes**: editing `prisma/schema.prisma`, generating migrations, or changing relations/constraints.
- **Auth changes**: altering Better Auth configuration, session strategy, cookie settings, or role/permission logic.
- **Security-sensitive changes**: password handling, token storage, CORS, rate limiting, file uploads, admin-only routes.
- **Bulk refactors**: mass renames, moving many files, or changing app-wide architecture.
- **New non-trivial dependencies**: anything beyond common utilities; always ask for auth/security/form/state libs.

## Defaults unless you say otherwise

- **API-first**: new features should be exposed via `app/api/**` so they can be reused by a future mobile app.
- **Roles**: `admin` and `student`. Any admin-only capabilities must be server-enforced (never UI-only).
- **Dev-only admin seeding**: allowed, but clearly labeled dev-only and never enabled in production by default.

## Communication expectations

- Before coding: summarize what will be changed and which files will be touched.
- After coding: recap what changed and how to validate it (manual steps or a quick script).


