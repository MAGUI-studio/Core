ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'UPDATE_PUBLISHED';

CREATE TABLE "UpdateAttachment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "customId" TEXT,
    "type" "AssetType" NOT NULL DEFAULT 'DOCUMENT',
    "mimeType" TEXT,
    "size" INTEGER,
    "updateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpdateAttachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UpdateAttachment_updateId_idx" ON "UpdateAttachment"("updateId");
CREATE INDEX "UpdateAttachment_createdAt_idx" ON "UpdateAttachment"("createdAt");

ALTER TABLE "UpdateAttachment"
ADD CONSTRAINT "UpdateAttachment_updateId_fkey"
FOREIGN KEY ("updateId") REFERENCES "Update"("id") ON DELETE CASCADE ON UPDATE CASCADE;
