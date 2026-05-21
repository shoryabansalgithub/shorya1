/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `auditlog` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `auditlog` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `inventorylog` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `inventorylog` table. All the data in the column will be lost.
  - The values [RETURN,TRANSFER] on the enum `InventoryLog_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `quantityBefore` on the `inventorylog` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,3)`.
  - You are about to alter the column `quantityChange` on the `inventorylog` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,3)`.
  - You are about to alter the column `quantityAfter` on the `inventorylog` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,3)`.
  - The values [RETURNED] on the enum `Invoice_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `unit` on the `invoiceitem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(7))`.
  - You are about to alter the column `gstRate` on the `invoiceitem` table. The data in that column could be lost. The data in that column will be cast from `Double` to `Enum(EnumId(8))`.
  - You are about to alter the column `gstRate` on the `product` table. The data in that column could be lost. The data in that column will be cast from `Double` to `Enum(EnumId(8))`.
  - You are about to alter the column `currentStock` on the `product` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,3)`.
  - You are about to alter the column `reorderPoint` on the `product` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,3)`.
  - You are about to alter the column `reorderQty` on the `product` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,3)`.
  - You are about to drop the column `ownerId` on the `shop` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `udhartransaction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `udhartransaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopId,phone,deletedAt]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopId,financialYear,invoiceNumber]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopId,sku,deletedAt]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cgstAmount` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `financialYear` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sgstAmount` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxableAmount` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `LoginAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wholesalePrice` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `auditlog` DROP FOREIGN KEY `AuditLog_shopId_fkey`;

-- DropForeignKey
ALTER TABLE `auditlog` DROP FOREIGN KEY `AuditLog_userId_fkey`;

-- DropForeignKey
ALTER TABLE `category` DROP FOREIGN KEY `Category_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `category` DROP FOREIGN KEY `Category_shopId_fkey`;

-- DropForeignKey
ALTER TABLE `customer` DROP FOREIGN KEY `Customer_shopId_fkey`;

-- DropForeignKey
ALTER TABLE `inventorylog` DROP FOREIGN KEY `InventoryLog_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `inventorylog` DROP FOREIGN KEY `InventoryLog_productId_fkey`;

-- DropForeignKey
ALTER TABLE `inventorylog` DROP FOREIGN KEY `InventoryLog_recordedById_fkey`;

-- DropForeignKey
ALTER TABLE `inventorylog` DROP FOREIGN KEY `InventoryLog_shopId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_cashierId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_shiftId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_shopId_fkey`;

-- DropForeignKey
ALTER TABLE `invoiceitem` DROP FOREIGN KEY `InvoiceItem_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `invoiceitem` DROP FOREIGN KEY `InvoiceItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_shopId_fkey`;

-- DropForeignKey
ALTER TABLE `refreshtoken` DROP FOREIGN KEY `RefreshToken_userId_fkey`;

-- DropForeignKey
ALTER TABLE `shift` DROP FOREIGN KEY `Shift_closedById_fkey`;

-- DropForeignKey
ALTER TABLE `shift` DROP FOREIGN KEY `Shift_openedById_fkey`;

-- DropForeignKey
ALTER TABLE `shift` DROP FOREIGN KEY `Shift_shopId_fkey`;

-- DropForeignKey
ALTER TABLE `shop` DROP FOREIGN KEY `Shop_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `udhartransaction` DROP FOREIGN KEY `UdharTransaction_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `udhartransaction` DROP FOREIGN KEY `UdharTransaction_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `udhartransaction` DROP FOREIGN KEY `UdharTransaction_recordedById_fkey`;

-- DropForeignKey
ALTER TABLE `udhartransaction` DROP FOREIGN KEY `UdharTransaction_shopId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_shopId_fkey`;

-- DropIndex
DROP INDEX `AuditLog_shopId_fkey` ON `auditlog`;

-- DropIndex
DROP INDEX `AuditLog_userId_fkey` ON `auditlog`;

-- DropIndex
DROP INDEX `Customer_shopId_phone_idx` ON `customer`;

-- DropIndex
DROP INDEX `Customer_shopId_phone_key` ON `customer`;

-- DropIndex
DROP INDEX `InventoryLog_productId_fkey` ON `inventorylog`;

-- DropIndex
DROP INDEX `InventoryLog_shopId_fkey` ON `inventorylog`;

-- DropIndex
DROP INDEX `Invoice_shopId_invoiceNumber_key` ON `invoice`;

-- DropIndex
DROP INDEX `Product_shopId_categoryId_idx` ON `product`;

-- DropIndex
DROP INDEX `Product_shopId_sku_key` ON `product`;

-- DropIndex
DROP INDEX `Shift_shopId_fkey` ON `shift`;

-- DropIndex
DROP INDEX `Shop_ownerId_key` ON `shop`;

-- DropIndex
DROP INDEX `UdharTransaction_customerId_fkey` ON `udhartransaction`;

-- DropIndex
DROP INDEX `UdharTransaction_shopId_fkey` ON `udhartransaction`;

-- AlterTable
ALTER TABLE `auditlog` DROP COLUMN `isDeleted`,
    DROP COLUMN `updatedAt`,
    MODIFY `shopId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `category` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `customer` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `lastPaymentAt` DATETIME(3) NULL,
    ADD COLUMN `state` VARCHAR(191) NULL,
    ADD COLUMN `tags` VARCHAR(191) NULL,
    ADD COLUMN `totalPaid` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `inventorylog` DROP COLUMN `isDeleted`,
    DROP COLUMN `updatedAt`,
    MODIFY `type` ENUM('SALE', 'PURCHASE', 'RETURN_IN', 'RETURN_OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'DAMAGE', 'OPENING') NOT NULL,
    MODIFY `quantityBefore` DECIMAL(10, 3) NOT NULL,
    MODIFY `quantityChange` DECIMAL(10, 3) NOT NULL,
    MODIFY `quantityAfter` DECIMAL(10, 3) NOT NULL;

-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `cancelReason` VARCHAR(191) NULL,
    ADD COLUMN `cgstAmount` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `financialYear` VARCHAR(191) NOT NULL,
    ADD COLUMN `igstAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `isInterState` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `originalId` VARCHAR(191) NULL,
    ADD COLUMN `paymentRef` VARCHAR(191) NULL,
    ADD COLUMN `roundOffAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `sgstAmount` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `taxableAmount` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `type` ENUM('SALE', 'SALES_RETURN') NOT NULL DEFAULT 'SALE',
    ADD COLUMN `udharAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    MODIFY `status` ENUM('DRAFT', 'COMPLETED', 'CANCELLED') NOT NULL;

-- AlterTable
ALTER TABLE `invoiceitem` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    MODIFY `quantity` DECIMAL(10, 3) NOT NULL,
    MODIFY `unit` ENUM('PCS', 'KG', 'GM', 'LTR', 'ML', 'BOX', 'PACK', 'DOZEN', 'BUNDLE') NOT NULL,
    MODIFY `discountPercent` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    MODIFY `gstRate` ENUM('ZERO', 'FIVE', 'TWELVE', 'EIGHTEEN', 'TWENTYEIGHT') NOT NULL;

-- AlterTable
ALTER TABLE `loginattempt` ADD COLUMN `userAgent` VARCHAR(191) NULL,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `cessRate` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `hasExpiry` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `supplierId` VARCHAR(191) NULL,
    ADD COLUMN `wholesalePrice` DECIMAL(10, 2) NOT NULL,
    MODIFY `gstRate` ENUM('ZERO', 'FIVE', 'TWELVE', 'EIGHTEEN', 'TWENTYEIGHT') NOT NULL DEFAULT 'EIGHTEEN',
    MODIFY `currentStock` DECIMAL(10, 3) NOT NULL DEFAULT 0,
    MODIFY `reorderPoint` DECIMAL(10, 3) NOT NULL DEFAULT 10,
    MODIFY `reorderQty` DECIMAL(10, 3) NOT NULL DEFAULT 50,
    MODIFY `unit` ENUM('PCS', 'KG', 'GM', 'LTR', 'ML', 'BOX', 'PACK', 'DOZEN', 'BUNDLE') NOT NULL;

-- AlterTable
ALTER TABLE `shift` ADD COLUMN `cardSales` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `cashSales` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `totalReceipts` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `totalSales` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `udharSales` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `upiSales` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `shop` DROP COLUMN `ownerId`,
    ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `udhartransaction` DROP COLUMN `isDeleted`,
    DROP COLUMN `updatedAt`,
    MODIFY `type` ENUM('CREDIT', 'PAYMENT', 'ADJUSTMENT', 'WRITEOFF') NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `ProductBatch` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `batchNumber` VARCHAR(191) NOT NULL,
    `expiryDate` DATETIME(3) NULL,
    `costPrice` DECIMAL(10, 2) NOT NULL,
    `mrp` DECIMAL(10, 2) NOT NULL,
    `sellingPrice` DECIMAL(10, 2) NOT NULL,
    `initialStock` DECIMAL(10, 3) NOT NULL,
    `currentStock` DECIMAL(10, 3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    INDEX `ProductBatch_productId_idx`(`productId`),
    INDEX `ProductBatch_shopId_expiryDate_idx`(`shopId`, `expiryDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supplier` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `gstin` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    INDEX `Supplier_shopId_idx`(`shopId`),
    UNIQUE INDEX `Supplier_shopId_phone_deletedAt_key`(`shopId`, `phone`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrder` (
    `id` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    INDEX `PurchaseOrder_shopId_status_idx`(`shopId`, `status`),
    INDEX `PurchaseOrder_supplierId_idx`(`supplierId`),
    UNIQUE INDEX `PurchaseOrder_shopId_orderNumber_deletedAt_key`(`shopId`, `orderNumber`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `purchaseOrderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(10, 3) NOT NULL,
    `unitCost` DECIMAL(10, 2) NOT NULL,
    `cgstAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `sgstAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `igstAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `totalCost` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    INDEX `PurchaseOrderItem_purchaseOrderId_idx`(`purchaseOrderId`),
    INDEX `PurchaseOrderItem_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockTransfer` (
    `id` VARCHAR(191) NOT NULL,
    `sourceShopId` VARCHAR(191) NOT NULL,
    `destinationShopId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `totalItems` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    INDEX `StockTransfer_sourceShopId_idx`(`sourceShopId`),
    INDEX `StockTransfer_destinationShopId_idx`(`destinationShopId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockTransferItem` (
    `id` VARCHAR(191) NOT NULL,
    `stockTransferId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(10, 3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    INDEX `StockTransferItem_stockTransferId_idx`(`stockTransferId`),
    INDEX `StockTransferItem_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `type` ENUM('LOW_STOCK', 'UDHAR_OVERDUE', 'SHIFT_NOT_CLOSED', 'PAYMENT_RECEIVED', 'LARGE_DISCOUNT', 'SUSPICIOUS_ACTIVITY') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    INDEX `Notification_shopId_isRead_idx`(`shopId`, `isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `AuditLog_shopId_entity_idx` ON `AuditLog`(`shopId`, `entity`);

-- CreateIndex
CREATE INDEX `AuditLog_userId_createdAt_idx` ON `AuditLog`(`userId`, `createdAt`);

-- CreateIndex
CREATE INDEX `AuditLog_shopId_createdAt_idx` ON `AuditLog`(`shopId`, `createdAt`);

-- CreateIndex
CREATE INDEX `Customer_shopId_idx` ON `Customer`(`shopId`);

-- CreateIndex
CREATE UNIQUE INDEX `Customer_shopId_phone_deletedAt_key` ON `Customer`(`shopId`, `phone`, `deletedAt`);

-- CreateIndex
CREATE INDEX `InventoryLog_productId_createdAt_idx` ON `InventoryLog`(`productId`, `createdAt`);

-- CreateIndex
CREATE INDEX `InventoryLog_shopId_type_idx` ON `InventoryLog`(`shopId`, `type`);

-- CreateIndex
CREATE INDEX `InventoryLog_shopId_createdAt_idx` ON `InventoryLog`(`shopId`, `createdAt`);

-- CreateIndex
CREATE INDEX `Invoice_originalId_idx` ON `Invoice`(`originalId`);

-- CreateIndex
CREATE INDEX `Invoice_shopId_createdAt_idx` ON `Invoice`(`shopId`, `createdAt`);

-- CreateIndex
CREATE UNIQUE INDEX `Invoice_shopId_financialYear_invoiceNumber_key` ON `Invoice`(`shopId`, `financialYear`, `invoiceNumber`);

-- CreateIndex
CREATE INDEX `LoginAttempt_userId_idx` ON `LoginAttempt`(`userId`);

-- CreateIndex
CREATE INDEX `Product_shopId_idx` ON `Product`(`shopId`);

-- CreateIndex
CREATE INDEX `Product_supplierId_idx` ON `Product`(`supplierId`);

-- CreateIndex
CREATE UNIQUE INDEX `Product_shopId_sku_deletedAt_key` ON `Product`(`shopId`, `sku`, `deletedAt`);

-- CreateIndex
CREATE FULLTEXT INDEX `Product_name_aliases_idx` ON `Product`(`name`, `aliases`);

-- CreateIndex
CREATE INDEX `Shift_shopId_status_idx` ON `Shift`(`shopId`, `status`);

-- CreateIndex
CREATE INDEX `Shift_shopId_openedAt_idx` ON `Shift`(`shopId`, `openedAt`);

-- CreateIndex
CREATE INDEX `UdharTransaction_customerId_createdAt_idx` ON `UdharTransaction`(`customerId`, `createdAt`);

-- CreateIndex
CREATE INDEX `UdharTransaction_shopId_type_idx` ON `UdharTransaction`(`shopId`, `type`);

-- RenameIndex
ALTER TABLE `category` RENAME INDEX `Category_parentId_fkey` TO `Category_parentId_idx`;

-- RenameIndex
ALTER TABLE `category` RENAME INDEX `Category_shopId_fkey` TO `Category_shopId_idx`;

-- RenameIndex
ALTER TABLE `inventorylog` RENAME INDEX `InventoryLog_invoiceId_fkey` TO `InventoryLog_invoiceId_idx`;

-- RenameIndex
ALTER TABLE `inventorylog` RENAME INDEX `InventoryLog_recordedById_fkey` TO `InventoryLog_recordedById_idx`;

-- RenameIndex
ALTER TABLE `invoice` RENAME INDEX `Invoice_cashierId_fkey` TO `Invoice_cashierId_idx`;

-- RenameIndex
ALTER TABLE `invoice` RENAME INDEX `Invoice_shiftId_fkey` TO `Invoice_shiftId_idx`;

-- RenameIndex
ALTER TABLE `invoiceitem` RENAME INDEX `InvoiceItem_invoiceId_fkey` TO `InvoiceItem_invoiceId_idx`;

-- RenameIndex
ALTER TABLE `invoiceitem` RENAME INDEX `InvoiceItem_productId_fkey` TO `InvoiceItem_productId_idx`;

-- RenameIndex
ALTER TABLE `product` RENAME INDEX `Product_categoryId_fkey` TO `Product_categoryId_idx`;

-- RenameIndex
ALTER TABLE `shift` RENAME INDEX `Shift_closedById_fkey` TO `Shift_closedById_idx`;

-- RenameIndex
ALTER TABLE `shift` RENAME INDEX `Shift_openedById_fkey` TO `Shift_openedById_idx`;

-- RenameIndex
ALTER TABLE `udhartransaction` RENAME INDEX `UdharTransaction_invoiceId_fkey` TO `UdharTransaction_invoiceId_idx`;

-- RenameIndex
ALTER TABLE `udhartransaction` RENAME INDEX `UdharTransaction_recordedById_fkey` TO `UdharTransaction_recordedById_idx`;
