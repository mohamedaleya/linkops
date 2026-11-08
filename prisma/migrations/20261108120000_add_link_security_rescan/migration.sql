-- AlterTable
ALTER TABLE "short_link" ADD COLUMN "securityReason" TEXT,
ADD COLUMN "lastSecurityCheckAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "short_link_lastSecurityCheckAt_idx" ON "short_link"("lastSecurityCheckAt");
