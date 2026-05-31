-- AlterTable
ALTER TABLE `auditlog` MODIFY `metadata` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `ocrresult` ALTER COLUMN `blobPath` DROP DEFAULT,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `trip` ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL;
