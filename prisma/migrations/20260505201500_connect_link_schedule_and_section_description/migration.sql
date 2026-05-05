ALTER TABLE "MaguiConnectProfile"
DROP COLUMN IF EXISTS "themeBackground",
DROP COLUMN IF EXISTS "themeForeground";

ALTER TABLE "MaguiConnectSection"
ADD COLUMN IF NOT EXISTS "description" TEXT;

ALTER TABLE "MaguiConnectLink"
ADD COLUMN IF NOT EXISTS "startsAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
