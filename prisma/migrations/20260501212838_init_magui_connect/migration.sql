-- CreateEnum
CREATE TYPE "MaguiConnectStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED');

-- CreateTable
CREATE TABLE "MaguiConnectProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "MaguiConnectStatus" NOT NULL DEFAULT 'DRAFT',
    "slug" TEXT,
    "displayName" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "ogImageUrl" TEXT,
    "domain" TEXT,
    "professionalCategory" TEXT,
    "location" TEXT,
    "companyName" TEXT,
    "publicEmail" TEXT,
    "publicPhone" TEXT,
    "whatsapp" TEXT,
    "primaryCtaLabel" TEXT,
    "primaryCtaUrl" TEXT,
    "themeAccent" TEXT,
    "themeBackground" TEXT DEFAULT '#0a0a0a',
    "themeForeground" TEXT DEFAULT '#f5f5f5',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaguiConnectProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaguiConnectLink" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'LINK',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaguiConnectLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaguiConnectPublishLog" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaguiConnectPublishLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaguiConnectProfile_userId_key" ON "MaguiConnectProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MaguiConnectProfile_slug_key" ON "MaguiConnectProfile"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MaguiConnectProfile_domain_key" ON "MaguiConnectProfile"("domain");

-- CreateIndex
CREATE INDEX "MaguiConnectProfile_status_idx" ON "MaguiConnectProfile"("status");

-- CreateIndex
CREATE INDEX "MaguiConnectProfile_domain_idx" ON "MaguiConnectProfile"("domain");

-- CreateIndex
CREATE INDEX "MaguiConnectLink_profileId_sortOrder_idx" ON "MaguiConnectLink"("profileId", "sortOrder");

-- CreateIndex
CREATE INDEX "MaguiConnectPublishLog_profileId_createdAt_idx" ON "MaguiConnectPublishLog"("profileId", "createdAt");

-- AddForeignKey
ALTER TABLE "MaguiConnectProfile" ADD CONSTRAINT "MaguiConnectProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaguiConnectLink" ADD CONSTRAINT "MaguiConnectLink_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "MaguiConnectProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaguiConnectPublishLog" ADD CONSTRAINT "MaguiConnectPublishLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "MaguiConnectProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
