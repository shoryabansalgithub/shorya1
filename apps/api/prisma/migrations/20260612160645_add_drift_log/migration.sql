/*
  Warnings:

  - You are about to alter the column `status` on the `purchaseorder` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(11))`.
  - You are about to alter the column `status` on the `stocktransfer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(12))`.

*/
-- DropForeignKey
ALTER TABLE `ledgertransaction` DROP FOREIGN KEY `LedgerTransaction_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `ledgertransaction` DROP FOREIGN KEY `LedgerTransaction_shopId_fkey`;

-- DropIndex
DROP INDEX `InventoryLog_shopId_createdAt_idx` ON `inventorylog`;

-- AlterTable
ALTER TABLE `purchaseorder` MODIFY `status` ENUM('DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `stocktransfer` MODIFY `status` ENUM('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `InventoryDriftLog` (
    `id` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `redisValue` DECIMAL(10, 3) NOT NULL,
    `databaseValue` DECIMAL(10, 3) NOT NULL,
    `difference` DECIMAL(10, 3) NOT NULL,
    `status` ENUM('DETECTED', 'REPAIRED', 'FAILED') NOT NULL DEFAULT 'DETECTED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolvedAt` DATETIME(3) NULL,

    INDEX `InventoryDriftLog_shopId_createdAt_idx`(`shopId`, `createdAt`),
    INDEX `InventoryDriftLog_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
