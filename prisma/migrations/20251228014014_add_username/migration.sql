/*
  Warnings:

  - You are about to drop the `LinkClickDaily` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShortLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LinkClickDaily" DROP CONSTRAINT "LinkClickDaily_linkId_fkey";

-- DropTable
DROP TABLE "LinkClickDaily";

-- DropTable
DROP TABLE "ShortLink";

-- CreateTable
CREATE TABLE "short_link" (
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
    "userId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "short_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_referrer_daily" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "referrer" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "link_referrer_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_geo_daily" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "country" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "link_geo_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_click_daily" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "link_click_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "short_link_shortened_id_key" ON "short_link"("shortened_id");

-- CreateIndex
CREATE UNIQUE INDEX "link_referrer_daily_linkId_date_referrer_key" ON "link_referrer_daily"("linkId", "date", "referrer");

-- CreateIndex
CREATE UNIQUE INDEX "link_geo_daily_linkId_date_country_key" ON "link_geo_daily"("linkId", "date", "country");

-- CreateIndex
CREATE UNIQUE INDEX "link_click_daily_linkId_date_key" ON "link_click_daily"("linkId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- AddForeignKey
ALTER TABLE "short_link" ADD CONSTRAINT "short_link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_referrer_daily" ADD CONSTRAINT "link_referrer_daily_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "short_link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_geo_daily" ADD CONSTRAINT "link_geo_daily_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "short_link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_click_daily" ADD CONSTRAINT "link_click_daily_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "short_link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
