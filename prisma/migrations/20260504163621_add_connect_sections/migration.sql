-- AlterTable
ALTER TABLE "MaguiConnectLink" ADD COLUMN     "sectionId" TEXT;

-- CreateTable
CREATE TABLE "MaguiConnectSection" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaguiConnectSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaguiConnectClickEvent" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaguiConnectClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MaguiConnectSection_profileId_sortOrder_idx" ON "MaguiConnectSection"("profileId", "sortOrder");

-- CreateIndex
CREATE INDEX "MaguiConnectClickEvent_profileId_idx" ON "MaguiConnectClickEvent"("profileId");

-- CreateIndex
CREATE INDEX "MaguiConnectClickEvent_linkId_idx" ON "MaguiConnectClickEvent"("linkId");

-- CreateIndex
CREATE INDEX "MaguiConnectClickEvent_createdAt_idx" ON "MaguiConnectClickEvent"("createdAt");

-- CreateIndex
CREATE INDEX "MaguiConnectLink_sectionId_idx" ON "MaguiConnectLink"("sectionId");

-- AddForeignKey
ALTER TABLE "MaguiConnectSection" ADD CONSTRAINT "MaguiConnectSection_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "MaguiConnectProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaguiConnectLink" ADD CONSTRAINT "MaguiConnectLink_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "MaguiConnectSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaguiConnectClickEvent" ADD CONSTRAINT "MaguiConnectClickEvent_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "MaguiConnectProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaguiConnectClickEvent" ADD CONSTRAINT "MaguiConnectClickEvent_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "MaguiConnectLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
