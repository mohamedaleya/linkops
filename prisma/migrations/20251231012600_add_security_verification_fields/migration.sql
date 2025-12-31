-- AlterTable
ALTER TABLE "short_link" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "securityStatus" TEXT NOT NULL DEFAULT 'unknown';
