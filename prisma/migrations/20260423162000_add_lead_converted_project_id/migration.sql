ALTER TABLE "Lead"
ADD COLUMN IF NOT EXISTS "convertedProjectId" TEXT;

CREATE INDEX IF NOT EXISTS "Lead_convertedProjectId_idx"
ON "Lead"("convertedProjectId");
