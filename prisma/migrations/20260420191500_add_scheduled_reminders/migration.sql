-- CreateEnum
CREATE TYPE "ScheduledReminderType" AS ENUM (
  'LEAD_STALLED',
  'APPROVAL_PENDING',
  'PROJECT_SILENT',
  'ACTION_ITEM_OVERDUE'
);

-- CreateEnum
CREATE TYPE "ScheduledReminderStatus" AS ENUM (
  'PENDING',
  'SENT',
  'RESOLVED',
  'DISMISSED'
);

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'OPERATIONAL_REMINDER';

-- CreateTable
CREATE TABLE "ScheduledReminder" (
  "id" TEXT NOT NULL,
  "type" "ScheduledReminderType" NOT NULL,
  "status" "ScheduledReminderStatus" NOT NULL DEFAULT 'PENDING',
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "ctaPath" TEXT,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "sentAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "metadata" JSONB,
  "recipientUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ScheduledReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduledReminder_recipientUserId_status_idx" ON "ScheduledReminder"("recipientUserId", "status");

-- CreateIndex
CREATE INDEX "ScheduledReminder_type_status_idx" ON "ScheduledReminder"("type", "status");

-- CreateIndex
CREATE INDEX "ScheduledReminder_scheduledFor_idx" ON "ScheduledReminder"("scheduledFor");

-- CreateIndex
CREATE INDEX "ScheduledReminder_entityType_entityId_idx" ON "ScheduledReminder"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledReminder_recipientUserId_type_entityId_key" ON "ScheduledReminder"("recipientUserId", "type", "entityId");

-- AddForeignKey
ALTER TABLE "ScheduledReminder"
ADD CONSTRAINT "ScheduledReminder_recipientUserId_fkey"
FOREIGN KEY ("recipientUserId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
