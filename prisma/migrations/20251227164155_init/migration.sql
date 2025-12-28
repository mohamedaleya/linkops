-- CreateTable
CREATE TABLE "ShortLink" (
    "id" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "shortened_id" TEXT NOT NULL,
    "title" TEXT,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "redirectType" TEXT NOT NULL DEFAULT '307',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkClickDaily" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LinkClickDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortLink_shortened_id_key" ON "ShortLink"("shortened_id");

-- CreateIndex
CREATE UNIQUE INDEX "LinkClickDaily_linkId_date_key" ON "LinkClickDaily"("linkId", "date");

-- AddForeignKey
ALTER TABLE "LinkClickDaily" ADD CONSTRAINT "LinkClickDaily_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "ShortLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
