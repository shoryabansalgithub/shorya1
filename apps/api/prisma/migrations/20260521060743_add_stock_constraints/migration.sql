-- Epic 1 Production Hardening: Stock constraints and idempotency
-- This migration adds stockVersion for optimistic concurrency control
-- and idempotencyKey for duplicate invoice prevention.

-- Add stockVersion to Product for optimistic locking
ALTER TABLE `Product` ADD COLUMN `stockVersion` INTEGER NOT NULL DEFAULT 0;

-- Add idempotencyKey to Invoice for duplicate prevention
ALTER TABLE `Invoice` ADD COLUMN `idempotencyKey` VARCHAR(191) NOT NULL;

-- Create unique constraint for idempotency
CREATE UNIQUE INDEX `Invoice_shopId_idempotencyKey_key` ON `Invoice`(`shopId`, `idempotencyKey`);

-- Add idempotencyKey index for fast lookups
CREATE INDEX `Invoice_idempotencyKey_idx` ON `Invoice`(`idempotencyKey`);
