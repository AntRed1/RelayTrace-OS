-- CreateTable
CREATE TABLE `Reconciliation` (
    `id` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `tripId` VARCHAR(191) NULL,
    `relayEmailLogId` VARCHAR(191) NOT NULL,
    `matched` BOOLEAN NOT NULL DEFAULT false,
    `discrepancyReason` VARCHAR(191) NULL,
    `checkedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Reconciliation_companyId_idx`(`companyId`),
    INDEX `Reconciliation_tripId_idx`(`tripId`),
    INDEX `Reconciliation_relayEmailLogId_idx`(`relayEmailLogId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reconciliation` ADD CONSTRAINT `Reconciliation_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reconciliation` ADD CONSTRAINT `Reconciliation_relayEmailLogId_fkey` FOREIGN KEY (`relayEmailLogId`) REFERENCES `RelayEmailLog`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
