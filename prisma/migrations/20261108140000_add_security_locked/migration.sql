-- AlterTable
ALTER TABLE "short_link" ADD COLUMN "securityLocked" BOOLEAN NOT NULL DEFAULT false;

-- Lock links that were blocked by hand during the Nov 2026 incident review,
-- so the automatic rescan can never clear them.
UPDATE "short_link"
SET "securityLocked" = true
WHERE "securityStatus" = 'unsafe'
  AND "securityReason" LIKE '%(manual review)%';
