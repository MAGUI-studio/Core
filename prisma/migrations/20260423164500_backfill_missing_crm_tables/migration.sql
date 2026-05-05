DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'LeadActivityType'
  ) THEN
    CREATE TYPE "LeadActivityType" AS ENUM (
      'NOTE_CREATED',
      'STATUS_CHANGED',
      'SOURCE_UPDATED',
      'CONTACT_UPDATED',
      'WHATSAPP_LINK_OPENED',
      'LEAD_EDITED',
      'CONVERTED_TO_PROJECT',
      'REMINDER_SET'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "LeadActivity" (
  "id" TEXT NOT NULL,
  "type" "LeadActivityType" NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "leadId" TEXT NOT NULL,
  "authorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LeadActivity_leadId_idx"
ON "LeadActivity"("leadId");

CREATE INDEX IF NOT EXISTS "LeadActivity_authorId_idx"
ON "LeadActivity"("authorId");

CREATE INDEX IF NOT EXISTS "LeadActivity_createdAt_idx"
ON "LeadActivity"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'LeadActivity_leadId_fkey'
  ) THEN
    ALTER TABLE "LeadActivity"
    ADD CONSTRAINT "LeadActivity_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'LeadActivity_authorId_fkey'
  ) THEN
    ALTER TABLE "LeadActivity"
    ADD CONSTRAINT "LeadActivity_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "MessageTemplate" (
  "id" TEXT NOT NULL,
  "scope" TEXT NOT NULL DEFAULT 'LEAD',
  "name" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MessageTemplate_scope_createdAt_idx"
ON "MessageTemplate"("scope", "createdAt");

CREATE TABLE IF NOT EXISTS "SavedView" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "filtersJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SavedView_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SavedView_userId_module_name_key"
ON "SavedView"("userId", "module", "name");
