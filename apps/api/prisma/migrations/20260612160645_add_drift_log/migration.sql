-- Epic 1 Production Hardening: Inventory Drift Detection
-- Creates InventoryDriftLog table for Redis vs MySQL reconciliation auditing.

-- CreateTable: InventoryDriftLog
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

-- AddForeignKey: InventoryDriftLog -> Shop
ALTER TABLE `InventoryDriftLog` ADD CONSTRAINT `InventoryDriftLog_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: InventoryDriftLog -> Product
ALTER TABLE `InventoryDriftLog` ADD CONSTRAINT `InventoryDriftLog_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
