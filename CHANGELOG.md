# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.0-rc1] - 2026-06-12

### Added
- **Ledger Immutability Triggers:** Added MySQL triggers `prevent_ledger_update` and `prevent_ledger_delete` natively within Prisma migrations to enforce zero-mutation double-entry accounting.
- **Foreign Key Enforcement:** Explicitly coupled `LedgerTransaction` and `OutboxEvent` to `Invoice` to prevent orphaned financial records.
- **Composite Indexes:** Added heavy read-optimization composite indexes (`[shopId, createdAt]`, `[idempotencyKey, shopId]`) to support strict multi-tenant data isolation.
- **Transactional Outbox Engine:** Built `OutboxEvent` generation tightly coupled inside `BillingService`'s Prisma transaction.
- **BullMQ Relay:** Developed `OutboxRelayService` Cron that sweeps pending events via `SELECT ... FOR UPDATE SKIP LOCKED` into BullMQ.
- **Consumer Idempotency:** Implemented `SystemEventsProcessor` executing dual-checks against MySQL `AuditLog` via deterministic `opts.jobId` mappings to ensure exactly-once processing.
- **Dead Letter Queue (DLQ):** Hardened failure taxonomy; transient failures backoff, while permanent data errors throw `UnrecoverableError` skipping to the DLQ immediately.
- **Redlock Distributed Cron Locking:** Added `CronLockService` over `ioredis` to coordinate single-instance Cron executions across a multi-pod cluster.
- **Inventory Reconciliation:** Built `InventoryReconService` to routinely auto-sync MySQL baseline against Redis optimistic locks.
- **Inventory Drift Logging:** Intercepted Redis desync events, pushing them natively to the new `InventoryDriftLog` table.
- **Frontend Idempotency:** Engineered `useIdempotencyKey.ts` using `sessionStorage` and `uuidv4` mapping to guarantee multi-tab and network-drop replay safety without duplicate billing.
- **Correlation ID Middleware:** Integrated `node:async_hooks` to enforce request-level tracing via `x-correlation-id` without manually threading parameters.
- **CorrelationLogger:** Extended native NestJS `ConsoleLogger` to implicitly dump the isolated ambient `correlationId` into every backend `stdout` string.
- **PII Redaction Engine:** Implemented recursive logger scrubbing intercepting and destroying JSON keys containing `password`, `token`, `cookie`, `payment`, or `secret`.

### Changed
- Refactored `BillingService` to absorb all double-entry write events explicitly into its primary `Prisma.$transaction` scope.
- Hardened Redis optimistic concurrency to gracefully fail-open to Prisma database checks during cache outages.
- Shift locking refactored to utilize Pessimistic `SELECT FOR SHARE` MySQL commands.

### Fixed
- Stabilized `test/billing-concurrency.spec.ts` isolation by dynamically seeding unique user and shop strings.
- Removed arbitrary `sleep` and non-deterministic logic from invoice transaction boundaries.
