DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'ActionTargetRole'
  ) THEN
    CREATE TYPE "ActionTargetRole" AS ENUM ('ADMIN', 'CLIENT');
  END IF;
END $$;

ALTER TABLE "ActionItem"
ADD COLUMN IF NOT EXISTS "targetRole" "ActionTargetRole" NOT NULL DEFAULT 'ADMIN';

CREATE INDEX IF NOT EXISTS "ActionItem_targetRole_idx"
ON "ActionItem"("targetRole");
