-- Add entitlement flag for MAGUI Connect access
ALTER TABLE "User"
ADD COLUMN "canAccessMaguiConnect" BOOLEAN NOT NULL DEFAULT false;

-- Add notification type for Connect access requests
ALTER TYPE "NotificationType"
ADD VALUE IF NOT EXISTS 'CONNECT_ACCESS_REQUEST';

-- Remove cancelled MAGUI Connect publication fields
ALTER TABLE "MaguiConnectProfile"
DROP COLUMN IF EXISTS "status",
DROP COLUMN IF EXISTS "publishedAt",
DROP COLUMN IF EXISTS "lastSyncedAt";

-- Remove cancelled MAGUI Connect link restriction fields
ALTER TABLE "MaguiConnectLink"
DROP COLUMN IF EXISTS "startsAt",
DROP COLUMN IF EXISTS "expiresAt",
DROP COLUMN IF EXISTS "passwordHash";

-- Remove cancelled publish log table
DROP TABLE IF EXISTS "MaguiConnectPublishLog";

-- Remove legacy enum after dropping dependent column
DROP TYPE IF EXISTS "MaguiConnectStatus";
