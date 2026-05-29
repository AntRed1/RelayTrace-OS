-- ============================================================================
-- Migration: add_billing_plans_and_ocr_pipeline
--
-- Captures all schema changes applied via `prisma db push` that were not
-- included in previous migrations:
--
--   Company          → Stripe customer/subscription IDs
--   AuditLog         → ipAddress, userAgent, LONGTEXT metadata, createdAt index
--   Plan             → new table (DB-driven pricing)
--   ProcessedWebhookEvent → new table (Stripe idempotency)
--   OCRResult        → blobPath, status, errorMessage, processingTimeMs, updatedAt
--   Trip             → ocrStatus + index
-- ============================================================================

-- ── Company: Stripe IDs ───────────────────────────────────────────────────────

ALTER TABLE `Company`
    ADD COLUMN `stripeCustomerId`     VARCHAR(191) NULL,
    ADD COLUMN `stripeSubscriptionId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Company_stripeCustomerId_key`     ON `Company`(`stripeCustomerId`);
CREATE UNIQUE INDEX `Company_stripeSubscriptionId_key` ON `Company`(`stripeSubscriptionId`);

-- ── AuditLog: extended columns ────────────────────────────────────────────────

ALTER TABLE `AuditLog`
    ADD COLUMN `ipAddress` VARCHAR(191) NULL,
    ADD COLUMN `userAgent` VARCHAR(191) NULL;

ALTER TABLE `AuditLog` MODIFY COLUMN `metadata` LONGTEXT NOT NULL;

CREATE INDEX `AuditLog_createdAt_idx` ON `AuditLog`(`createdAt`);

-- ── Plan: DB-driven pricing plans ────────────────────────────────────────────

CREATE TABLE `Plan` (
    `id`              VARCHAR(191)   NOT NULL,
    `slug`            VARCHAR(191)   NOT NULL,
    `displayName`     VARCHAR(191)   NOT NULL,
    `description`     TEXT           NOT NULL,
    `priceMonthly`    DECIMAL(10, 2) NOT NULL,
    `currency`        VARCHAR(191)   NOT NULL DEFAULT 'USD',
    `maxDrivers`      INTEGER        NULL,
    `featureLabels`   TEXT           NOT NULL,
    `featureFlags`    TEXT           NOT NULL,
    `isActive`        BOOLEAN        NOT NULL DEFAULT true,
    `isPopular`       BOOLEAN        NOT NULL DEFAULT false,
    `sortOrder`       INTEGER        NOT NULL DEFAULT 0,
    `ctaLabel`        VARCHAR(191)   NOT NULL DEFAULT 'Get Started',
    `stripePriceId`   VARCHAR(191)   NULL,
    `stripeProductId` VARCHAR(191)   NULL,
    `createdAt`       DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`       DATETIME(3)    NOT NULL,

    UNIQUE INDEX `Plan_slug_key`(`slug`),
    INDEX `Plan_isActive_idx`(`isActive`),
    INDEX `Plan_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ── ProcessedWebhookEvent: Stripe idempotency guard ──────────────────────────

CREATE TABLE `ProcessedWebhookEvent` (
    `id`            VARCHAR(191) NOT NULL,
    `stripeEventId` VARCHAR(191) NOT NULL,
    `processedAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ProcessedWebhookEvent_stripeEventId_key`(`stripeEventId`),
    INDEX `ProcessedWebhookEvent_stripeEventId_idx`(`stripeEventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ── OCRResult: full pipeline fields ──────────────────────────────────────────

ALTER TABLE `OCRResult`
    ADD COLUMN `blobPath`         VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `status`           VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `errorMessage`     TEXT         NULL,
    ADD COLUMN `processingTimeMs` INTEGER      NULL,
    ADD COLUMN `updatedAt`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- rawText was required; make it optional (populated only on successful OCR)
ALTER TABLE `OCRResult` MODIFY COLUMN `rawText` TEXT NULL;

CREATE INDEX `OCRResult_status_idx` ON `OCRResult`(`status`);

-- ── Trip: OCR pipeline status ────────────────────────────────────────────────

ALTER TABLE `Trip` ADD COLUMN `ocrStatus` VARCHAR(191) NOT NULL DEFAULT 'none';

CREATE INDEX `Trip_ocrStatus_idx` ON `Trip`(`ocrStatus`);
