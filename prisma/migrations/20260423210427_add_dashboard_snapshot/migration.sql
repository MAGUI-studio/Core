-- CreateEnum
CREATE TYPE "AssetOrigin" AS ENUM ('ADMIN', 'CLIENT');

-- CreateEnum
CREATE TYPE "AssetVisibility" AS ENUM ('INTERNAL', 'CLIENT');

-- DropIndex
DROP INDEX "ActionItem_dueDate_idx";

-- DropIndex
DROP INDEX "ActionItem_projectId_idx";

-- DropIndex
DROP INDEX "ActionItem_status_idx";

-- DropIndex
DROP INDEX "Asset_order_idx";

-- DropIndex
DROP INDEX "Asset_projectId_idx";

-- DropIndex
DROP INDEX "AuditLog_createdAt_idx";

-- DropIndex
DROP INDEX "AuditLog_projectId_idx";

-- DropIndex
DROP INDEX "Lead_assignedToId_idx";

-- DropIndex
DROP INDEX "Lead_nextActionAt_idx";

-- DropIndex
DROP INDEX "Lead_status_idx";

-- DropIndex
DROP INDEX "Notification_createdAt_idx";

-- DropIndex
DROP INDEX "Notification_readAt_idx";

-- DropIndex
DROP INDEX "Notification_userId_idx";

-- DropIndex
DROP INDEX "Project_clientId_idx";

-- DropIndex
DROP INDEX "Project_status_idx";

-- DropIndex
DROP INDEX "Project_updatedAt_idx";

-- DropIndex
DROP INDEX "ScheduledReminder_recipientUserId_status_idx";

-- DropIndex
DROP INDEX "ScheduledReminder_scheduledFor_idx";

-- DropIndex
DROP INDEX "Update_approvalStatus_idx";

-- DropIndex
DROP INDEX "Update_createdAt_idx";

-- DropIndex
DROP INDEX "Update_projectId_idx";

-- DropIndex
DROP INDEX "UpdateAttachment_createdAt_idx";

-- DropIndex
DROP INDEX "UpdateAttachment_updateId_idx";

-- DropIndex
DROP INDEX "Version_createdAt_idx";

-- DropIndex
DROP INDEX "Version_projectId_idx";

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "origin" "AssetOrigin" NOT NULL DEFAULT 'ADMIN',
ADD COLUMN     "visibility" "AssetVisibility" NOT NULL DEFAULT 'CLIENT';

-- AlterTable
ALTER TABLE "MessageTemplate" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SavedView" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "DashboardMetricSnapshot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeProjects" INTEGER NOT NULL,
    "completedProjects" INTEGER NOT NULL,
    "pendingApprovals" INTEGER NOT NULL,
    "totalLeads" INTEGER NOT NULL,
    "convertedLeads" INTEGER NOT NULL,
    "negotiationValue" DOUBLE PRECISION NOT NULL,
    "avgApprovalHours" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BriefingEntry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BriefingEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalEvent" (
    "id" TEXT NOT NULL,
    "decision" "ApprovalStatus" NOT NULL,
    "comment" TEXT,
    "updateId" TEXT NOT NULL,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DashboardMetricSnapshot_date_idx" ON "DashboardMetricSnapshot"("date");

-- CreateIndex
CREATE INDEX "BriefingEntry_projectId_idx" ON "BriefingEntry"("projectId");

-- CreateIndex
CREATE INDEX "ApprovalEvent_updateId_idx" ON "ApprovalEvent"("updateId");

-- CreateIndex
CREATE INDEX "ApprovalEvent_actorId_idx" ON "ApprovalEvent"("actorId");

-- CreateIndex
CREATE INDEX "ActionItem_status_dueDate_idx" ON "ActionItem"("status", "dueDate");

-- CreateIndex
CREATE INDEX "ActionItem_projectId_status_dueDate_idx" ON "ActionItem"("projectId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Asset_projectId_visibility_order_idx" ON "Asset"("projectId", "visibility", "order");

-- CreateIndex
CREATE INDEX "Asset_projectId_createdAt_idx" ON "Asset"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_projectId_createdAt_idx" ON "AuditLog"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_status_updatedAt_idx" ON "Lead"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Lead_status_nextActionAt_idx" ON "Lead"("status", "nextActionAt");

-- CreateIndex
CREATE INDEX "Lead_assignedToId_status_updatedAt_idx" ON "Lead"("assignedToId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Project_status_updatedAt_idx" ON "Project"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Project_clientId_updatedAt_idx" ON "Project"("clientId", "updatedAt");

-- CreateIndex
CREATE INDEX "ScheduledReminder_recipientUserId_status_scheduledFor_idx" ON "ScheduledReminder"("recipientUserId", "status", "scheduledFor");

-- CreateIndex
CREATE INDEX "Update_projectId_createdAt_idx" ON "Update"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "Update_requiresApproval_approvalStatus_createdAt_idx" ON "Update"("requiresApproval", "approvalStatus", "createdAt");

-- CreateIndex
CREATE INDEX "UpdateAttachment_updateId_createdAt_idx" ON "UpdateAttachment"("updateId", "createdAt");

-- CreateIndex
CREATE INDEX "Version_projectId_createdAt_idx" ON "Version"("projectId", "createdAt");

-- AddForeignKey
ALTER TABLE "BriefingEntry" ADD CONSTRAINT "BriefingEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalEvent" ADD CONSTRAINT "ApprovalEvent_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "Update"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalEvent" ADD CONSTRAINT "ApprovalEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
