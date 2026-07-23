# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Add durable project-specific notes here as they are discovered through real work.

## Build and run sharp edges (apps/api)

- The entrypoint compiles to `dist/src/main.js`, not `dist/main.js` (root-level
  `check-db.ts` / `setup-triggers.ts` widen tsc's rootDir). `start:prod` must be
  `node dist/src/main`.
- Boot failures are surfaced via `abortOnError: false` + a `bootstrap().catch`
  in `src/main.ts` that writes to stderr. `bufferLogs: true` otherwise swallows
  pre-logger crashes into a silent `exit(1)` (and `process.exit` truncates
  piped/redirected `console.error`, so use `fs.writeSync(2, ...)` when
  diagnosing a startup crash directly).
- Config is validated by `class-validator` on typed domain classes in
  `src/config/domains/*` (see `EnterpriseConfigModule`), NOT Joi. All domains
  are `useFactory`-provided; the `@ConfigDomain` metadata lives on the injection
  token, which `ConfigurationRegistryService` must read (not `wrapper.metatype`).
- Nest's `ConfigModule` loads `.env.local`, `.env.<NODE_ENV>`, then `.env` (see
  `EnterpriseConfigModule`). Committed `.env.production`/`.env.development`/
  `.env.test` are placeholder templates the owner deliberately tracks; the root
  `.gitignore` documents this ("ALWAYS COMMITTED") and is marked do-not-modify.
- Prisma migrations under `apps/api/prisma/migrations` have drifted from
  `schema.prisma` (e.g. `User.tokenVersion`, `Shop.status` missing from
  migrations). For a schema-accurate local DB use `prisma db push` on a fresh
  database, not `migrate deploy`. Always run `npx prisma generate` after
  changing `schema.prisma` or switching branches.
- `Shop.ownerId` and `User.shopId` are mutually-required foreign keys; creating
  the pair needs FK checks deferred within the transaction (MySQL). See
  `AuthBypassService.provisionSystemUser`.

## Auth bypass flag

- `AUTH_DISABLED` (API) + `NEXT_PUBLIC_AUTH_DISABLED` (web, build-time) disable
  authentication for demos/dev. OFF by default; see `AuthBypassService`
  (`apps/api/src/auth/auth-bypass.service.ts`), `AuthConfig`
  (`apps/api/src/config/domains/auth.config.ts`), and `apps/web/src/lib/auth-bypass.ts`.
  When on, every request runs as a provisioned system user
  (`system@dukaanai.local`, OWNER, own shop). Real auth code stays intact - the
  flag gates access, it never accepts unverified identity from a request.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
