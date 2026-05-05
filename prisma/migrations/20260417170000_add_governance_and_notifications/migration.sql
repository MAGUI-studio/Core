-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER', 'CLIENT');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('REFERRAL', 'ORGANIC', 'INSTAGRAM', 'LINKEDIN', 'WEBSITE', 'OUTBOUND', 'EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('UPDATE_PENDING_APPROVAL', 'UPDATE_APPROVED', 'UPDATE_REJECTED', 'BRIEFING_SUBMITTED', 'ASSET_UPLOADED', 'PROJECT_STATUS_CHANGED', 'LEAD_ASSIGNED');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('SYSTEM', 'USER');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN     "role_new" "UserRole" NOT NULL DEFAULT 'CLIENT';

UPDATE "User"
SET "role_new" = CASE UPPER(COALESCE("role", 'CLIENT'))
    WHEN 'ADMIN' THEN 'ADMIN'::"UserRole"
    WHEN 'MEMBER' THEN 'MEMBER'::"UserRole"
    ELSE 'CLIENT'::"UserRole"
END;

ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" RENAME COLUMN "role_new" TO "role";

-- AlterTable
ALTER TABLE "Lead"
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "lastContactAt" TIMESTAMP(3),
ADD COLUMN     "nextActionAt" TIMESTAMP(3),
ADD COLUMN     "source" "LeadSource" NOT NULL DEFAULT 'OTHER';

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ctaPath" TEXT,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "actorType" "AuditActorType" NOT NULL DEFAULT 'SYSTEM',
    "actorId" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");

-- CreateIndex
CREATE INDEX "Lead_nextActionAt_idx" ON "Lead"("nextActionAt");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_updatedAt_idx" ON "Project"("updatedAt");

-- CreateIndex
CREATE INDEX "Update_projectId_idx" ON "Update"("projectId");

-- CreateIndex
CREATE INDEX "Update_approvalStatus_idx" ON "Update"("approvalStatus");

-- CreateIndex
CREATE INDEX "Update_createdAt_idx" ON "Update"("createdAt");

-- CreateIndex
CREATE INDEX "ActionItem_projectId_idx" ON "ActionItem"("projectId");

-- CreateIndex
CREATE INDEX "ActionItem_status_idx" ON "ActionItem"("status");

-- CreateIndex
CREATE INDEX "ActionItem_dueDate_idx" ON "ActionItem"("dueDate");

-- CreateIndex
CREATE INDEX "Asset_projectId_idx" ON "Asset"("projectId");

-- CreateIndex
CREATE INDEX "Asset_order_idx" ON "Asset"("order");

-- CreateIndex
CREATE INDEX "Version_projectId_idx" ON "Version"("projectId");

-- CreateIndex
CREATE INDEX "Version_createdAt_idx" ON "Version"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_readAt_idx" ON "Notification"("readAt");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_projectId_idx" ON "Notification"("projectId");

-- CreateIndex
CREATE INDEX "AuditLog_projectId_idx" ON "AuditLog"("projectId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
