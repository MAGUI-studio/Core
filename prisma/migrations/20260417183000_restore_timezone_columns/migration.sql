-- Restore timezone columns required by the current Prisma schema.
ALTER TABLE "Update"
ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'UTC';

ALTER TABLE "Asset"
ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'UTC';
