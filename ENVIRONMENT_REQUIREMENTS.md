# Environment Requirements

To securely operate `v1.0.0-rc1`, the hosting infrastructure must fulfill the following rigid specifications.

## 1. Relational Database
**Engine:** MySQL 8.0+
- **Privileges:** The `DATABASE_URL` user must possess explicit privileges to `CREATE TRIGGER` and `DROP TRIGGER`. Prisma migrations heavily rely on this for Ledger Immutability guarantees.
- **Connection Limits:** Set `connection_limit` carefully inside the Prisma connection string to prevent `OutboxRelayService` and API scaling from starving the pool.
- **Isolation Level:** `ReadCommitted` or stronger. (Prisma explicitly manages this natively inside `$transaction` blocks).

## 2. In-Memory Cache & Broker
**Engine:** Redis 6.2+
- **High Availability:** A clustered or sentinel architecture is recommended but not mandatory. The API operates gracefully in "degraded mode" if Redis goes offline, utilizing native MySQL locks.
- **Persistence:** Volatile. No AOF/RDB configuration is strictly necessary. The `InventoryReconService` automatically rewrites dropped states from MySQL.
- **Eviction Policy:** `allkeys-lru` or `volatile-lru` is acceptable.

## 3. Node.js Runtime
**Engine:** Node.js v18.17.x or v20.x
- **Async Hooks:** Deeply utilizes `node:async_hooks` via `AsyncLocalStorage` for `Correlation ID` distributed tracing. V8 engine stability on Node 18+ is required.
- **Memory Boundaries:** Set standard `--max-old-space-size` depending on container capacity to ensure BullMQ workers can process spikes.

## 4. Environment Variables Map
| Variable | Required? | Usage Specification |
| :--- | :--- | :--- |
| `DATABASE_URL` | **YES** | MySQL connection string. Must target a database schema user with Trigger permissions. |
| `PORT` | NO | Express server binding. Defaults to `3001`. |
| `FRONTEND_URL` | **YES** | Comma-separated list of CORS-approved domains. |
| `REDIS_URL` | **YES in production** | BullMQ connection string. Production startup rejects a missing or malformed value; development may run without Redis for local API work, but queued work is unavailable. |
| `NODE_ENV` | NO | Use `production` to disable Swagger and optimize performance mappings. |
| `JWT_SECRET` | **YES** | Signature key for Bearer tokens. |
| `JWT_EXPIRES_IN` | **YES** | Default access-token validity. |
| `JWT_REFRESH_SECRET` | **YES** | Signature key for refresh-rotation tokens. |
| `JWT_REFRESH_EXPIRES_IN` | **YES** | Default refresh-token validity. |
