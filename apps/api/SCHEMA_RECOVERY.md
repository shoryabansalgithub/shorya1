# Schema deployment and recovery

The Prisma schema is represented by one baseline migration:
`prisma/migrations/20260717185000_schema_baseline`.

## New environments

1. Create an empty MySQL database.
2. Set `DATABASE_URL` for that database.
3. Run `npm exec prisma migrate deploy --schema=prisma/schema.prisma` from
   `apps/api`.
4. Run `npm exec prisma generate --schema=prisma/schema.prisma` during the
   build or release process.

Do not use `prisma db push` in a production deployment. It bypasses the
migration history and can hide schema drift.

## Existing environments created before this baseline

The old migration chain did not reproduce the checked-in Prisma schema. Do
not point the baseline migration at an existing database with business data:
it is a new-schema bootstrap, not a data migration.

Use this recovery sequence instead:

1. Take and verify a consistent MySQL backup.
2. Provision a new empty database.
3. Apply the baseline migration to the new database.
4. Import data through an explicit, reviewed ETL script that maps old columns
   and validates row counts and foreign keys.
5. Switch the application only after smoke tests pass.

For a disposable local development database only, `prisma migrate reset` is
appropriate. Never run it against a shared or production database.
