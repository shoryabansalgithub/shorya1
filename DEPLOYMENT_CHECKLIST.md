# Production Deployment Checklist (v1.0.0-rc1)

This checklist enforces the exact execution order required to deploy the Sprint 1 Frozen Architecture to a live production cluster safely.

## Phase 1: Environment & Secrets
- [ ] Verify `DATABASE_URL` targets a live MySQL 8.x+ instance.
- [ ] Verify `REDIS_URL` points to an enterprise Redis cluster.
- [ ] Verify `FRONTEND_URL` exactly matches the production CORS origin constraints.
- [ ] Ensure all `JWT_*` signing secrets have been securely rotated.

## Phase 2: Database Orchestration
- [ ] Halt all cron workers and BullMQ consumers in the existing environment.
- [ ] Execute `npx prisma migrate deploy` locally or via CI/CD.
  - *Must explicitly output:* `Applying migration 20260612000000_add_ledger_fk_and_triggers`
  - *Must explicitly output:* `Applying migration 20260612160645_add_drift_log`
- [ ] (Optional) If booting an entirely blank cluster, do **not** run raw SQL injection. `migrate deploy` inherently binds the triggers.

## Phase 3: Cluster Boot Sequence
- [ ] Execute `npm run build` cleanly.
- [ ] Boot the primary API HTTP nodes.
- [ ] Execute a simple `/health` or dummy `/api/inventory/products` GET request.
  - *Verification:* The container `stdout` logger must securely attach `correlationId: '...'` to the request trace.
- [ ] Start the background Worker Nodes (`BullMQ` processes).
  - *Verification:* `CronLockService` should log a successful Redis connection (and explicitly NOT throw the local execution fallback warning).
  - *Verification:* `OutboxRelayService` should begin polling MySQL immediately.

## Phase 4: Production Observability Validation
- [ ] Check production logging aggregator (e.g., Datadog, ELK, CloudWatch).
- [ ] Filter logs by `event: REDIS_STOCK_DRIFT` to ensure the Reconciliation Cron is actively healing.
- [ ] Fire a test POST request with dummy data. Observe `stdout` to ensure PII (`password`, `token`) is securely displaying as `[REDACTED]`.

**APPROVAL: Go-Live requires verification of all steps above.**
