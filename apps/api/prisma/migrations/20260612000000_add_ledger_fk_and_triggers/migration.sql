-- Epic 1 Production Hardening: Ledger, Outbox, and FK enforcement
-- Creates LedgerTransaction and OutboxEvent tables with proper foreign keys
-- and ledger immutability triggers.

-- CreateTable: OutboxEvent
CREATE TABLE `OutboxEvent` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `error` VARCHAR(191) NULL,
    `retryCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,

    INDEX `OutboxEvent_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: LedgerTransaction
CREATE TABLE `LedgerTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NULL,
    `account` ENUM('CASH', 'ACCOUNTS_RECEIVABLE', 'SALES_REVENUE', 'COST_OF_GOODS', 'INVENTORY', 'UDHAR_RECEIVABLE') NOT NULL,
    `type` ENUM('DEBIT', 'CREDIT') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `balanceAfter` DECIMAL(10, 2) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LedgerTransaction_shopId_createdAt_idx`(`shopId`, `createdAt`),
    INDEX `LedgerTransaction_invoiceId_idx`(`invoiceId`),
    INDEX `LedgerTransaction_shopId_account_idx`(`shopId`, `account`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: LedgerTransaction -> Shop
ALTER TABLE `LedgerTransaction` ADD CONSTRAINT `LedgerTransaction_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: LedgerTransaction -> Invoice
ALTER TABLE `LedgerTransaction` ADD CONSTRAINT `LedgerTransaction_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Ledger Immutability Trigger: Prevent UPDATE
CREATE TRIGGER prevent_ledger_update
BEFORE UPDATE ON `LedgerTransaction`
FOR EACH ROW
SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ledger records are strictly immutable. Corrections require compensating transactions.';

-- Ledger Immutability Trigger: Prevent DELETE
CREATE TRIGGER prevent_ledger_delete
BEFORE DELETE ON `LedgerTransaction`
FOR EACH ROW
SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ledger records are strictly immutable. Corrections require compensating transactions.';
