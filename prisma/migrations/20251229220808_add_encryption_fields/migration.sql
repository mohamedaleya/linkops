-- AlterTable
ALTER TABLE "short_link" ADD COLUMN     "encryptedUrl" TEXT,
ADD COLUMN     "encryptionIv" TEXT,
ADD COLUMN     "isEncrypted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "dekSalt" TEXT,
ADD COLUMN     "encryptionEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recoverySalt" TEXT,
ADD COLUMN     "recoveryWrappedDek" TEXT,
ADD COLUMN     "wrappedDek" TEXT;
