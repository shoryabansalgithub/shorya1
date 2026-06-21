# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.0-rc2] - 2026-06-20

### Fixed (Production Hardening)
- **Database Integrity:** Removed `relationMode = "prisma"` from schema. MySQL now enforces all foreign keys natively.
- **Migration Completeness:** Wrote valid `migration.sql` for three previously empty migration directories (`add_stock_constraints`, `add_ledger_fk_and_triggers`, `add_drift_log`). Fresh `prisma migrate deploy` now succeeds.
- **Ledger Immutability Triggers:** Moved `prevent_ledger_update` and `prevent_ledger_delete` triggers into Prisma migration SQL (`20260612000000_add_ledger_fk_and_triggers/migration.sql`). No manual trigger setup required.
- **Ledger Accounting:** Added `LedgerAccount` enum (`CASH`, `ACCOUNTS_RECEIVABLE`, `SALES_REVENUE`, etc.) and `LedgerEntryType` enum. Ledger entries now use typed `account` field instead of description strings. `balanceAfter` is computed from actual running balance, not hardcoded to 0.
- **CacheModule:** Wired `CacheModule` to Redis via `cache-manager-redis-yet` with `REDIS_URL` configuration. Falls back to in-memory for local development without Redis.
- **Security — Billing RBAC:** Added `@Roles(ADMIN, SUPER_ADMIN, MANAGER, CASHIER)` and `@UseGuards(RolesGuard)` to `BillingController`. VIEWER role is now blocked from creating invoices.
- **Security — WebSocket Auth:** Added JWT verification to `InventoryGateway`. Unauthenticated connections are rejected. Shop membership is validated.
- **CORS:** Added `x-correlation-id` to allowed headers for browser-to-API distributed tracing.
- **PII Redaction:** Fixed `CorrelationLogger.redact()` to handle arrays (previously skipped). Added `authorization` and `creditcard` to sensitive keys.
- **Prisma Logging:** Disabled SQL query logging in production (`NODE_ENV=production`) to eliminate performance overhead and log noise.
- **Worker:** Removed duplicate single-entry ledger creation from `SystemEventsProcessor` (BillingService already creates proper double-entry inside the transaction). Fixed `SYSTEM_WORKER` userId to use actual userId from job payload.
- **Schema:** Made `idempotencyKey` non-nullable on Invoice model.
- **Documentation:** Corrected false claims in PRODUCTION_FREEZE.md, CHANGELOG.md, and DEPLOYMENT_CHECKLIST.md.

## [v1.0.0-rc1] - 2026-06-12

### Added
- **Transactional Outbox Engine:** `OutboxEvent` created inside `BillingService`'s Prisma transaction. `OutboxRelayService` sweeps pending events via `SELECT FOR UPDATE SKIP LOCKED` into BullMQ.
- **Consumer Idempotency:** `SystemEventsProcessor` checks `AuditLog` for prior processing before committing, ensuring exactly-once processing.
- **Dead Letter Queue (DLQ):** Transient failures use exponential backoff; permanent errors throw `UnrecoverableError` to skip retries.
- **Redlock Distributed Cron Locking:** `CronLockService` uses `ioredis` Redlock to coordinate single-instance cron execution across pods.
- **Inventory Reconciliation:** `InventoryReconService` auto-syncs MySQL baseline against Redis every 5 minutes with batch processing (1000 products/batch).
- **Inventory Drift Logging:** Detects Redis/MySQL desync events and logs them to `InventoryDriftLog` table with `DETECTED`/`REPAIRED`/`FAILED` status tracking.
- **Frontend Idempotency:** `useIdempotencyKey.ts` uses `sessionStorage` and UUID v4 for multi-tab safety. Key cleared only on success.
- **Correlation ID Middleware:** `AsyncLocalStorage`-based request tracing via `x-correlation-id` header.
- **CorrelationLogger:** Extends NestJS `ConsoleLogger` with ambient `correlationId` injection and PII redaction.

### Changed
- Refactored `BillingService` to execute all operations (stock, invoice, items, inventory logs, shift, udhar, audit, outbox, ledger) atomically in one `$transaction`.
- Redis operates as graceful fallback — application continues on MySQL-only path during Redis outages.

### Fixed
- Stabilized `billing-concurrency.spec.ts` with dynamically seeded unique test data.
