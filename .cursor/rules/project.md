---
description: Project-wide engineering rules for nec-quiz (Next.js + Better Auth + Prisma + shadcn/ui).
globs:
  - "**/*"
---

## Stack + architecture conventions

- **Next.js**: App Router. Prefer **route handlers** (`app/api/**/route.ts`) for all mutations and most reads.
- **No Server Actions by default**: do not introduce Server Actions unless explicitly requested.
- **Auth**: Better Auth. Treat session handling and user identity as security-critical.
- **DB**: Prisma + Postgres.
- **UI**: shadcn/ui components + Tailwind. Prefer composing existing `components/ui/*` primitives.
- **TypeScript**: strict mode is on; keep types explicit at module boundaries (API, DB, auth).

## Dependency policy (balanced)

- You may add **common** client data-fetching libraries when justified:
  - `axios`
  - `@tanstack/react-query`
- Ask before adding other new libraries, especially auth/security, state management, form libs, or UI kits.

## Code style + organization

- **Reusability**: prefer small, reusable components and utilities over large monolith files.
- **Naming**:
  - Components: `PascalCase.tsx`
  - Utilities: `kebab-case.ts` or `camelCase.ts` (be consistent within a folder)
  - API routes: `app/api/<resource>/route.ts`
- **Folder intent**:
  - `lib/`: shared infrastructure (prisma, auth, server utilities)
  - `components/`: reusable UI components
  - `app/`: routing + page-level composition
- **Error handling**:
  - API routes must return consistent JSON error shapes.
  - Do not leak sensitive details (stack traces, secrets, raw SQL) to clients.
- **Environment variables**:
  - Document required env vars in `README.md` (or a dedicated section) when introducing new ones.
  - Never hardcode secrets; dev-only credentials must be clearly marked as dev-only.

## Data/API patterns

- **API responses**: prefer a predictable envelope:
  - Success: `{ ok: true, data: ... }`
  - Failure: `{ ok: false, error: { code, message } }`
- **Pagination/filtering**: design endpoints so mobile clients can use them efficiently.
- **Validation**: validate request bodies/params at the API boundary before DB writes.
