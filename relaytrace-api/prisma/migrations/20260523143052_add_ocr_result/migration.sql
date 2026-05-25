-- CreateTable
CREATE TABLE `OCRResult` (
    `id` VARCHAR(191) NOT NULL,
    `tripId` VARCHAR(191) NOT NULL,
    `extractedTripId` VARCHAR(191) NULL,
    `confidenceScore` DOUBLE NOT NULL DEFAULT 0,
    `rawText` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OCRResult_tripId_idx`(`tripId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OCRResult` ADD CONSTRAINT `OCRResult_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
