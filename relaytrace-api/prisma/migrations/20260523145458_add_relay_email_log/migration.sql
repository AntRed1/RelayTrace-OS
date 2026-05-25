-- CreateTable
CREATE TABLE `RelayEmailLog` (
    `id` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `relayTripId` VARCHAR(191) NOT NULL,
    `emailTimestamp` DATETIME(3) NOT NULL,
    `parsedData` TEXT NOT NULL,
    `reconciliationStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RelayEmailLog_companyId_idx`(`companyId`),
    INDEX `RelayEmailLog_relayTripId_idx`(`relayTripId`),
    INDEX `RelayEmailLog_reconciliationStatus_idx`(`reconciliationStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RelayEmailLog` ADD CONSTRAINT `RelayEmailLog_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
